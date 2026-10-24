---
title: QA
description: Synapse Medical test strategy — PHPUnit tests, how to run them,
  coverage, manual pre-release QA and CI status.
slug: 3.1/en/3.0/qa/readme
---

> 🌐 [Version française](/3.1/3.0/qa/readme/) · English version

Synapse Medical quality rests on two pillars: a **PHPUnit unit test suite** that
locks down the critical rules (access control, workspace isolation, encryption,
password policy, sessions), and a **manual QA pass** run before every release
for end-to-end flows.

## Pages in this section

| Page | Content |
|------|---------|
| [QA acceptance checklist — Security](/3.1/3.0/qa/security-checklist/) (French) | Detailed QA of the security settings: sessions, warning modal, lockout, passwords… |

## Test layout

Tests live in `tests/` and mirror the `src/` tree:

| Directory | What is tested | Examples |
|-----------|----------------|----------|
| `tests/Controller/` | Logic extracted from controllers | `EcrfReasonForChangeTest` (detecting a change that requires a reason), `SessionExpireControllerTest` |
| `tests/Entity/` | Business rules carried by entities | `StudyFreezeTest`, `PatientConsentTest`, `StudyRoleTest`, `SiteRoleTest`, `StudySiteTest` |
| `tests/Enum/` | Enums and state transitions | `StudyPatientStatusTest`, `StudySiteStatusTransitionTest`, `EcrfQueryStatusTest` |
| `tests/EventListener/` | Doctrine listeners | `TotpEncryptionListenerTest` (TOTP secret encryption) |
| `tests/EventSubscriber/` | Kernel subscribers | `SessionInactivitySubscriberTest` |
| `tests/Security/` | Voters and security policy | `StudyVoterTest`, `PatientVoterTest`, `EcrfRecordVoterTest`, `PasswordPolicyServiceTest`, `SecuritySettingsProviderTest` |
| `tests/Service/` | Application services | `StudyAccessServiceTest`, `SiteAccessServiceTest`, `EncryptionServiceTest`, `StudyExportServiceTest`, `MatchIdServiceTest`, `WorkspaceModuleManagerTest` |
| `tests/Repository/` | *(empty for now)* | — |

The suite has **27 test classes**. All of them extend
`PHPUnit\Framework\TestCase`: they are **pure unit tests**, with no Symfony
kernel boot and no database. Dependencies (repositories, `Security`,
`RequestStack`, clock…) are replaced by mocks.

:::note[No functional tests yet]
There is currently no `WebTestCase`, no `KernelTestCase` and no test fixtures.
Full HTTP flows (forms, redirects, templates) are covered only by the
[manual QA checklist](#manual-qa-checklist).
:::

## What is covered

| Area | Test classes | Guarantees checked |
|------|--------------|--------------------|
| **Workspace isolation** | `StudyVoterTest`, `PatientVoterTest`, `EcrfRecordVoterTest` | A resource from another workspace is denied, even for a super-admin; denied when there is no active workspace |
| **Study access control** | `StudyVoterTest`, `StudyAccessServiceTest`, `StudyRoleTest` | `viewer` / `manager` / `admin` roles, owner = admin, non-member denied, per-request cache |
| **Investigator site restriction** | `SiteAccessServiceTest`, `SiteAccessPatientEnforcementTest`, `StudyExportServiceTest` | A user restricted to one site neither sees nor exports patients from other sites |
| **Password policy** | `PasswordPolicyServiceTest`, `SecuritySettingsProviderTest` | Minimum length, uppercase, lowercase, digit, special character, configurable settings |
| **Encryption** | `EncryptionServiceTest`, `TotpEncryptionListenerTest` | Key validation, encryption / decryption of PII and TOTP secrets, idempotence, legacy plaintext compatibility, wrong key rejected |
| **Sessions** | `SessionInactivitySubscriberTest`, `SessionExpireControllerTest` | Server-side expiry after inactivity, excluded routes, logged session invalidation |
| **eCRF** | `EcrfReasonForChangeTest`, `EcrfQueryStatusTest`, `EcrfRecordVoterTest` | Reason for change required only on an actual change, query lifecycle, locked records |
| **Lifecycle** | `StudyFreezeTest`, `StudyPatientStatusTest`, `StudySiteStatusTransitionTest`, `PatientConsentTest`, `PatientTest` | Study freeze / unfreeze, allowed status transitions, patient consent, age calculation |
| **Modules and integrations** | `WorkspaceModuleManagerTest`, `MatchIdServiceTest` | Per-workspace module activation; MatchID API (death registry) token lifecycle |

## PHPUnit configuration

`phpunit.dist.xml` (PHPUnit 13) is deliberately strict:

| Setting | Value | Effect |
|---------|-------|--------|
| `failOnDeprecation` | `true` | Any deprecation fails the suite |
| `failOnNotice` | `true` | Any PHP notice fails the suite |
| `failOnWarning` | `true` | Any warning fails the suite |
| `bootstrap` | `tests/bootstrap.php` | Loads the autoloader and environment variables |
| `APP_ENV` | `test` (forced) | Symfony test environment |
| `SHELL_VERBOSITY` | `-1` | Silent console output |
| `error_reporting` | `-1` | All errors are reported |
| `<source>` | `src/` | Scope for deprecation analysis and coverage |
| `restrictNotices` / `restrictWarnings` | `true` | Only notices / warnings raised from `src/` count |
| `ignoreIndirectDeprecations` | `true` | Deprecations internal to dependencies are ignored |

Doctrine (`Doctrine\Deprecations\Deprecation::trigger`) and Symfony
(`trigger_deprecation`) deprecations are declared as triggers: calling a
deprecated API from `src/` breaks the suite.

## Test environment

* **`tests/bootstrap.php`** loads `vendor/autoload.php` then runs
  `Dotenv::bootEnv()` on `.env`: `.env`, `.env.local`, `.env.test` and
  `.env.test.local` are read following the usual Symfony cascade.
* **`.env.test`** only defines `KERNEL_CLASS` and a test `APP_SECRET`.
* **Test database**: `config/packages/doctrine.yaml` appends the `_test` suffix to
  the database name in the `test` environment (plus `TEST_TOKEN` with ParaTest).
  Current tests do not use it, but it is the database to use when checking
  migrations (see [Release process](/en/3.1/3.0/deployment/release-process/#check-migrations-on-a-fresh-database)).
* Tests run in the **development** `php` container: the production image ships
  neither `tests/` nor the `require-dev` dependencies.

## Running the tests

```bash
make test                                        # whole suite
make test c="--filter StudyVoterTest"            # one class
make test c="--filter testRejectsStudyFromDifferentWorkspace"   # one test
make test c="tests/Security"                     # one directory
make test c="--stop-on-failure --testdox"        # stop at first failure, readable output
```

Without Make:

```bash
docker compose exec -e APP_ENV=test php bin/phpunit
```

:::tip[Writing a new test]
Put the test in the directory mirroring the tested class
(`src/Security/Voter/XxxVoter.php` → `tests/Security/XxxVoterTest.php`). Every
new voter or service handling business resources must include at least one
**"resource from another workspace → denied"** test, in line with the strict
workspace isolation rule.
:::

## Continuous integration

| Check | Run in CI? |
|-------|------------|
| Docker image build (dev target) + startup | Yes (**Tests** job) |
| HTTP and Mercure hub reachability | Yes (**Tests**) |
| Test database creation + migrations | Yes (**Tests**) |
| **PHPUnit** | Yes (**Tests**) |
| php-cs-fixer, PHPStan (level 6, with a baseline), Rector | Yes (**Quality** job) |
| `composer audit` | Yes (**Security** job, when `composer.json` or `composer.lock` changes; weekly `dependency-audit.yaml` audit) |
| Lint (`super-linter/slim`) | Yes (**Lint**) |
| **`doctrine:schema:validate`** | Yes (**Tests**, on the database built from the migrations) |

On a pull request that only touches `docs/**` or `*.md` files, the **Tests**
job is skipped (**Changes** job); **Lint** always runs.

:::note[Before a release]
CI covers the tests and static analysis, not the end-to-end flows: also run the
manual QA checklist below.
:::

## Manual QA checklist

Run before every release, on an environment loaded with the test dataset
(`make seed`), with at least **two workspaces** and users with different roles.
For security settings in detail, see the
[Security QA checklist](/3.1/3.0/qa/security-checklist/) (French).

### Authentication

* \[ ] Log in with username / password, then enter the TOTP code.
* \[ ] A user without TOTP configured is redirected to `/2fa/setup`.
* \[ ] Invalid TOTP code rejected; lockout after the configured number of failures.
* \[ ] Forced password change applied when required; the password policy is enforced.
* \[ ] Session expiry after inactivity: warning modal, then logout.

### Workspace isolation

* \[ ] Switching workspace fully reloads lists, filters and dashboards.
* \[ ] No study, patient or document from workspace A appears in workspace B.
* \[ ] Typing the ID of a resource from another workspace in the URL → **403 or 404**.
* \[ ] A newly created resource is attached to the active workspace.

### Studies and eCRF

* \[ ] A `viewer` cannot change anything; a `manager` handles patients and data; an `admin` manages the study.
* \[ ] eCRF entry: first entry needs no reason; any **change** to an existing value requires a reason for change.
* \[ ] The reason and the before / after values appear in the audit history.
* \[ ] A frozen study no longer accepts data entry.
* \[ ] Opening and closing a query on a field.
* \[ ] Electronic signature of a form.

### Exports

* \[ ] Study data export (CSV / Excel): content matches the screen.
* \[ ] A user restricted to one site only exports that site's patients.
* \[ ] The export is recorded in the activity log.

### Private files

* \[ ] Avatar, feedback attachments and clinical documents are served only through `/private/...`.
* \[ ] A `/private/clinical/{token}` URL opened by a user without access to the study → denied.
* \[ ] No uploaded file is reachable under `public/`.
* \[ ] An uploaded image no longer contains EXIF metadata.

### After deployment

* \[ ] The displayed version (login page, footer) matches `APP_VERSION`.
* \[ ] Production smoke test described in the [Release process](/en/3.1/3.0/deployment/release-process/#7-deploy-to-the-server).

## See also

* [Release process](/en/3.1/3.0/deployment/release-process/) · [Production deployment](/en/3.1/3.0/deployment/production/)
* [QA acceptance checklist — Security](/3.1/3.0/qa/security-checklist/) (French)
* [Contribution guide](/en/3.1/3.0/contribute/)
