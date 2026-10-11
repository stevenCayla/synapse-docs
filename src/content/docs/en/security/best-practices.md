---
title: "Security best practices"
description: "Non-negotiable secure-coding rules: workspace isolation, file storage outside the webroot, PII encryption, traceability, and a review checklist."
sidebar:
  label: "Best practices"
  badge:
    text: New
    variant: danger
---

> 🌐 [Version française](/security/best-practices/) · English version

Synapse Medical handles **health data** (HDS, GDPR, ANSSI, 21 CFR Part 11). The rules below
are **non-negotiable** and apply to every contribution. See also:
[Permissions](/security/permissions/) · [Contribute](/en/contribute/).

## 🔒 Workspace isolation

Each **workspace** is a **fully isolated** application environment — not a mere visual
filter.

:::danger[Golden rule]
**Never** load a resource by its ID alone. Always check its `workspace_id` too.
:::

```php
// ❌ FORBIDDEN
$study = $repo->find($id);

// ✅ MANDATORY
$study = $repo->findOneBy(['id' => $id, 'workspace' => $activeWorkspace]);
// or via a Voter that checks study.workspace === activeWorkspace
```

| Rule | Application |
|------|-------------|
| Every business table carries `workspace_id` | Non-nullable column, FK to `workspace` |
| Every query filters by `workspace_id` | Never load by ID alone |
| Every creation attaches the active workspace | Controller / service |
| Cross-workspace access | **HTTP 403/404** denial (Voter or guard) |

Defense in depth: **PostgreSQL Row-Level Security** (`FORCE ROW LEVEL SECURITY`) doubles
the application check on `study`, `patient`, `ecrf_record`.

## 🗄️ Secure file storage

:::danger[Golden rule]
No uploaded file must **ever** be reachable via a public URL.
:::

- 📁 **Outside the webroot**: `private_uploads/`, never in `public/`.
- 🎲 **Opaque naming**: 32-hex token (`bin2hex(random_bytes(16))`), no business identifier
  (IPP, patient/study ID) in the path.
- 🧹 **EXIF stripping**: GD re-encoding before storage.
- 🛡️ **Controlled access**: `BinaryFileResponse` after checking the role **and** ownership.

```php
// ❌ FORBIDDEN — direct upload into public/
$file->move($publicDir . '/uploads/', $slugger->slug($name));

// ✅ MANDATORY — always go through the service
$token = $uploader->store($file, SecureFileUploadService::CTX_AVATAR, $allowedMimes, $maxBytes);
```

## 🔐 Encryption & personal data

- **Patient PII** and the **TOTP secret** are encrypted at rest (transparent Doctrine
  listeners, libsodium `crypto_secretbox`).
- Search over encrypted data via **blind HMAC index** (`externalIdHash`,
  `dateOfBirthHash`), never over the plaintext value.
- ❌ **No plaintext PII** in logs, file names, URLs or error messages.

## 👮 Authentication & access

- **Mandatory TOTP 2FA** (`TotpService`, `TwoFactorSubscriber`).
- Study access via `StudyVoter` + `StudyAccessService` (effective role).
- Account lockout, server-side session expiry, password reuse prevention
  (`PasswordHistory`).

## 📋 Traceability & audit

- `ActivityLog` (GCP clinical audit) and `SecurityAuditLog` (security audit) are
  **append-only** and **HMAC-SHA256 chained** (tamper-evident).
- Integrity check: `app:verify-audit-chain` / `app:audit:verify-chain`.
- Soft-delete (`deletedAt`) on `Study` and `Patient` (regulatory value).

## ✅ Review checklist

Before opening a Pull Request touching business data:

- [ ] 🔒 Every query filters by `workspace_id` (no bare `find($id)`).
- [ ] 🔒 New uploads go through `SecureFileUploadService`.
- [ ] 🔐 No plaintext PII in logs / file names / errors.
- [ ] 👮 New endpoints are protected by a Voter or `access_control`.
- [ ] 📋 Sensitive actions are traced (`ActivityLog` / `SecurityAuditLog`).
- [ ] 🧪 A test covers the access control (allowed **and** denied cases).

:::tip
See also the [Security QA checklist](/en/qa/security-checklist/) for detailed review
controls.
:::
