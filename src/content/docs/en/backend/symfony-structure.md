---
title: "Backend Code Structure"
description: "How src/ is organized — controllers, services, voters, events and entities — plus coding conventions and the worker-mode rules to follow."
---

> 🌐 English version · [Version française](/backend/symfony-structure/)

Organization of `src/`, coding conventions and rules to follow.
See also: [Architecture overview](/en/architecture/overview/) · [Data model](/en/database/data-model/).

---

## Table of contents

1. [`src/` tree](#1-src-tree)
2. [Controllers](#2-controllers)
3. [Services](#3-services)
4. [Security & authorization](#4-security--authorization)
5. [Events](#5-events)
6. [Entities & repositories](#6-entities--repositories)
7. [Doctrine — extensions](#7-doctrine--extensions)
8. [eCRF builder](#8-ecrf-builder)
9. [Front-end (assets)](#9-front-end-assets)
10. [Coding conventions](#10-coding-conventions)
11. [Worker mode — rules to follow](#11-worker-mode--rules-to-follow)

---

## 1. `src/` tree

Root namespace `App\` (PSR-4), everything under `src/`.

```
src/
├── Builder/          eCRF builder abstraction (context, interfaces, value resolver)
├── Command/          app:* console commands (+ Trait/)
├── Controller/       ~42 HTTP controllers (+ Trait/)
├── Doctrine/Function/ Custom DQL functions (CastText, JsonGetText)
├── Dto/              Data transfer objects
├── Entity/           ~50 Doctrine entities
├── Enum/             ~25 business enums (statuses, types, roles)
├── EventListener/    Doctrine listeners (transparent encryption)
├── EventSubscriber/  Kernel subscribers (2FA, RLS, sessions, headers…)
├── Form/             ~16 Symfony form types
├── Notification/     Notifier (FeedbackNotification)
├── Repository/       ~47 repositories
├── Security/         Authenticator, voters, audit, password policy
│   └── Voter/        Business voters
├── Service/          ~32 business services
├── Twig/             Twig extensions (CSP nonce, workspace, modules)
├── Validator/        Custom constraints
└── ValueObject/      Value objects
```

---

## 2. Controllers

Symfony `AbstractController`, grouped by domain. The
`Controller/Trait/WorkspaceScopedControllerTrait` factors out active-workspace resolution.

| Domain | Controllers (examples) |
|--------|------------------------|
| Security / session | `SecurityController`, `TotpController`, `ForcePasswordChangeController`, `PasswordResetController`, `SessionExpireController`, `UserSessionController` |
| Workspace | `WorkspaceController`, `WorkspaceSwitchController`, `WorkspaceModuleController`, `HomeController` |
| Users / access | `UserController`, `TeamController`, `UserAccessController`, `InvitationController`, `SiteController` |
| Study | `StudyController`, `StudyPatientController`, `StudyProtocolController`, `StudyScheduleController`, `StudyImportController` |
| eCRF | `EcrfController`, `EcrfRecordController`, `EcrfBuilderController`, `EcrfTemplateController`, `EcrfQueryController`, `EcrfSignatureController` |
| Patient / GDPR | `PatientController`, `DeathCheckerController`, `ConsentAdminController`, `ConsentPatientController`, `DpoContactController` |
| Files / audit | `PrivateFileController`, `AuditExportController`, `AdminNotificationController` |

> **Rule**: a controller never loads a resource by ID alone — it goes through a workspace-filtered repository or a Voter. See [§11](#11-worker-mode--rules-to-follow).

---

## 3. Services

Business logic in `src/Service/`, autowired. Logical grouping:

| Domain | Services |
|--------|----------|
| Workspace | `ActiveWorkspaceContext`, `WorkspaceModuleManager` |
| Access | `StudyAccessService`, `SiteAccessService`, `UserAssignmentService` |
| eCRF | `EcrfRuleEngine`, `EcrfFormulaEngine`, `EcrfQueryService`, `EcrfSignatureService`, `EcrfAuditWriter`, `EcrfTemplateCloner`, `StudyEcrfExportService`, `StudyProgressService` |
| Study | `StudyExportService`, `StudyImportService`, `VisitSchedulingService`, `SubjectIdService` |
| Patient / GDPR | `EncryptionService`, `PatientSearchHashService`, `ConsentService`, `ErasePatientService`, `PatientRestrictionService`, `PatientDataExportService`, `DataRetentionService`, `MatchIdService` |
| Security | `TotpService`, `BackupCodeService`, `PasswordResetService`, `InvitationService`, `ActivityLogService`, `ActivityLogIntegrityService`, `SecureFileUploadService` |

---

## 4. Security & authorization

Under `src/Security/`:

- **Authentication**: `UserAuthenticator` (username/email login, CSRF, remember-me), `UserChecker`.
- **Password policy**: `PasswordPolicyService`, `PasswordHistoryService`, `CommonPasswordChecker`, `HibpPasswordChecker`.
- **Audit**: `SecurityAuditLogger`, `SecuritySettingsProvider`.
- **Voters** (`Security/` + `Security/Voter/`): `StudyVoter`, `SiteVoter`, `WorkspaceVoter`, `PatientVoter`, `ConsentVoter`, `EcrfQueryVoter`, `EcrfRecordVoter`, `SiteDocumentVoter`, `TeamVoter`.

Standard voter pattern: **check workspace isolation first**, then super-admin bypass, then delegate the effective role to a `*AccessService`. Details: [security/Permissions.md](/security/permissions/).

---

## 5. Events

### EventSubscriber (`kernel.*`)
| Subscriber | Role |
|------------|------|
| `TwoFactorSubscriber` | Enforces 2FA (4-state machine) |
| `WorkspaceRlsSubscriber` | `SET`/`RESET` of `app.workspace_id` (PostgreSQL RLS) |
| `WorkspaceContextSubscriber` | Active-workspace Twig globals |
| `SessionInactivitySubscriber` | Server-side inactivity timeout |
| `SessionEnforcementSubscriber` | Device limit, remote revocation |
| `LoginSubscriber` / `LoginSecuritySubscriber` / `LogoutSubscriber` | Login cycle, progressive lockout, audit |
| `ForcePasswordChangeSubscriber` | Forced password change |
| `SecurityHeadersSubscriber` | CSP nonce, HSTS, X-Frame-Options… |
| `AccessDeniedSubscriber` | Logs every 403 |
| `LocaleSubscriber` | Locale |

### EventListener (Doctrine)
| Listener | Role |
|----------|------|
| `PatientEncryptionListener` | Transparent encryption of patient PII + blind index |
| `TotpEncryptionListener` | Transparent encryption of the TOTP secret |
| `StudyPatientConsistencyListener` | Patient inclusion ↔ study consistency |
| `FeedbackListener` | Feedback processing |

---

## 6. Entities & repositories

- ~50 entities (`src/Entity/`), ~25 enums (`src/Enum/`), ~47 repositories.
- Cross-cutting conventions: `workspace_id` on business tables, soft-delete (`deletedAt`) on `User`/`Study`/`Patient`, `created`/`updated` timestamps, append-only audit entities.
- **Repositories: systematic workspace filtering** (`findOneByWorkspaceAndId`, `andWhere('x.workspace = :workspace')`).

Full details: [Data model](/en/database/data-model/).

---

## 7. Doctrine — extensions

`src/Doctrine/Function/` — custom DQL functions (PostgreSQL):

| Function | Purpose |
|----------|---------|
| `CAST_TEXT(...)` | Cast an expression to text |
| `JSON_GET_TEXT(...)` | Extract a JSON field as text (`->>`) — for `EcrfForm.businessRules`, `formSettings` |

---

## 8. eCRF builder

`src/Builder/` abstracts the form builder:
- `BuilderContext` + `BuilderContextValueResolver`: controller argument resolution.
- `BuilderFieldInterface` / `BuilderSectionInterface`: implemented **by both** the template entities (`EcrfTemplateSection/Field`) and the live ones (`EcrfSection/Field`) → a single rendering/manipulation codebase serves both hierarchies.

---

## 9. Front-end (assets)

`assets/` — **AssetMapper** (no Node build), driven by `importmap.php`.

- **Stimulus** 3.2 (`bootstrap.js`, `controllers/`).
- Libs: `sortablejs` (drag-and-drop builder), `choices.js`, vendored Bootstrap.
- Entry points: `app`, `login`, `2fa-check`, `2fa-setup`, `ecrf-builder`, `study-wizard`.
- UX modules (`assets/js/`): `session-guard`, `confirm-modal`, `drawer-manager`, `password-strength`, `toast`, `theme`, `ecrf-builder`, `ecrf-engine`, `study-wizard`…
- CSS: **BEM + Nesting** convention — see [code-convention/CSS-convention.md](/en/code-convention/css-convention/).

---

## 10. Coding conventions

| Aspect | Convention |
|--------|-----------|
| PHP standard | PSR-12, strict types, PHP 8 attributes (routes, Doctrine, validation) |
| Namespace | `App\` (PSR-4), one type per file |
| Injection | Constructor autowiring (property promotion), no `new` for services |
| Naming | `*Controller`, `*Service`, `*Repository`, `*Voter`, `*Subscriber`, `*Listener` |
| Enums | Typed `Enum/`, business logic (transitions, labels) carried by the enum |
| Forms | `src/Form/*Type`; never manually hydrate an entity from the request |
| Tests | PHPUnit, mirror of `src/`, focused on security/access/compliance |
| CSS | BEM + CSS Nesting ([guide](/en/code-convention/css-convention/)) |
| API | OpenAPI attributes (nelmio) ([guide](/api/readme/)) |
| Commits | Conventional (`feat(scope):`, `fix(scope):`, `docs:`) |

---

## 11. Worker mode — rules to follow

The FrankenPHP worker reuses the PHP process between requests. **Mistakes to never make**:

| ❌ Anti-pattern | ✅ Rule |
|-----------------|---------|
| Request-scoped state in a service property without reset | Implement `ResetInterface::reset()` |
| `$repo->find($id)` (cross-workspace) | `findOneBy(['id' => $id, 'workspace' => $ws])` or Voter |
| Writing an upload to `public/` | `SecureFileUploadService::store(...)` |
| Modifying/deleting an audit entry | Audit is **append-only** (HMAC chaining) |
| Twig globals via static state | `kernel.controller` subscriber |
| Variable accidentally persisting between requests | Cookies on the response, session for user state |

> See the full request cycle: [architecture/overview.md §7](/en/architecture/overview/#7-request-lifecycle).
