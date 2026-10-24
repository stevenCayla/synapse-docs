---
title: Compliance
description: "How the security controls built into Synapse Medical map to the
  frameworks the project targets: HDS, GDPR/CNIL, ANSSI recommendations, and
  ICH-GCP / 21 CFR Part 11 for the audit trail and e-signatures."
slug: 3.1/en/3.0/security/compliance
---

This page links the **technical controls in the code** to the requirements of the
frameworks the project targets. It is a map for developers, auditors and the DPO.

:::caution[Not a certification]
Synapse Medical does **not** claim HDS certification, 21 CFR Part 11 validation, or any
other formal compliance. Compliance also depends on hosting, organizational procedures,
system validation and contracts, none of which the code covers. The references below
repeat the ones cited in code comments, so readers can trace the intent behind each
control. They are not legal advice.
:::

For the current state of each control, including gaps, see
[Implementation status](/en/3.1/3.0/security/implementation-status/).

## Frameworks in scope

| Framework | Why it applies | Main topics in the code |
|-----------|----------------|-------------------------|
| **HDS** (Hébergement de Données de Santé, the French certification for hosting health data) | The app processes personal health data of patients enrolled in studies | Strong authentication, access control, traceability, encryption |
| **GDPR / CNIL** | Personal data of patients and healthcare professionals | Data minimization, data subject rights, retention, pseudonymization |
| **ANSSI** recommendations | French national guidance on authentication and passwords | Password policy, MFA, brute-force protection, sessions |
| **ICH E6 (GCP) / FDA 21 CFR Part 11** | Clinical study data (eCRF) and electronic records | Audit trail, reason for change, e-signatures, record retention |

## HDS: health data hosting

| Topic | Implemented control | Code |
|-------|---------------------|------|
| Strong authentication | TOTP 2FA required for **every** user; secret created when the account is created; 10 single-use backup codes | `TwoFactorSubscriber` (cites HDS v1.1 §7.1), `TotpService`, `BackupCodeService` |
| Access control | Workspace / study / site roles enforced by Voters; strict workspace isolation, plus PostgreSQL RLS on `study`, `patient`, `ecrf_record` | `StudyVoter`, `SiteVoter`, `WorkspaceRlsSubscriber` |
| Traceability | Security events and business actions stored in the database; tables made immutable by triggers | `SecurityAuditLogger`, `ActivityLogService`, migration `Version20260427110000` |
| Confidentiality at rest | Patient identity fields and TOTP secrets encrypted (XSalsa20-Poly1305), with separate keys for each domain | `EncryptionService`, `PatientEncryptionListener`, `TotpEncryptionListener` |
| Session security | 15-minute inactivity timeout, at most 3 concurrent sessions, remote revocation, hardened cookies | `SessionInactivitySubscriber`, `SessionEnforcementSubscriber` |
| Transport and browser | HSTS, CSP with a nonce for each request, anti-framing headers | `SecurityHeadersSubscriber` |
| Files | Uploads stored outside the webroot under opaque names, EXIF data removed, served only after an ownership check | `SecureFileUploadService`, `PrivateFileController` |
| Account lifecycle | Accounts inactive for 90 days disabled automatically; guest access expires after 90 days | `app:users:auto-disable-inactive`, `InvitationService` |

:::note
Hosting-level HDS requirements (certified hosting provider, backups, physical security,
business continuity) are outside this repository. See [Production deployment](/en/3.1/3.0/deployment/production/).
:::

## GDPR / CNIL

| Principle / article | Implemented control | Code |
|---------------------|---------------------|------|
| Security of processing (Art. 32) | Encryption at rest, 2FA, access control, audit logs (see the HDS section) | – |
| Pseudonymization | Activity logs refer to `patient#id` / `inclusion#id`, never to names; exact-match search on encrypted fields uses a separate HMAC key | `ActivityLogService` callers, `PatientSearchHashService` |
| Data minimization in logs | No password or secret in `SecurityAuditLog.details`; only the first 5 characters of the password's SHA-1 hash go to HIBP | `SecurityAuditLog`, `HibpPasswordChecker` |
| Right to erasure (Art. 17) | Identity data replaced by an opaque token; a `PatientErasureLog` entry is kept as proof. Clinical data is kept under an opaque ID, as GCP requires (Art. 17 §3) | `ErasePatientService` |
| Right to restriction (Art. 18) | Writes blocked on a restricted patient (demographics, eCRF, inclusion status) | `PatientRestrictionService`, patient / eCRF controllers |
| Right to portability (Art. 20) | Structured JSON export of a patient's data; every export is logged | `PatientDataExportService` |
| Consent | Consent templates and versions; recording and withdrawing consent | `ConsentService`, `ConsentVersion`, `PatientConsent` |
| Storage limitation (Art. 5(1)(e)) | Security logs: 6 months (CNIL recommendation). Erasure logs: 5 years. Inactive sessions: 30 days | `DataRetentionService`, `app:retention:*` commands |
| DPO contact | DPO contact record linked to one or more workspaces | `Entity/DpoContact` (`Workspace.dpoContact`) |

:::caution
The 6-month security-log purge is **not operational** yet: the immutability trigger on
`security_audit_log` rejects the `DELETE`. See
[Implementation status](/en/3.1/3.0/security/implementation-status/#retention).
:::

The processing register, the processor register and the DPIA are documented separately
(French only): `docs/rgpd/registre-traitements.md`, `docs/rgpd/registre-sous-traitants.md`,
`docs/audit/dpia.md`.

## ANSSI: authentication and passwords

| Recommendation | Implemented control | Default value / code |
|----------------|---------------------|----------------------|
| Minimum length and complexity | Minimum length (never below 8, checked at boot), 4 character classes | `12` characters: `SecuritySettingsProvider`, `PasswordPolicyService` |
| Reject weak or known passwords | Built-in list of common passwords and patterns; breach check through HIBP (k-anonymity) | `CommonPasswordChecker`, `HibpPasswordChecker` |
| No reuse | Password history | last `5`: `PasswordHistoryService` |
| Renewal | Periodic forced change | `90` days: `ForcePasswordChangeSubscriber` |
| Password set by an admin | Must be changed at the next login | `mustChangePassword` |
| Brute-force protection | Throttling per IP address + username; account lockout in steps (15 min → 1 h → 24 h → permanent) | `login_throttling`, `LoginSecuritySubscriber` |
| Multi-factor authentication | TOTP required for everyone | `TwoFactorSubscriber` |
| Secure recovery | Reset token of 32 random bytes, only its SHA-256 hash stored, 15-minute lifetime, single use; same response whether or not the account exists | `PasswordResetService` |
| Sessions | Timeout after inactivity, all sessions ended after a password change | [Session management](/en/3.1/3.0/security/session-management/) |

:::note
ANSSI now treats mandatory periodic rotation as optional when other safeguards are in
place. Rotation is a setting here (`password_rotation_days`, `null` turns it off, minimum 30).
:::

## ICH-GCP / 21 CFR Part 11: audit trail and e-signatures

| Requirement (as cited in the code) | Implemented control | Code |
|------------------------------------|---------------------|------|
| §11.10(e): secure, computer-generated, time-stamped audit trail | Field-level eCRF audit (`EcrfValueAudit`) and business activity log (`ActivityLog`) | `EcrfAuditWriter`, `ActivityLogService` |
| Audit trail cannot be altered | PostgreSQL triggers block `UPDATE`/`DELETE` on `activity_log`, `security_audit_log` and `ecrf_value_audit` | `Version20260427110000`, `Version20260428000001` |
| Tampering can be detected | HMAC-SHA256 hash chain for each workspace (`ActivityLog`) and for each record (`EcrfValueAudit`) | `ActivityLogIntegrityService`, `EcrfAuditWriter` |
| Chain verification | CLI `app:verify-audit-chain` / `app:audit:verify-chain` (exit code 1 if a chain is broken); check from the UI | `VerifyAuditChainCommand`, `VerifyActivityLogChainCommand`, `AuditExportController` |
| Reason for change | `reasonForChange` is required for `update` and `clear` events | `EcrfValueAudit` constructor |
| Inspection export | CSV export of the eCRF audit trail for a study (MANAGE role) | `AuditExportController` |
| §11.50 / §11.200: e-signatures | Password re-checked when signing; printed name, meaning (`investigator_review`, `data_manager_review`, `sponsor_review`), timestamp, IP address, and an HMAC of the record content | `EcrfSignatureService`, `EcrfSignature`, `SignatureMeaning` |
| Signature linked to the record | `verifyIntegrity()` detects changes made after signing; an investigator signature locks a completed record | `EcrfSignatureService` |
| Data lock | Study freeze | `Study::freeze()` |
| Retention (ICH E6) | Clinical data kept for study end + 15 years. Nothing is deleted automatically; only alerts are raised | `DataRetentionService`, `app:retention:check-studies` |

:::caution[Operational points]
* The hash chains and the signature content hash use `APP_SECRET` as their key. Rotating it
  makes all existing hashes fail verification, so rotation needs a documented procedure.
* 21 CFR Part 11 also requires system validation, SOPs and user training. None of these
  come from the code.
:::

## See also

* [Security overview](/en/3.1/3.0/security/readme/)
* [Password policy](/en/3.1/3.0/security/password-policy/)
* [Session management](/en/3.1/3.0/security/session-management/)
* [Permissions](/en/3.1/3.0/security/permissions/)
* [Implementation status](/en/3.1/3.0/security/implementation-status/)
