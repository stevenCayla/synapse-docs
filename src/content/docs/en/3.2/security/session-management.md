---
title: Session management
description: "How Synapse Medical protects authenticated sessions: inactivity
  timeout, per-session 2FA, multi-device tracking and remote revocation, cookie
  hardening, login throttling and session data retention."
slug: en/3.2/security/session-management
---

Session security has several layers, and each is **enforced by the server**. The
JavaScript code only warns the user before a timeout.

| Layer | Component | Purpose |
|-------|-----------|---------|
| PHP session | `framework.yaml`, `frankenphp/conf.d/10-app.ini` | Cookie flags, strict mode, garbage collection |
| Inactivity timeout | `SessionInactivitySubscriber` | Logs the user out after 15 min without activity |
| Client warning | `assets/js/session-guard.js`, `KeepaliveController`, `SessionExpireController` | Shows a warning modal, extends or ends the session |
| 2FA per session | `TwoFactorSubscriber`, `TotpController` | Requires a TOTP check in each new session |
| Device tracking | `SessionEnforcementSubscriber`, `UserSession` | Limits concurrent sessions, supports remote revocation |
| Brute-force protection | `login_throttling`, `LoginSecuritySubscriber` | Throttles logins, locks accounts step by step |
| Retention | `app:retention:prune-sessions` | Deletes old inactive session records |

## 1. PHP session and cookies

| Setting | Value | Source |
|---------|-------|--------|
| `cookie_httponly` | `true` | `config/packages/framework.yaml` |
| `cookie_secure` | `auto` (HTTPS-only when the request is HTTPS) | `framework.yaml` |
| `cookie_samesite` | `lax` | `framework.yaml` |
| `gc_maxlifetime` | `1800` s (server-side safety net) | `framework.yaml` |
| `session.use_strict_mode` | `1` (rejects session IDs the server did not issue) | `frankenphp/conf.d/10-app.ini` |

The logout route (`app_logout`) is CSRF protected (`csrf_token_id: logout`).
`LogoutSubscriber` records every manual logout in the security audit log.

:::note[Remember-me is not effective]
The firewall declares `remember_me` (7 days). However, the login template has no
`_remember_me` field, and every application route requires `IS_AUTHENTICATED_FULLY`. A
remembered token alone therefore never grants access to protected pages.
:::

## 2. Inactivity timeout

| Parameter (`app.security.*`) | Default | Bound checked at boot |
|------------------------------|---------|------------------------|
| `session_inactivity_timeout_seconds` | `900` (15 min) | `>= 60` |
| `session_warning_countdown_seconds` | `60` | `>= 10` and `<` timeout |

**Server side (source of truth).** `SessionInactivitySubscriber` runs on every main
request (priority `5`):

1. It reads `_security.last_activity_at` from the server-side session.
2. If more than `session_inactivity_timeout_seconds` have passed, it logs the event
   (`logLogoutInactivity`), **invalidates** the session, removes the security token and
   redirects to `/login` with a flash message.
3. Otherwise it saves the current time as the new activity timestamp.

The check skips `/login`, `/logout`, `/2fa`, `/security/`, `/_profiler` and `/_wdt`.
Impersonation sessions (`SwitchUserToken`) never expire through this check.

**Client side (warning only).** `session-guard.js` reads the timeout values from the
`#session-guard-cfg` element:

* User activity (`mousemove`, `keydown`, `click`, `scroll`, `touchstart`, throttled to
  once every 2 s) restarts the local countdown.
* `session_warning_countdown_seconds` before the timeout, a modal shows a countdown.
* **Extend** sends `POST /security/keepalive` (CSRF token `keepalive`,
  `IS_AUTHENTICATED_FULLY`). This refreshes the server timestamp and, at most once every
  5 minutes, `User.lastActivityAt`.
* When the countdown reaches zero, the script sends `POST /security/expire`, which
  invalidates the session on the server. That route is public, because the session may
  already be expired, but it only accepts XHR requests (`X-Requested-With`) and returns
  no data.
* Open tabs are kept in sync through `BroadcastChannel` (`session_activity`). Nothing is
  written to `localStorage` or `sessionStorage`.

:::tip
If JavaScript is turned off or the browser tab is asleep, the server still enforces the
timeout on the next request.
:::

## 3. Two-factor authentication per session

`TwoFactorSubscriber` (priority `0`) makes TOTP mandatory for every authenticated user:

| State | Redirect |
|-------|----------|
| No TOTP secret, or secret not yet verified | `/2fa/setup` |
| Enrolled, but no `_2fa_completed` flag in this session | `/2fa/check` |
| `_2fa_completed = true` | request continues |

The `_2fa_completed` flag lives in the PHP session. A new session, for example after a
timeout, a revocation or a password change, therefore requires a new TOTP or backup code.
TOTP details (secret encryption, 10 single-use backup codes) are in
[Implementation status](/en/3.2/security/implementation-status/).

## 4. Multi-device tracking and revocation

`SessionEnforcementSubscriber` stores each login as a `UserSession` row.

| Control | Value |
|---------|-------|
| Session tracking token | `bin2hex(random_bytes(32))`, kept in the PHP session (`_session.token`) and in `user_session.session_token` |
| Device cookie | `_syn_did`, 64 hex characters, **1 year**, `HttpOnly`, `SameSite=Lax`, `Secure` over HTTPS |
| One session per device | logging in again from the same browser deactivates that device's previous session |
| Concurrent sessions | at most **3** per user; the oldest ones are deactivated first |
| Database check | at most **once every 60 s** per session (`VALIDATE_TTL`) |
| Stored metadata | IP address, User-Agent, `createdAt`, `lastActivityAt`, `isActive` |

When the database check finds no active row for the current token, the PHP session is
invalidated and the user is sent back to `/login` ("session revoked").

:::caution[Revocation delay]
Because the database check runs at most once a minute, a revoked session can stay usable
for up to **60 seconds**. Sessions opened before tracking was added (no `_session.token`)
are not checked.
:::

**What revokes sessions:**

| Action | Scope | Where |
|--------|-------|-------|
| User revokes one session | one session (a user's own, or any session for `ROLE_SUPER_ADMIN`) | `POST /settings/sessions/{token}/kill` |
| User signs out all other devices | all sessions except the current one | `POST /settings/sessions/kill-others` |
| Admin revokes a user's sessions | all of that user's sessions (audit: `logSessionRevoked`) | `UserController` |
| Password change, reset, or admin-forced reset | all of the user's sessions | `ForcePasswordChangeController`, `PasswordResetService`, `UserController` |

All of these actions are POST requests protected by a CSRF token.

## 5. Login brute-force protection

Two independent mechanisms work together:

| Mechanism | Scope | Configuration |
|-----------|-------|---------------|
| Symfony `login_throttling` | IP address + username | `max_attempts: 5` in a `15 minutes` window (`max_failed_login_attempts`, `lockout_interval`) |
| Step-by-step account lockout (`LoginSecuritySubscriber`) | per account, stored in the database | see below |

| Consecutive failures | Lockout |
|:--------------------:|---------|
| 3 | 15 minutes |
| 6 | 1 hour |
| 9 | 24 hours |
| 12 | **permanent**: an admin must unlock the account (`app_user_unlock`, audit `logAccountUnlocked`) |

A successful login resets the counter. The error message for an unknown account is
deliberately vague, so it does not reveal whether the account exists. `UserChecker`
blocks disabled and soft-deleted accounts before the password is even checked.

:::note[Configuration notes]
* The lockout steps are **hard-coded** in `LoginSecuritySubscriber::LOCKOUT_TIERS`.
  `lockout_duration_minutes` is loaded into `SecuritySettingsProvider`, but no code reads it.
* `rate_limiter.yaml` defines an `app_login` limiter. `login_throttling` does not use it
  (there is no `limiter:` key), so Symfony builds its own limiter from `max_attempts` and
  `interval`.
* If you change `lockout_interval`, keep it consistent with `lockout_duration_minutes`.
:::

## 6. Order of request checks

| Priority | Subscriber | Effect |
|:--------:|------------|--------|
| 5 | `SessionInactivitySubscriber` | Inactivity timeout |
| 4 | `SessionEnforcementSubscriber` | Checks the session still exists in the database (remote revocation) |
| 0 | `TwoFactorSubscriber` | Requires 2FA |
| -5 | `ForcePasswordChangeSubscriber` | Requires a password change (see [Password policy](/en/3.2/security/password-policy/)) |
| -128 | `WorkspaceRlsSubscriber` | Sets `app.workspace_id` for PostgreSQL RLS, and clears it when the request ends (worker mode) |

## 7. Retention of session records

Deactivated `UserSession` rows are kept as a trace. The `app:retention:prune-sessions`
command deletes rows with `isActive = false` whose **`createdAt`** is older than
`--days` (default **30**).

```bash
bin/console app:retention:prune-sessions --dry-run   # always try this first
bin/console app:retention:prune-sessions --days=60
# suggested weekly cron: 0 3 * * 0 bin/console app:retention:prune-sessions
```

The cron entry is only a suggestion in the command's docblock. The repository does not set
up any scheduler.
