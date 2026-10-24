---
title: Structure du code backend
description: Organisation de src/ — contrôleurs, services, voters, événements et
  entités — ainsi que les conventions de code et les règles du mode worker.
slug: 3.1/backend/symfony-structure
---

> 🌐 Version française · [English version](/en/3.1/backend/symfony-structure/)

Organisation de `src/`, conventions de code et règles à respecter.
Voir aussi : [Vue d'ensemble de l'architecture](/3.1/architecture/overview/) · [Modèle de données](/3.1/database/data-model/).

***

## Table des matières

1. [Arborescence `src/`](#1-arborescence-src)
2. [Contrôleurs](#2-contrôleurs)
3. [Services](#3-services)
4. [Sécurité & autorisation](#4-sécurité--autorisation)
5. [Événements](#5-événements)
6. [Entités & repositories](#6-entités--repositories)
7. [Doctrine — extensions](#7-doctrine--extensions)
8. [Builder eCRF](#8-builder-ecrf)
9. [Front-end (assets)](#9-front-end-assets)
10. [Conventions de code](#10-conventions-de-code)
11. [Mode worker — règles à respecter](#11-mode-worker--règles-à-respecter)

***

## 1. Arborescence `src/`

Namespace racine `App\` (PSR-4), tout sous `src/`.

```
src/
├── Builder/          Abstraction du builder eCRF (contexte, interfaces, value resolver)
├── Command/          Commandes console app:* (+ Trait/)
├── Controller/       ~42 contrôleurs HTTP (+ Trait/)
├── Doctrine/Function/ Fonctions DQL custom (CastText, JsonGetText)
├── Dto/              Objets de transfert
├── Entity/           ~50 entités Doctrine
├── Enum/             ~25 enums métier (statuts, types, rôles)
├── EventListener/    Listeners Doctrine (chiffrement transparent)
├── EventSubscriber/  Subscribers Kernel (2FA, RLS, sessions, headers…)
├── Form/             ~16 form types Symfony
├── Notification/     Notifier (FeedbackNotification)
├── Repository/       ~47 repositories
├── Security/         Authenticator, voters, audit, politique MDP
│   └── Voter/        Voters métier
├── Service/          ~32 services métier
├── Twig/             Extensions Twig (CSP nonce, workspace, modules)
├── Validator/        Contraintes custom
└── ValueObject/      Objets valeur
```

***

## 2. Contrôleurs

`AbstractController` Symfony, regroupés par domaine. Le trait
`Controller/Trait/WorkspaceScopedControllerTrait` factorise la résolution du workspace actif.

| Domaine | Contrôleurs (exemples) |
|---------|------------------------|
| Sécurité / session | `SecurityController`, `TotpController`, `ForcePasswordChangeController`, `PasswordResetController`, `SessionExpireController`, `UserSessionController` |
| Workspace | `WorkspaceController`, `WorkspaceSwitchController`, `WorkspaceModuleController`, `HomeController` |
| Utilisateurs / accès | `UserController`, `TeamController`, `UserAccessController`, `InvitationController`, `SiteController` |
| Étude | `StudyController`, `StudyPatientController`, `StudyProtocolController`, `StudyScheduleController` |
| eCRF | `EcrfController`, `EcrfRecordController`, `EcrfBuilderController`, `EcrfTemplateController`, `EcrfQueryController`, `EcrfSignatureController` |
| Patient / GDPR | `PatientController`, `DeathCheckerController`, `ConsentAdminController`, `ConsentPatientController`, `DpoContactController` |
| Fichiers / audit | `PrivateFileController`, `AuditExportController`, `AdminNotificationController` |

> **Règle** : un contrôleur ne charge jamais une ressource par ID seul — il passe par un repository filtré workspace ou un Voter. Voir [§11](#11-mode-worker--règles-à-respecter).

***

## 3. Services

Logique métier dans `src/Service/`, autowirés. Regroupement logique :

| Domaine | Services |
|---------|----------|
| Workspace | `ActiveWorkspaceContext`, `WorkspaceModuleManager` |
| Accès | `StudyAccessService`, `SiteAccessService`, `UserAssignmentService` |
| eCRF | `EcrfRuleEngine`, `EcrfFormulaEngine`, `EcrfQueryService`, `EcrfSignatureService`, `EcrfAuditWriter`, `EcrfTemplateCloner`, `StudyEcrfExportService`, `StudyProgressService` |
| Étude | `StudyExportService`, `VisitSchedulingService`, `SubjectIdService` |
| Patient / GDPR | `EncryptionService`, `PatientSearchHashService`, `ConsentService`, `ErasePatientService`, `PatientRestrictionService`, `PatientDataExportService`, `DataRetentionService`, `MatchIdService` |
| Sécurité | `TotpService`, `BackupCodeService`, `PasswordResetService`, `InvitationService`, `ActivityLogService`, `ActivityLogIntegrityService`, `SecureFileUploadService` |

***

## 4. Sécurité & autorisation

Sous `src/Security/` :

* **Authentification** : `UserAuthenticator` (login username/email, CSRF, remember-me), `UserChecker`.
* **Politique MDP** : `PasswordPolicyService`, `PasswordHistoryService`, `CommonPasswordChecker`, `HibpPasswordChecker`.
* **Audit** : `SecurityAuditLogger`, `SecuritySettingsProvider`.
* **Voters** (`Security/` + `Security/Voter/`) : `StudyVoter`, `SiteVoter`, `WorkspaceVoter`, `PatientVoter`, `ConsentVoter`, `EcrfQueryVoter`, `EcrfRecordVoter`, `SiteDocumentVoter`, `TeamVoter`.

Pattern voter standard : **vérifie l'isolation workspace d'abord**, puis bypass super-admin, puis délègue le rôle effectif à un `*AccessService`. Détails : [security/Permissions.md](/3.1/security/permissions/).

***

## 5. Événements

### EventSubscriber (`kernel.*`)

| Subscriber | Rôle |
|------------|------|
| `TwoFactorSubscriber` | Enforce la 2FA (machine à 4 états) |
| `WorkspaceRlsSubscriber` | `SET`/`RESET` de `app.workspace_id` (RLS PostgreSQL) |
| `WorkspaceContextSubscriber` | Globals Twig du workspace actif |
| `SessionInactivitySubscriber` | Timeout d'inactivité serveur |
| `SessionEnforcementSubscriber` | Limite d'appareils, révocation distante |
| `LoginSubscriber` / `LoginSecuritySubscriber` / `LogoutSubscriber` | Cycle login, lockout progressif, audit |
| `ForcePasswordChangeSubscriber` | Changement de MDP forcé |
| `SecurityHeadersSubscriber` | CSP nonce, HSTS, X-Frame-Options… |
| `AccessDeniedSubscriber` | Journalise tous les 403 |
| `LocaleSubscriber` | Locale |

### EventListener (Doctrine)

| Listener | Rôle |
|----------|------|
| `PatientEncryptionListener` | Chiffrement transparent des PII patient + index aveugle |
| `TotpEncryptionListener` | Chiffrement transparent du secret TOTP |
| `StudyPatientConsistencyListener` | Cohérence inclusion patient ↔ étude |
| `FeedbackListener` | Traitement feedback |

***

## 6. Entités & repositories

* \~50 entités (`src/Entity/`), ~25 enums (`src/Enum/`), ~47 repositories.
* Conventions transverses : `workspace_id` sur les tables métier, soft-delete (`deletedAt`) sur `User`/`Study`/`Patient`, timestamps `created`/`updated`, entités d'audit append-only.
* **Repositories : filtrage workspace systématique** (`findOneByWorkspaceAndId`, `andWhere('x.workspace = :workspace')`).

Détail complet : [Modèle de données](/3.1/database/data-model/).

***

## 7. Doctrine — extensions

`src/Doctrine/Function/` — fonctions DQL custom (PostgreSQL) :

| Fonction | Usage |
|----------|-------|
| `CAST_TEXT(...)` | Cast d'une expression en texte |
| `JSON_GET_TEXT(...)` | Extraction d'un champ JSON en texte (`->>`) — pour `EcrfForm.businessRules`, `formSettings` |

***

## 8. Builder eCRF

`src/Builder/` abstrait le builder de formulaires :

* `BuilderContext` + `BuilderContextValueResolver` : résolution d'argument de contrôleur.
* `BuilderFieldInterface` / `BuilderSectionInterface` : implémentées **à la fois** par les entités template (`EcrfTemplateSection/Field`) et live (`EcrfSection/Field`) → un même code de rendu/manipulation sert les deux hiérarchies.

***

## 9. Front-end (assets)

`assets/` — **AssetMapper** (pas de build Node), piloté par `importmap.php`.

* **Stimulus** 3.2 (`bootstrap.js`, `controllers/`).
* Libs : `sortablejs` (builder drag-and-drop), `choices.js`, Bootstrap 5.3 et Bootstrap Icons (via `importmap:require`, versionnés et couverts par `importmap:audit`), polices Inter et Fraunces (woff2 sous `assets/fonts/`, licence OFL).
  Aucune ressource n'est chargée depuis un CDN ou un service tiers : la CSP n'autorise que `'self'` pour les scripts, styles et polices. Le bundle JS de Bootstrap est vendoré dans `assets/lib/bootstrap/` (script classique, l'objet global `bootstrap` est utilisé par des scripts inline) à garder à la même version que le CSS.
* Points d'entrée : `app`, `login`, `2fa-check`, `2fa-setup`, `ecrf-builder`, `study-wizard`.
* Modules UX (`assets/js/`) : `session-guard`, `confirm-modal`, `drawer-manager`, `password-strength`, `toast`, `theme`, `ecrf-builder`, `ecrf-engine`, `study-wizard`…
* CSS : convention **BEM + Nesting** — voir [code-convention/CSS-convention.md](/3.1/code-convention/css-convention/).

***

## 10. Conventions de code

| Aspect | Convention |
|--------|-----------|
| Standard PHP | PSR-12, types stricts, attributs PHP 8 (routes, Doctrine, validation) |
| Namespace | `App\` (PSR-4), un type par fichier |
| Injection | Autowiring par constructeur (promotion de propriété), pas de `new` de service |
| Nommage | `*Controller`, `*Service`, `*Repository`, `*Voter`, `*Subscriber`, `*Listener` |
| Enums | `Enum/` typés, logique métier (transitions, libellés) portée par l'enum |
| Forms | `src/Form/*Type` ; jamais de hydratation manuelle d'entité depuis la requête |
| Tests | PHPUnit, miroir de `src/`, focalisés sécurité/accès/conformité |
| CSS | BEM + CSS Nesting ([guide](/3.1/code-convention/css-convention/)) |
| API | Attributs OpenAPI (nelmio) ([guide](/3.1/api/readme/)) |
| Commits | Conventionnels (`feat(scope):`, `fix(scope):`, `docs:`) |

***

## 11. Mode worker — règles à respecter

Le worker FrankenPHP réutilise le process PHP entre les requêtes. **Erreurs à ne jamais commettre** :

| ❌ Anti-pattern | ✅ Règle |
|-----------------|---------|
| État request-scoped dans une propriété de service sans reset | Implémenter `ResetInterface::reset()` |
| `$repo->find($id)` (cross-workspace) | `findOneBy(['id' => $id, 'workspace' => $ws])` ou Voter |
| Écrire un upload dans `public/` | `SecureFileUploadService::store(...)` |
| Modifier/supprimer une entrée d'audit | Audit **append-only** (chaînage HMAC) |
| Globals Twig via état statique | Subscriber `kernel.controller` |
| Variable persistant entre requêtes par mégarde | Cookies sur la réponse, session pour l'état utilisateur |

> Voir le détail du cycle de requête : [architecture/overview.md §7](/3.1/architecture/overview/#7-flux-dune-requête).
