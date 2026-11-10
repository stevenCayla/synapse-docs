---
title: "QA"
description: "Synapse Medical test strategy — PHPUnit tests, how to run them, coverage, manual pre-release QA and CI status."
---

> 🌐 [Version française](/qa/readme/) · English version

Synapse Medical quality rests on two pillars: a **PHPUnit unit test suite** that
locks down the critical rules (access control, workspace isolation, encryption,
password policy, sessions), and a **manual QA pass** run before every release
for end-to-end flows.

## Pages in this section

| Page | Content |
|------|---------|
| [QA acceptance checklist — Security](/qa/security-checklist/) (French) | Detailed QA of the security settings: sessions, warning modal, lockout, passwords… |
| [Acceptance test of an ophthalmology study](/en/qa/ophthalmology-acceptance-test/) | Step-by-step test for an ophthalmologist: study creation wizard, per-eye import, eye-by-eye entry, query, signature, test exports |

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

- **`tests/bootstrap.php`** loads `vendor/autoload.php` then runs
  `Dotenv::bootEnv()` on `.env`: `.env`, `.env.local`, `.env.test` and
  `.env.test.local` are read following the usual Symfony cascade.
- **`.env.test`** only defines `KERNEL_CLASS` and a test `APP_SECRET`.
- **Test database**: `config/packages/doctrine.yaml` appends the `_test` suffix to
  the database name in the `test` environment (plus `TEST_TOKEN` with ParaTest).
  Current tests do not use it, but it is the database to use when checking
  migrations (see [Release process](/en/deployment/release-process/#check-migrations-on-a-fresh-database)).
- Tests run in the **development** `php` container: the production image ships
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

### Parallel run (per pull request)

```bash
make test-parallel                               # 8 processes (PROCS=8 by default)
make test-parallel PROCS=12 c="--filter Wizard"  # other process count, ParaTest/PHPUnit options
```

`make test-parallel` runs [ParaTest](https://github.com/paratestphp/paratest): one database per process
(`app_test1`, `app_test2`… through `TEST_TOKEN`, created and migrated on every call) and one temporary
directory per process (`tests/parallel-prepend.php`). The test and assertion counts are identical to the
serial run (1999 tests, 11795 assertions), in about 2 minutes instead of 7 to 11 (16-core machine, loaded).

Rule: parallel is for validating **a pull request**; the serial run (`make test`) stays the reference and stays
**mandatory** for the full verification on `develop` after a batch of merges. A parallel failure is replayed in
series before concluding. Random order (`--order-by=random`) is not supported: the suite has existing order
dependencies, which also fail in series with the same seed.

:::tip[Writing a new test]
Put the test in the directory mirroring the tested class
(`src/Security/Voter/XxxVoter.php` → `tests/Security/XxxVoterTest.php`). Every
new voter or service handling business resources must include at least one
**"resource from another workspace → denied"** test, in line with the strict
workspace isolation rule.
:::

## End-to-end tests (Playwright)

A `@playwright/test` suite (Chromium) drives the application in a real browser:
`tests/e2e/` (`package.json`, `playwright.config.ts`, `specs/`, `support/`). It
covers:

- the first login (2FA setup, backup codes, forced password change, second
  login with a TOTP code);
- login with a backup code, then the same code being refused;
- a smoke test of the main pages (home, study, patients, members, sites, eCRF,
  users, access matrix, eCRF templates and preview, security settings,
  profile): HTTP 200, no console error, no Content Security Policy violation;
- adding and editing a study member, creating an eCRF from scratch and from a
  template.

Any console error or CSP message fails the running test.

```bash
make up                  # the development stack must be running (https://localhost)
make e2e                 # installs the dependencies and Chromium if needed, then runs the suite
make e2e c="--headed"    # Playwright options
```

The suite **resets the database** (`app:seed --reset`) with the super
administrator `e2e.admin@example.com`: only run it on a disposable environment.
The suite refuses to start unless `CI` or `E2E_ALLOW_RESET=1` is set; `make e2e`
prints the Compose project and the base URL and waits for you to type `yes`.
Variables: `E2E_BASE_URL` (default `https://localhost`), `E2E_ALLOW_RESET=1`
(confirms the reset), `E2E_SKIP_SEED=1`
(keep the database, to rerun one project with `--no-deps`), `E2E_OUTPUT_DIR`
(HTML report and traces, a temporary folder by default: they are written outside
the source tree because FrankenPHP hot reload would reload the pages on every
image written).

### Running the suite reliably

The development stack watches its files (`FRANKENPHP_WORKER_CONFIG=watch`,
`FRANKENPHP_SITE_CONFIG=hot_reload`): each time a PHP, Twig, YAML or image file changes under
`/app`, FrankenPHP reboots its PHP threads and reloads every open page. During a run this closes
the wizard dialog or reloads a page in the middle of a step, and the spec fails for no reason
(measured: one file change every 2 s fails 3 runs out of 8 of spec 11 and 9 out of 10 of the spec 33
"progress" test). An edit, a branch switch, a `cache:clear` or a cache rebuild is enough.

For a reliable run, use a disposable stack **without watching**, with the `compose.e2e.yaml` file
(opt-in, never loaded by default; the usual development stack and production are unchanged):

```bash
export COMPOSE_PROJECT_NAME=synapse-e2e IMAGES_PREFIX=e2e- HTTP_PORT=24080 HTTPS_PORT=24443 HTTP3_PORT=24443
export COMPOSE_FILE=compose.yaml:compose.override.yaml:compose.e2e.yaml
docker compose up -d --wait
E2E_BASE_URL=https://localhost:24443 E2E_OUTPUT_DIR=/tmp/e2e-out make e2e
```

One script does all of this the same way, from a linked git worktree (never the main checkout): `bin/verify up`
recreates the stack from a fresh volume (never a stale worker), `bin/verify check --phpunit=parallel --e2e=none|<specs>|full` runs the
checks from the cheapest to the most expensive (changelog, `git diff --check`, `make qa`, migrations, schema, OpenAPI,
PHPUnit, E2E) and writes a report (step, duration, log, commit tested, verdict); `bin/verify down` removes the stack, its
images and, with `--worktree`, the worktree. The PHPUnit mode (`parallel` per PR, `serial` is the reference: only `serial` with `--e2e=full` gives the complete verdict) and the E2E scope are always explicit, every E2E run starts from a fresh seed,
and a partial scope or a step not run is never presented as a pass (exit code 3).

Without watching, the code is read when the workers start: after a code change,
`docker compose restart php worker` (the Messenger `worker` is never hot-reloaded). Do not edit files of the tree
during the run. The suite prints a warning when the stack still watches its files. The profile switcher specs
(`38-profile-switcher`) only run with `APP_ENVIRONMENT_LABEL=local APP_PROFILE_SWITCHER=1` in the environment of the
stack.

**Which run, when** (no CI runs on pull requests to `develop`, everything is verified locally):

- Per pull request: full PHPUnit, `make qa`, migrations and `doctrine:schema:validate`, `make openapi` with no diff,
  and **only the E2E specs concerned**.
- The **full** E2E suite is added when the PR touches the demo data or the seed commands, the layouts or shared
  templates, the login or session, the study wizard, or the E2E support code and configuration (a seed change once
  broke specs the PR did not touch).
- One full run on `develop` after each batch of merges. If `develop` is red, nothing more is merged until it is green.
- After merging `develop` into a branch, or after changing a message handler, recreate the stack or run
  `docker compose restart php worker`: a stale worker once produced a false failure. After resolving a merge conflict,
  read the diff against `develop` before pushing. Playwright `retries` stays at 0.

**Writing fast specs** (where the time of a run goes):

- A sign-in goes through `submitCredentials` (`support/login.ts`), which asks the browser for the "reduce motion"
  preference: the login page then skips its wave animation (a second or more) before it sends the form. The first-login
  scenario (`01-first-login`) keeps the animation.
- The server keeps no memory of the TOTP codes already used: `currentTotp` (`support/totp.ts`) returns the code of the
  current window and only waits for the next one in the last three seconds of a window. If the server ever refuses to
  replay a code, this is the place to wait for the next window.
- A screenshot is taken at the end of every test (`screenshot: 'only-on-failure'`): when the test stops right after a
  navigation, it waits up to 5 s for the fonts of a half-loaded page. The `problems` fixture (`support/fixtures.ts`)
  therefore lets the page finish loading before the test ends.
- A `waitForTimeout` is only acceptable for a pause the test means to observe (an autosave that must not fire, a
  debounce delay); otherwise wait for the condition (network response, text, state).
- Data clean-up (drafts, for example) only goes through the screen when the screen is what the test verifies.

A new `NN-….spec.ts` file runs with no other setting: the `wizard` project takes every spec that the other projects
(`first-login`, `app`, `backup-code`, `public-pages`) do not claim. The specs share one account: do not renumber
them, the order of the files matters.

## Continuous integration

| Check | Run in CI? |
|-------|------------|
| Docker image build (dev target) + startup | Yes (**Tests** job) |
| HTTP and Mercure hub reachability | Yes (**Tests**) |
| Test database creation + migrations | Yes (**Tests**) |
| **PHPUnit** | Yes (**Tests**) |
| **Playwright end-to-end tests** (browser, no console error or CSP violation) | Yes (**E2E** job; HTML report and traces uploaded as an artifact on failure) |
| php-cs-fixer, PHPStan (level 6, with a baseline), Rector | Yes (**Quality** job) |
| `composer audit` | Yes (**Security** job, when `composer.json` or `composer.lock` changes; weekly `dependency-audit.yaml` audit) |
| Lint (`super-linter/slim`) | Yes (**Lint**) |
| **`doctrine:schema:validate`** | Yes (**Tests**, on the database built from the migrations) |

On a pull request that only touches `docs/**` or `*.md` files, the **Tests**
and **E2E** jobs are skipped (**Changes** job); **Lint** always runs.

To limit the GitHub Actions minutes used:

- **Tests** and **E2E** are skipped while the pull request is a **draft**; they start when it is marked ready
  (`gh pr ready`) and are still required before the merge, which is refused for a draft.
- A new push cancels the run in progress of the same pull request.
- **Lint** only checks the changed files on a pull request, and the whole codebase on a push to `develop` or `main`.
- The Docker build cache is written by the pushes to `develop` and `main` (which do not run **Quality**
  on `develop`) and only read by the pull requests.

:::note[Before a release]
CI covers the tests, static analysis and a few browser flows, not every flow: also
run the manual QA checklist below.
:::

## Manual QA checklist

Run before every release, on an environment loaded with the test dataset
(`make seed`), with at least **two workspaces** and users with different roles.
For security settings in detail, see the
[Security QA checklist](/qa/security-checklist/) (French).

### Authentication

- [ ] Log in with username / password, then enter the TOTP code.
- [ ] A user without TOTP configured is redirected to `/2fa/setup`.
- [ ] Invalid TOTP code rejected; lockout after the configured number of failures.
- [ ] Forced password change applied when required; the password policy is enforced.
- [ ] Session expiry after inactivity: warning modal, then logout.

### Workspace isolation

- [ ] Switching workspace fully reloads lists, filters and dashboards.
- [ ] No study, patient or document from workspace A appears in workspace B.
- [ ] Typing the ID of a resource from another workspace in the URL → **403 or 404**.
- [ ] A newly created resource is attached to the active workspace.

### Studies and eCRF

- [ ] A `viewer` cannot change anything; a `manager` handles patients and data; an `admin` manages the study.
- [ ] eCRF entry: first entry needs no reason; any **change** to an existing value requires a reason for change.
- [ ] The reason and the before / after values appear in the audit history.
- [ ] A frozen study no longer accepts data entry.
- [ ] Opening and closing a query on a field.
- [ ] Electronic signature of a form.

### Exports

- [ ] Study data export (CSV / Excel): content matches the screen.
- [ ] A user restricted to one site only exports that site's patients.
- [ ] The export is recorded in the activity log.

### Private files

- [ ] Avatar, feedback attachments and clinical documents are served only through `/private/...`.
- [ ] A `/private/clinical/{token}` URL opened by a user without access to the study → denied.
- [ ] No uploaded file is reachable under `public/`.
- [ ] An uploaded image no longer contains EXIF metadata.

### After deployment

- [ ] The displayed version (login page, footer) matches the git tag of the build (`vX.Y.Z`, or `vX.Y.Z-N-gsha` between two tags).
- [ ] Production smoke test described in the [Release process](/en/deployment/release-process/#7-deploy-to-the-server).

## See also

- [Release process](/en/deployment/release-process/) · [Production deployment](/en/deployment/production/)
- [QA acceptance checklist — Security](/qa/security-checklist/) (French)
- [Contribution guide](/en/contribute/)
