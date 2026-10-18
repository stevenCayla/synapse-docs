---
title: Security
description: "Overview of the application's security mechanisms: authentication,
  session management, password policy, access control, audit logging and HTTP
  hardening."
slug: en/3.0/security/readme
---

## Purpose

This document describes the security features implemented in the application.

It provides a functional and technical overview of the mechanisms in place to protect:

* user accounts,
* authenticated sessions,
* sensitive data,
* access to business features,
* security event traceability.

This section is intended for developers, reviewers, QA, security stakeholders, and compliance stakeholders.

***

## Related documents

* [Security settings](/en/3.0/security/settings/)
* [Implementation status](/en/3.0/security/implementation-status/)
* [QA checklist](/3.0/qa/security-checklist/)

***

## Scope

The security scope covered by this document includes:

* authentication,
* session management,
* password policy,
* forced password renewal flows,
* brute-force protection,
* access control,
* security logging,
* HTTP hardening,
* privacy-by-design measures.

***

## Security objectives

The implemented measures aim to:

* protect user sessions against misuse,
* reduce the risk of unauthorized access,
* enforce password hygiene,
* protect sensitive routes and features,
* improve traceability of critical security events,
* align the application with strong security practices and privacy principles.

***

## Security feature summary

| Feature | Status | Configurable | Description |
|---|---|---:|---|
| Session inactivity timeout | Implemented | Yes | Automatically expires authenticated sessions after a defined inactivity period |
| Session expiration warning modal | Implemented | Yes | Displays a countdown modal before automatic logout |
| Explicit session extension | Implemented | Yes | Allows the user to actively extend the session before timeout |
| Automatic logout on inactivity | Implemented | Yes | Ends the session and redirects the user to login |
| Forced password change on first login | Implemented | Yes | Forces the user to change the password before accessing business pages |
| Forced password change after reset | Implemented | Yes | Applies the same flow when a temporary or reset password is used |
| Password policy validation | Implemented | Yes | Enforces configurable password complexity rules |
| Password confirmation check | Implemented | No | Requires password confirmation during password change |
| Password history control | Implemented | Yes | Prevents reuse of the last N passwords |
| Login throttling | Implemented | Yes | Limits repeated login attempts |
| Temporary lockout | Implemented | Yes | Temporarily blocks login after repeated failures |
| Access restriction while password change is pending | Implemented | No | Prevents access to business routes until password is changed |
| Security event logging | Implemented | Yes | Logs security-relevant events |
| Secure session cookie policy | Implemented | Partially | Uses secure cookie configuration for authenticated sessions |
| CSRF protection | Implemented | No | Protects forms and sensitive actions |
| HTTP security headers | Implemented | Partially | Adds hardening headers where enabled |
| MFA for privileged accounts | Planned | Yes | Future improvement for sensitive accounts |

***

## Centralized security settings

Security settings are centralized in the application configuration under the `security` section.

### Available settings

| Setting | Description |
|---|---|
| `session_inactivity_timeout_seconds` | Maximum allowed inactivity duration before session expiration |
| `session_warning_countdown_seconds` | Countdown duration displayed before session expiration |
| `password_min_length` | Minimum password length |
| `password_require_uppercase` | Requires at least one uppercase letter |
| `password_require_lowercase` | Requires at least one lowercase letter |
| `password_require_digit` | Requires at least one digit |
| `password_require_special_char` | Requires at least one special character |
| `password_history_count` | Number of previously used passwords that cannot be reused |
| `force_password_change_on_first_login` | Forces password change on first successful login |
| `password_rotation_days` | Optional password renewal interval |
| `max_failed_login_attempts` | Maximum number of failed login attempts before temporary lockout |
| `lockout_duration_minutes` | Temporary lockout duration after too many failures |
| `enable_login_throttling` | Enables login attempt throttling |
| `audit_log_enabled` | Enables security-related logging |

### Recommended default values

| Setting | Recommended value |
|---|---|
| `session_inactivity_timeout_seconds` | `900` |
| `session_warning_countdown_seconds` | `60` |
| `password_min_length` | `12` |
| `password_require_uppercase` | `true` |
| `password_require_lowercase` | `true` |
| `password_require_digit` | `true` |
| `password_require_special_char` | `true` |
| `password_history_count` | `5` |
| `force_password_change_on_first_login` | `true` |
| `password_rotation_days` | `null` for standard users |
| `max_failed_login_attempts` | `5` |
| `lockout_duration_minutes` | `15` |
| `enable_login_throttling` | `true` |
| `audit_log_enabled` | `true` |

***

## Authentication

### Protected access

Application access is restricted to authenticated users for protected routes.

Authentication controls are enforced server-side.

### Login flow

The login flow includes:

* identity verification,
* password verification,
* optional throttling and lockout protections,
* redirection control after successful authentication,
* forced password change redirection when required.

### Logout flow

Users can explicitly log out.

Logout also occurs automatically when:

* the session expires because of inactivity,
* the session is invalidated by security logic.

***

## Session management

### Inactivity timeout

Authenticated sessions automatically expire after a configurable inactivity period.

**Setting used:** `session_inactivity_timeout_seconds`

The inactivity check is performed server-side to ensure that security does not depend only on frontend behavior.

### Warning before expiration

Before the session expires, the user is informed through a modal window showing a countdown.

**Setting used:** `session_warning_countdown_seconds`

The modal allows the user to:

* extend the session,
* or let it expire automatically.

### Automatic logout

If no valid activity is detected before the countdown ends:

* the session is invalidated,
* the user is logged out,
* the user is redirected to the login page,
* a message can indicate that the session expired due to inactivity.

### Session extension

The user may explicitly extend the session from the warning modal.

This action calls a secured backend endpoint that refreshes the activity timestamp if the session is still valid.

### Session hardening measures

The following protections are applied:

* server-side inactivity enforcement,
* session invalidation on expiration,
* session identifier regeneration after login,
* protection against session fixation,
* secure session cookie configuration,
* `HttpOnly` cookies,
* `Secure` cookies in HTTPS environments,
* appropriate `SameSite` policy.

***

## Forced password change

### First login or temporary password

A password change can be enforced after a successful login in the following cases:

* first login,
* temporary password,
* password reset,
* `mustChangePassword = true`.

### Restricted access until completion

As long as the password change is pending:

* business routes are blocked,
* only the required routes remain accessible, such as:
  * logout,
  * forced password change page,
  * password change submission endpoint,
  * optional session keepalive route if needed.

### Post-change updates

Once the password is successfully changed:

* `mustChangePassword` is disabled,
* `passwordChangedAt` is updated,
* the password is hashed before storage,
* a security event may be logged.

***

## Password policy

The application enforces a configurable password policy.

### Supported rules

The following rules can be activated:

* minimum length,
* uppercase requirement,
* lowercase requirement,
* digit requirement,
* special character requirement.

### Server-side validation

Password policy validation is enforced server-side.

Frontend checks only improve usability and do not replace backend validation.

### Frontend guidance

The password change form may provide real-time visual guidance to:

* show which requirements are satisfied,
* confirm that the new password and confirmation match.

***

## Password history

To reduce password reuse, the application can store a history of previous password hashes.

**Setting used:** `password_history_count`

When enabled:

* the user cannot reuse the last N passwords,
* only password hashes are stored,
* plaintext passwords are never stored.

***

## Password renewal policy

The application supports a configurable password renewal interval through:

* `password_rotation_days`

This policy should be applied only where justified, such as:

* privileged accounts,
* high-risk access scopes,
* accounts subject to stricter internal policies.

> Password rotation should not be enforced blindly for all users without risk-based justification.

***

## Brute-force protection

### Login throttling

The application can limit repeated login attempts.

**Settings used:**

* `enable_login_throttling`
* `max_failed_login_attempts`

### Temporary lockout

After too many failed attempts:

* login may be temporarily blocked,
* the user must wait until the lockout duration has elapsed.

**Setting used:** `lockout_duration_minutes`

### Security objective

These protections help reduce risks related to:

* brute-force attacks,
* credential stuffing,
* repeated automated login attempts.

***

## Access control

The application uses server-side access control to protect routes and actions.

### Principles

* public routes are limited to what is strictly necessary,
* business routes require authentication,
* sensitive actions are restricted to authorized roles,
* users flagged for forced password change are blocked from normal application access until compliance.

### Security objective

Each user should only access the features required for their functional scope.

***

## Security logging and auditability

### Logged events

When audit logging is enabled, the following events may be recorded:

* successful login,
* failed login,
* temporary lockout,
* automatic logout due to inactivity,
* password change,
* denied access due to pending forced password change,
* administrative reset or forced update when applicable.

### Logging principles

Security logging follows these principles:

* no password or secret is logged,
* personal data is minimized,
* events are structured for analysis,
* logging remains proportional to the security need.

***

## HTTP and application hardening

The application includes or plans the following hardening measures:

* CSRF protection on forms and sensitive actions,
* safe template escaping,
* secure session cookie handling,
* server-side authorization checks,
* reduced exposure of sensitive data,
* HTTP security headers where supported.

### Security headers

Depending on application configuration, the following headers may be used:

* `X-Frame-Options`
* `Content-Security-Policy`
* `Referrer-Policy`
* `X-Content-Type-Options`

***

## User interface security features

### Session expiration modal

A modal is displayed before session expiration to:

* warn the user,
* show a countdown,
* allow explicit session extension.

### Forced password change page

The password change page provides:

* new password input,
* password confirmation input,
* password rule guidance,
* server-side validated submission.

***

## Sensitive data protection

### TOTP secret encryption at rest

`User.totpSecret` is encrypted in the database using symmetric authenticated encryption (XSalsa20-Poly1305 via `sodium_crypto_secretbox`).

**Mechanism:**

* `EncryptionService` handles encryption and decryption using a 32-byte key stored in `APP_TOTP_ENCRYPTION_KEY`.
* `TotpEncryptionListener` (Doctrine event listener) transparently encrypts secrets before write and decrypts them after load.
* Encrypted values are prefixed with `ENC:` followed by base64url(nonce || ciphertext).
* Legacy plain-text values (before encryption was activated) are detected and returned as-is for migration compatibility; they are re-encrypted on the next write.

**Key management:**

* Generate: `php -r "echo base64_encode(random_bytes(32));"`
* Store in environment variable `APP_TOTP_ENCRYPTION_KEY` — never in version control.
* For production: use Symfony Secrets (`bin/console secrets:set APP_TOTP_ENCRYPTION_KEY`) or an external vault.

**Migration:**

* Migration `Version20260411160000` encrypts all existing plain-text TOTP secrets.
* The migration is idempotent: already-encrypted values are skipped.

### Activity log pseudonymization

Activity logs (`ActivityLog.subject`) must never contain directly identifiable patient data.

**Rule applied:**

* Patient full name (`getFullName()`) is never written to activity logs.
* References use pseudonymous identifiers:
  * `patient#<id>` when referencing a `Patient` entity directly (e.g., on add)
  * `inclusion#<id>` when referencing a `StudyPatient` link (e.g., on eCRF save, visit update)
* These identifiers are traceable to a real patient via the database under appropriate authorization, but are not directly identifiable from the log alone.

***

## Symfony-native security behaviors (confirmed, no code change required)

### plainPassword is never persisted or serialized (Point 1)

`User.plainPassword` is a transient field: it has no `#[ORM\Column]` annotation and is never persisted to the database.

During the login flow, `plainPassword` is **never set**. The submitted password travels exclusively through `PasswordCredentials` (a Passport badge), which is separate from the `User` entity.

Symfony calls `AbstractSessionListener::onKernelResponse()` before every response, which calls `token.eraseCredentials()` → `user.eraseCredentials()` → `$this->plainPassword = null`. This ensures `plainPassword` is cleared before session serialization.

In Symfony 7+, the session stores only the user identifier (email/username), not the full `User` object. Even if `plainPassword` were accidentally set, it would not reach the session.

### PasswordCredentials is cleared after verification (Point 4)

During login, the submitted password is passed to `PasswordCredentials($password)` on the `Passport` object. Symfony's `CheckCredentialsListener::checkPassport()` verifies the password, then calls `PasswordCredentials::markResolved()` which executes `$this->password = ''`.

The password is therefore cleared from the Passport immediately after verification, before `LoginSuccessEvent` is dispatched.

The 2FA context (TOTP check via `TwoFactorSubscriber`) is triggered on a **new HTTP request** that does not carry any password parameter. The password is not available in any in-memory object at that point.

**Residual risk (development only):** The Symfony profiler collects POST parameters on `/login` in `APP_ENV=dev`. This is expected behavior for a development tool and has no impact in production where the profiler is disabled.

***

## Technical implementation overview

Depending on the current project architecture, the security implementation may rely on:

* Symfony security configuration,
* Symfony session management,
* route access control,
* dedicated event subscribers,
* dedicated security controllers,
* password validators,
* form types,
* centralized security settings provider,
* password history persistence,
* structured security logging,
* application-level column encryption (TOTP secrets).

***

## Main entities and components

The implementation may include the following application elements:

| Component | Purpose |
|---|---|
| `SecuritySettingsProvider` | Centralized access to security settings |
| `User` entity | Stores security-related user flags and timestamps |
| `PasswordHistory` entity | Stores previous password hashes |
| `EncryptionService` | Symmetric authenticated encryption for sensitive fields (sodium secretbox) |
| `TotpEncryptionListener` | Transparent ORM encryption/decryption of `User.totpSecret` |
| Session inactivity subscriber | Enforces inactivity timeout server-side |
| Forced password change subscriber | Blocks normal access until password change is completed |
| Security controller | Manages login-related and password-related actions |
| Session controller | Manages keepalive or session-specific endpoints |
| Password validator | Applies the password policy |
| Twig templates | Renders security-related pages and modals |
| JavaScript helpers | Provides non-authoritative UX enhancements |

***

## Functional acceptance criteria

The following behaviors are expected:

### Session timeout

* an authenticated inactive user is logged out after the configured timeout,
* a warning modal is displayed before expiration,
* clicking “extend session” refreshes the session only if still valid,
* expired sessions cannot be silently revived client-side.

### Forced password change

* users flagged with `mustChangePassword` are redirected after login,
* business pages remain inaccessible until the password is changed,
* after a valid password change, access is restored.

### Password policy

* invalid passwords are rejected server-side,
* valid passwords are accepted and stored as hashes,
* password confirmation must match,
* password history prevents reuse when enabled.

### Login protection

* repeated failed logins trigger throttling and/or lockout,
* successful login resets or updates the failure state according to the configured logic.

### Logging

* major security events are logged,
* no sensitive secret is written to logs.

***

## Compliance and privacy considerations

The implemented features support the following principles:

* data minimization,
* protection of sensitive data,
* controlled access based on role and business need,
* traceability of sensitive events,
* separation between UX logic and security logic,
* server-side enforcement of security decisions.

***

## Known limitations

The following points may remain outside the current scope or be only partially implemented:

* multi-factor authentication,
* advanced anomaly detection,
* enriched audit trail with correlation,
* centralized security alerting,
* privileged access review workflows,
* formal retention policy for security logs,
* full privacy impact assessment support.

***

## Planned improvements

The following improvements can be considered in future iterations:

* MFA for privileged or sensitive accounts,
* enhanced security monitoring,
* alerting on suspicious login behavior,
* periodic review of roles and permissions,
* more advanced audit trail features,
* formalized security log retention policy,
* compliance-oriented access reviews,
* privacy impact assessment when required.

***

## Change log

| Date | Change | Author |
|---|---|---|
| YYYY-MM-DD | Initial security documentation | Team |
