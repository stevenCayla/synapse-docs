---
title: "Implementation status"
description: "Status of each security control in Synapse Medical (implemented, partial, planned or not implemented), with the code that implements it."
---

This table shows what the code **actually does**, based on a review of the repository.
Use it together with [Compliance](/en/security/compliance/), which maps these controls to
HDS, GDPR/CNIL, ANSSI and 21 CFR Part 11.

| Status | Meaning |
|--------|---------|
| **Implemented** | In the code and active by default |
| **Partial** | In the code, with a known gap or limitation (see the notes) |
| **Planned** | Not in the code, listed as a future improvement |
| **Not implemented** | Not in the code, and not currently planned |

## Authentication and accounts

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Login form with CSRF, vague error message for unknown accounts | Implemented | `Security/UserAuthenticator` |
| Disabled or soft-deleted accounts blocked before the password check | Implemented | `Security/UserChecker` |
| Mandatory TOTP 2FA for every user (HDS) | Implemented | `EventSubscriber/TwoFactorSubscriber`, `Service/TotpService`, `Controller/TotpController` |
| TOTP secret created automatically for new accounts | Implemented | `UserController`, `InvitationService`, `app:totp:provision-missing` |
| 2FA backup codes (10 codes, `XXXX-XXXX`, SHA-256 hashed, single use; shown once right after the 2FA setup, regenerated from the profile) | Implemented | `Service/BackupCodeService`, `Entity/UserBackupCode`, `Controller/TotpController` |
| Admin reset of a user's 2FA (audited) | Implemented | `UserController` → `logTwoFactorReset` |
| Rate limiting of TOTP / backup-code attempts on `/2fa/check` | **Not implemented** | `TotpController::check()` has no attempt counter |
| Automatic disabling of accounts inactive for 90 days | Implemented (the command must be scheduled) | `app:users:auto-disable-inactive` (`--days`, default 90) |
| Guest workspace access expires (90 days by default) | Implemented | `InvitationService` / `WorkspaceUser` |

## Brute-force protection

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Framework login throttling (IP + username, 5 attempts / 15 min) | Implemented | `security.yaml` `login_throttling` |
| Account lockout in steps: 3 → 15 min, 6 → 1 h, 9 → 24 h, 12 → permanent | Implemented | `EventSubscriber/LoginSecuritySubscriber` |
| Admin unlock (with a reason, audited) | Implemented | `UserController::unlock()` → `logAccountUnlocked` |
| Lockout duration set through `lockout_duration_minutes` | **Partial** | The parameter is loaded but not read; the steps are hard-coded |
| Dedicated `app_login` rate limiter | **Partial** | Defined in `rate_limiter.yaml` but not referenced by `login_throttling` |

## Passwords

Details: [Password policy](/en/security/password-policy/).

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Configurable complexity (min 12, upper, lower, digit, special character) | Implemented | `Security/PasswordPolicyService`, `security_settings.yaml` |
| Common-password and keyboard-pattern check | Implemented | `Security/CommonPasswordChecker` |
| Breach check (HIBP k-anonymity, fail-open) | Implemented | `Security/HibpPasswordChecker` |
| Central policy applied on every password entry point | **Partial** | The invitation and user-wizard forms use hard-coded rules |
| Password history (last 5) | Implemented | `Security/PasswordHistoryService`: forced-change and reset flows only |
| Password rotation (90 days) | Implemented | `ForcePasswordChangeSubscriber::checkPasswordRotation()` |
| Forced change after an admin sets or resets a password | Implemented | `UserController`, `ForcePasswordChangeSubscriber` |
| `force_password_change_on_first_login` setting | **Partial** | Loaded but not read; the flag is always set when an admin creates an account |
| Email reset: hashed token, 15-min lifetime, 3 requests/h, 3 visits, single use | Implemented | `Service/PasswordResetService`, `PasswordResetTokenRepository` |
| Reset request form: CSRF token (`password_reset_request`), rate limits of 5 requests / 15 min per IP and 3 / 15 min per address (keys and logs hold an HMAC-SHA256 keyed with the application secret, never the clear value), generic answer and no e-mail when a limit is hit | Implemented | `Controller/PasswordResetController`, `Security/PasswordResetRequestThrottle`, `rate_limiter.yaml` |

## Sessions

Details: [Session management](/en/security/session-management/).

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Server-side inactivity timeout (900 s) | Implemented | `EventSubscriber/SessionInactivitySubscriber` |
| Warning modal, keepalive and client-triggered expiry | Implemented | `session-guard.js`, `KeepaliveController`, `SessionExpireController` |
| Hardened cookies (`HttpOnly`, `Secure` auto, `SameSite=Lax`), strict mode | Implemented | `framework.yaml`, `10-app.ini` |
| Per-device tracking, 3 concurrent sessions max | Implemented | `EventSubscriber/SessionEnforcementSubscriber`, `Entity/UserSession` |
| Remote revocation (self, super admin, admin, after a password change) | Implemented (up to 60 s delay) | `UserSessionController`, `UserController`, `UserSessionRepository` |
| Purge of old inactive sessions (30 days) | Implemented (the command must be scheduled) | `app:retention:prune-sessions` |

## Authorization and workspace isolation

Details: [Permissions](/en/security/permissions/).

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Workspace / study / site roles, enforced by Voters | Implemented | `Security/StudyVoter`, `Security/SiteVoter`, `Security/Voter/*` |
| Application-level filtering by the active workspace | Implemented | `ActiveWorkspaceContext`, `WorkspaceContextSubscriber`, repositories |
| PostgreSQL Row-Level Security | **Partial** | `study`, `patient` and `ecrf_record` only (migrations `Version20260429200000`, `Version20260429500000`, `Version20261022110000`), set by `WorkspaceRlsSubscriber` through `Security/Rls/RowLevelSecurity`; fails closed, application role `app_runtime` |
| Access-denied events logged | Implemented | `EventSubscriber/AccessDeniedSubscriber` → `logAccessDenied` |
| Study freeze (locks data entry) | Implemented | `Study::freeze()`, `StudyController` `app_study_freeze` |

:::note
The policies fail closed: an empty `app.workspace_id` shows no row. Console commands, the worker and platform code
that read across workspaces on purpose use the audited `RowLevelSecurity` helper (workspace of the processed object, or
a logged bypass). Tables other than the three above carry `workspace_id` but no policy: only the application checks
protect them.
:::

## Audit trail and e-signatures

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Security audit log in the database (login, lockout, password, 2FA, sessions…) | Implemented (can be turned off with `audit_log_enabled`) | `Security/SecurityAuditLogger`, `Entity/SecurityAuditLog` |
| Business activity log, scoped to a workspace, with an optional reason | Implemented | `Service/ActivityLogService`, `Entity/ActivityLog` |
| HMAC-SHA256 hash chain on `activity_log` (per workspace) | Implemented | `Service/ActivityLogIntegrityService` |
| Chain check from the command line | Implemented | `app:verify-audit-chain` and `app:audit:verify-chain` (two commands with overlapping roles) |
| Field-level eCRF audit trail with a mandatory reason for change on update/clear | Implemented | `Entity/EcrfValueAudit`, `Service/EcrfAuditWriter` |
| HMAC chain on `ecrf_value_audit` (per record) | Implemented (checked from the UI only, no CLI command) | `EcrfAuditWriter::verifyChain()`, `EcrfSignatureController` |
| Immutability triggers (UPDATE/DELETE blocked) | Implemented | `activity_log`, `security_audit_log` (`Version20260427110000`), `ecrf_value_audit` (`Version20260428000001`) |
| CSV export of the eCRF audit trail and chain check from the UI | Implemented | `Controller/AuditExportController` |
| E-signatures: password re-check, meaning, content hash, record lock | Implemented | `Service/EcrfSignatureService`, `Entity/EcrfSignature`, `Enum/SignatureMeaning` |

:::caution
The hash chains use `APP_SECRET` as the HMAC key. Rotating `APP_SECRET` makes every hash
computed before the rotation fail verification.
:::

## Data protection and GDPR

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Encryption at rest of the TOTP secret (XSalsa20-Poly1305) | Implemented | `Service/EncryptionService`, `EventListener/TotpEncryptionListener` (`APP_TOTP_ENCRYPTION_KEY`) |
| Encryption of patient identity fields (names, IPP, date of birth, birth/death) | Implemented | `EventListener/PatientEncryptionListener` (`APP_PATIENT_ENCRYPTION_KEY`), `app:patient:encrypt-existing` |
| Exact-match search on encrypted fields (HMAC, separate key) | Implemented | `Service/PatientSearchHashService` (`APP_PATIENT_SEARCH_HMAC_KEY`) |
| Pseudonymous references in activity logs (`patient#id`, `inclusion#id`) | Implemented | `ActivityLogService` callers |
| Right to erasure (Art. 17) with an erasure log | Implemented | `Service/ErasePatientService`, `Entity/PatientErasureLog` |
| Restriction of processing (Art. 18) | Implemented | `Service/PatientRestrictionService`, checked in the patient / inclusion / eCRF controllers |
| Data portability export (Art. 20, JSON) | Implemented | `Service/PatientDataExportService` |
| Versioned patient consent | Implemented | `Service/ConsentService`, `ConsentTemplate`, `ConsentVersion`, `PatientConsent` |
| Private file storage (opaque tokens, EXIF removed, access checked) | Implemented | `Service/SecureFileUploadService`, `Controller/PrivateFileController` |

## Retention

| Control | Status | Where in the code |
|---------|--------|-------------------|
| Security-log purge after 6 months (`P6M`) | **Partial** | `app:retention:purge-security-logs`, `DataRetentionService` (see the caution below) |
| Erasure-log purge after 5 years | **Partial** | `--with-erasure-logs` option of the same command |
| Alert when clinical retention (study end + 15 years) is close | Implemented (alert only, nothing is deleted) | `app:retention:check-studies`, `DataRetentionService` |

:::caution[Security-log purge conflicts with immutability]
`DataRetentionService::purgeSecurityLogs()` runs `DELETE … ORDER BY id LIMIT 500` on
`security_audit_log`. This clashes with the database in two ways:

- the `trg_security_audit_log_immutable` trigger rejects every `DELETE` on that table;
- `DELETE … LIMIT` is not valid PostgreSQL syntax.

Until this is fixed (for example with a controlled way to turn the trigger off for
retention, and PostgreSQL-compatible batching), the 6-month purge is **not operational**.
`--dry-run`, which only counts rows, still works.
:::

## HTTP hardening

| Control | Status | Where in the code |
|---------|--------|-------------------|
| CSP with a nonce for each request, `frame-ancestors 'none'` | Implemented (`style-src` still allows `'unsafe-inline'`) | `EventSubscriber/SecurityHeadersSubscriber` |
| HSTS (1 year, `includeSubDomains`), `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` | Implemented | `SecurityHeadersSubscriber` |

## Planned

These items are listed as future improvements in the [Security overview](/en/security/readme/)
and have no code yet:

| Area | Item | Status |
|------|------|--------|
| Monitoring | Centralized security alerts, anomaly detection on login behavior | Planned |
| Governance | Regular access / role review workflows | Planned |
| Audit | Correlation IDs across audit entries | Planned |
| Scheduling | Scheduler / cron setup for the retention and auto-disable commands | Not implemented (no Symfony Scheduler or crontab in the repository) |
