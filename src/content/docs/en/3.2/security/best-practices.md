---
title: Security best practices
description: "Non-negotiable secure-coding rules: workspace isolation, file
  storage outside the webroot, PII encryption, traceability, and a review
  checklist."
sidebar:
  label: Best practices
  badge:
    text: New
    variant: danger
slug: en/3.2/security/best-practices
---

> 🌐 [Version française](/3.2/security/best-practices/) · English version

Synapse Medical handles **health data** (HDS, GDPR, ANSSI, 21 CFR Part 11). The rules below
are **non-negotiable** and apply to every contribution. See also:
[Permissions](/3.2/security/permissions/) · [Contribute](/en/3.2/contribute/).

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

### Row-Level Security: closed by default

The `workspace_isolation` policy only shows a row when its `workspace_id` equals `app.workspace_id` (set by
`WorkspaceRlsSubscriber` on every request) **or** when `app.rls_bypass` is `on`. An empty or missing `app.workspace_id`
shows **no** row: a request without an active workspace, a console command, the Messenger worker or code running after
`kernel.terminate` sees nothing unless it asked for it.

* The application connects as the restricted role `app_runtime` (not owner, not superuser, no `BYPASSRLS`): a
  superuser ignores the policies even with `FORCE`. See [Production deployment](/3.2/deployment/production/).
* **One place writes the settings**: `App\Security\Rls\RowLevelSecurity`. A test fails when another file in `src/`
  writes them.
* Prefer **the workspace of the processed object**: `inWorkspace($id, fn () => …)` (Messenger handlers, commands working
  on one workspace), restored in a `finally`.
* A legitimate cross-workspace read goes through `bypass($reason, fn () => …)`: scoped to one transaction (a crash never
  leaves the connection in bypass mode in the FrankenPHP worker), restored in a `finally`, logged with its reason.
  Current use: the regulatory packs impact tab.
* Console commands that work across all workspaces carry `#[BypassesRowLevelSecurity('reason')]` (seed and fixtures,
  retention, encryption of existing patients); the bypass lasts for the command.
* A data migration that touches these tables opens the bypass for its transaction:
  `SELECT set_config('app.rls_bypass', 'on', true)`.

## 🗄️ Secure file storage

:::danger[Golden rule]
No uploaded file must **ever** be reachable via a public URL.
:::

* 📁 **Outside the webroot**: `private_uploads/`, never in `public/`.
* 🎲 **Opaque naming**: 32-hex token (`bin2hex(random_bytes(16))`), no business identifier
  (IPP, patient/study ID) in the path.
* 🧹 **EXIF stripping**: GD re-encoding before storage.
* 🛡️ **Controlled access**: `BinaryFileResponse` after checking the role **and** ownership.

```php
// ❌ FORBIDDEN — direct upload into public/
$file->move($publicDir . '/uploads/', $slugger->slug($name));

// ✅ MANDATORY — always go through the service
$token = $uploader->store($file, SecureFileUploadService::CTX_AVATAR, $allowedMimes, $maxBytes);
```

## 🔐 Encryption & personal data

* **Patient PII** and the **TOTP secret** are encrypted at rest (transparent Doctrine
  listeners, libsodium `crypto_secretbox`).
* Search over encrypted data via **blind HMAC index** (`externalIdHash`,
  `dateOfBirthHash`), never over the plaintext value.
* ❌ **No plaintext PII** in logs, file names, URLs or error messages.

## 👮 Authentication & access

* **Mandatory TOTP 2FA** (`TotpService`, `TwoFactorSubscriber`).
* Study access via `StudyVoter` + `StudyAccessService` (effective role).
* Account lockout, server-side session expiry, password reuse prevention
  (`PasswordHistory`).

## 📋 Traceability & audit

* `ActivityLog` (GCP clinical audit) and `SecurityAuditLog` (security audit) are
  **append-only** and **HMAC-SHA256 chained** (tamper-evident).
* Integrity check: `app:verify-audit-chain` / `app:audit:verify-chain`.
* Soft-delete (`deletedAt`) on `Study` and `Patient` (regulatory value).

## ✅ Review checklist

Before opening a Pull Request touching business data:

* \[ ] 🔒 Every query filters by `workspace_id` (no bare `find($id)`).
* \[ ] 🔒 New uploads go through `SecureFileUploadService`.
* \[ ] 🔐 No plaintext PII in logs / file names / errors.
* \[ ] 👮 New endpoints are protected by a Voter or `access_control`.
* \[ ] 📋 Sensitive actions are traced (`ActivityLog` / `SecurityAuditLog`).
* \[ ] 🧪 A test covers the access control (allowed **and** denied cases).

:::tip
See also the [Security QA checklist](/en/3.2/qa/security-checklist/) for detailed review
controls.
:::
