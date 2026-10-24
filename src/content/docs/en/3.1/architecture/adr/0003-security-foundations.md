---
title: 0003 - Layered security foundations (defense in depth)
description: Decision to apply layered, defense-in-depth security across
  workspace isolation, brute-force, sessions, encryption and audit trails.
slug: en/3.1/architecture/adr/0003-security-foundations
---

## Status

Accepted

## Context

The platform stores identifying patient data and clinical records subject to
HDS, CNIL/GDPR, ANSSI and FDA 21 CFR Part 11 requirements. A single control is
never sufficient: each protection must be backed by a second, independent layer
so that one failure does not expose data. The FrankenPHP worker runtime (shared
process between requests) also adds isolation risks that must be addressed
explicitly.

This ADR records the cross-cutting security posture that complements the base
authentication/authorization choice in [ADR 0001](/en/3.1/architecture/adr/0001-use-symfony-security/).

## Decision

Adopt **defense in depth**, with each concern enforced at two independent layers:

| Concern | Layer 1 (application) | Layer 2 (independent) |
|---------|-----------------------|------------------------|
| **Workspace isolation** | Voters re-check `resource.workspace === active workspace` | PostgreSQL **Row-Level Security** (`FORCE ROW LEVEL SECURITY`) on `study`, `patient`, `ecrf_record` |
| **Brute force** | Per-account progressive lockout (`LoginSecuritySubscriber`) | Framework `login_throttling` (sliding window) |
| **Session expiry** | Server-side inactivity timeout | Multi-device DB enforcement + remote revocation |
| **Data at rest** | libsodium encryption of patient PII & TOTP secret | HMAC blind-index columns for search (no plaintext) |
| **Traceability** | `ActivityLog` / `SecurityAuditLog` (append-only) | HMAC-SHA256 hash chaining (`verifyChain()`) |

Additional baseline rules, applied without exception:

* **2FA (TOTP) mandatory** for every authenticated user (`TwoFactorSubscriber`).
* **Never load a resource by ID alone** — always filter by `workspace_id`.
* **Files stored outside the webroot**, opaque names, EXIF stripped, served only
  after ownership checks (`SecureFileUploadService`, `PrivateFileController`).
* **Audit entries are immutable** (append-only); modifying one breaks the chain.
* **Worker-safe state**: request-scoped services implement `ResetInterface`; the
  RLS session variable is cleared at `kernel.terminate`.
* HTTP hardening: nonce-based CSP (no `unsafe-inline` scripts), HSTS,
  `X-Frame-Options: DENY`, `nosniff`.

## Consequences

* A single bug (missing workspace filter, leaked session) does not, on its own,
  expose cross-tenant or sensitive data.
* Higher implementation and review cost; every new entity/route must satisfy the
  isolation and audit rules (see the [pre-PR checklist](/en/3.1/backend/getting-started/#7-git-workflow--contributing)).
* Encryption keys become critical assets: losing `APP_PATIENT_ENCRYPTION_KEY`
  or `APP_TOTP_ENCRYPTION_KEY` makes the related data unrecoverable.
* Compliance evidence (audit chains, e-signatures) is producible on demand.

## References

* `src/EventSubscriber/` (RLS, 2FA, sessions, security headers, lockout)
* `src/Service/` (`EncryptionService`, `ActivityLogIntegrityService`, `SecureFileUploadService`)
* [Security overview](/en/3.1/security/readme/) · [Compliance](/en/3.1/security/compliance/)
* [Architecture overview](/en/3.1/architecture/overview/#5-multi-tenancy--isolation)
