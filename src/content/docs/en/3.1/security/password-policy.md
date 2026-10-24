---
title: Password policy
description: Password complexity rules, breach and common-password checks,
  history, rotation, forced change and the password reset flow, as implemented
  in Synapse Medical.
slug: en/3.1/security/password-policy
---

Every rule on this page is checked **on the server**. The browser-side strength meter
(`assets/js/password-strength.js`) only gives visual feedback and never replaces the
server-side check.

| Component | Role |
|-----------|------|
| `SecuritySettingsProvider` | Loads the policy parameters and checks their bounds when the container boots |
| `PasswordPolicyService` | Validates a plain password and returns one error per failed rule |
| `CommonPasswordChecker` | Rejects common passwords and weak patterns |
| `HibpPasswordChecker` | Checks the password against Have I Been Pwned (k-anonymity) |
| `PasswordHistoryService` | Blocks reuse of recent passwords |
| `PasswordPolicy` / `PasswordPolicyValidator` | Symfony constraint that calls `PasswordPolicyService` |
| `ForcePasswordChangeSubscriber` | Forces a password change (first login, admin reset, rotation) |
| `PasswordResetService` | Self-service reset by email |

## 1. Configuration

The policy is set at **deployment time** in `config/packages/security_settings.yaml`.
No screen lets users change it at runtime (see [Security settings](/en/3.1/security/settings/)).

| Parameter (`app.security.*`) | Default | Bound checked at boot |
|------------------------------|---------|------------------------|
| `password_min_length` | `12` | `>= 8` (ANSSI minimum) |
| `password_require_uppercase` | `true` | – |
| `password_require_lowercase` | `true` | – |
| `password_require_digit` | `true` | – |
| `password_require_special_char` | `true` | – |
| `password_history_count` | `5` | `>= 0` (`0` turns history off) |
| `password_rotation_days` | `90` | `null` or `>= 30` |
| `force_password_change_on_first_login` | `true` | – |

:::caution[Invalid values stop the container]
`SecuritySettingsProvider::validate()` throws a `LogicException` when a value is out of
bounds. A bad configuration therefore fails when the app **starts**, not later in production.
:::

## 2. Validation rules

`PasswordPolicyService::validate()` checks the rules in this order:

| # | Rule | Check |
|---|------|-------|
| 1 | Minimum length | `mb_strlen($password) >= password_min_length` |
| 2 | Uppercase letter | `/[A-Z]/` (when enabled) |
| 3 | Lowercase letter | `/[a-z]/` (when enabled) |
| 4 | Digit | `/\d/` (when enabled) |
| 5 | Special character | `/[\W_]/` (when enabled) |
| 6 | Not a common password | `CommonPasswordChecker::isCommon()` |
| 7 | Not found in a known breach | `HibpPasswordChecker::isPwned()`, **only if rules 1–6 all pass** |

### Common passwords and weak patterns

`CommonPasswordChecker` rejects a password when **any** of these is true:

* it equals (case-insensitive) an entry in a built-in list of about 70 common passwords.
  The list includes French and healthcare terms such as `motdepasse`, `azerty`, `hospital`
  and `medical`;
* it **contains** a keyboard or sequence pattern (`azerty`, `qwerty`, `123456`, `abcdef`,
  `abcd1234`, …);
* it is a single character repeated 6 or more times;
* it is made only of digits.

### Breach check (Have I Been Pwned)

* Only the first **5 characters** of the SHA-1 hash are sent to
  `api.pwnedpasswords.com/range/` (k-anonymity), with the `Add-Padding: true` header.
* TLS peer verification is on and the timeout is **3 seconds**.
* **Fail-open**: if the API cannot be reached, the check is skipped and a warning is
  logged. This avoids blocking password changes during a network outage.

:::note
The service never logs the password or any part of it. Stored passwords are hashed with
Symfony's `auto` password hasher (`config/packages/security.yaml`).
:::

## 3. Where the policy applies

| Entry point | Full policy (rules 1–7) | History check |
|-------------|:-----------------------:|:-------------:|
| Admin user form (`UserType`, `PasswordPolicy` constraint) | ✅ | – |
| Forced change page (`/security/change-password`) | ✅ | ✅ |
| Password reset by email (`/password-reset/{token}`) | ✅ | ✅ |
| Invitation acceptance (`InvitationController`) | ⚠️ hard-coded rules | – |
| Admin user-creation wizard (AJAX, `UserController`) | ⚠️ hard-coded rules | – |

:::caution[Known gap: two entry points do not use the central policy]
The invitation acceptance form and the AJAX user-creation wizard check the password with
**hard-coded** rules: 12 characters, one uppercase letter, one digit and one special
character from a fixed list. They do not check for a lowercase letter, common passwords or
breaches, and they ignore the values in `security_settings.yaml`. The invitation form also
uses `strlen()`, which counts bytes rather than characters. In the wizard case the risk is
limited because the user must pick a new password at first login, and that page applies the
full policy.
:::

## 4. Password history

* The **5** most recent hashes (`password_history_count`) are stored in `password_history`.
  Only hashes are stored, never plain text.
* A new password is compared with each stored hash through
  `UserPasswordHasherInterface::isPasswordValid()`. This works even if the hashing cost
  has changed since an entry was stored.
* The current hash is saved **before** it is replaced (`recordCurrentPassword()`). Entries
  beyond the limit are then deleted (`purgeExcess()`).
* The error message on the forced change page always says "last 5". The number is
  hard-coded and does not follow the setting.

## 5. Forced password change

`User.mustChangePassword = true` sends the user to `app_force_password_change` on every
request until a new password is set.

| Trigger | Where |
|---------|-------|
| An admin creates the account (form or wizard) | `UserController`: set every time |
| An admin forces a reset from the user page | `UserController` (with an optional reason, written to the `ActivityLog`) |
| Rotation: `passwordChangedAt` is older than `password_rotation_days` (90), or empty | `ForcePasswordChangeSubscriber::checkPasswordRotation()` |

Accounts created through an **invitation** start with `mustChangePassword = false` and
`passwordChangedAt = now`, because the user chose the password.

:::note[`force_password_change_on_first_login` is not read]
The parameter is loaded into `SecuritySettingsProvider`, but no code reads it. The flag is
set **every time** an admin creates an account, whatever the parameter's value.
:::

While the change is pending, only these paths stay reachable: `/login`, `/logout`, `/2fa`,
`/security/`, `/password-reset`, and the debug routes `/_profiler` and `/_wdt`.
Impersonation sessions (`SwitchUserToken`) are exempt.

After a successful change:

1. `mustChangePassword` is cleared and `passwordChangedAt` is updated.
2. The change is recorded in the security audit log (`logPasswordChanged`).
3. **All** of the user's tracked sessions are deactivated, the current session is
   invalidated, and the user must sign in again.

## 6. Password reset by email

`PasswordResetService` + `PasswordResetController` (`/password-reset`, public route).

| Control | Value |
|---------|-------|
| Token | `bin2hex(random_bytes(32))`, sent by email; only its **SHA-256** hash is stored |
| Lifetime | **15 minutes** (`TOKEN_TTL_MINUTES`) |
| Requests per user | at most **3 per hour** (`MAX_REQUESTS_PER_HOUR`) |
| Link visits | the token stops working after **3** GET visits (`clickCount < 3`) |
| Single use | `usedAt` is set when the token is used |
| Account enumeration | the same message is shown whether or not the email exists |
| After the reset | policy and history checks, all sessions revoked, confirmation email sent |
| Audit | `logPasswordResetRequested` and `logPasswordResetCompleted` (with the IP address) |

An administrator can also send a reset email from the user page
(`app_user_send_reset_password`, `ROLE_ADMIN`, CSRF protected).

:::tip
Too many failed logins lock the account (see [Session management](/en/3.1/security/session-management/)
and [Implementation status](/en/3.1/security/implementation-status/)). The lockout message
suggests resetting the password. A successful reset does **not** unlock a *permanently*
locked account: only an administrator can do that (`app_user_unlock`).
:::
