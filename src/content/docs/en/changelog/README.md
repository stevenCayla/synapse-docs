---
title: "Changelog"
description: "Synapse Medical versioning policy (SemVer + GitHub Releases + Keep a Changelog) and history of notable releases."
sidebar:
  label: "Changelog"
  order: 1
---

> 🌐 [Version française](/changelog/readme/) · English version

Synapse Medical follows **[Semantic Versioning](https://semver.org/)**
(`MAJOR.MINOR.PATCH`) and the **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**
format.

| Source | Role |
|--------|------|
| [`CHANGELOG.md`](https://github.com/stevenCayla/synapse-app/blob/main/CHANGELOG.md) (repo root) | **Source of truth**, Keep a Changelog format |
| [GitHub Releases](https://github.com/stevenCayla/synapse-app/releases) | One release per published version (tag `vX.Y.Z`) |
| This page | Readable mirror of the release history |

:::note[SemVer convention]
- **MAJOR** — incompatible changes ([breaking changes](/en/changelog/breaking-changes/)).
- **MINOR** — backward-compatible new features.
- **PATCH** — backward-compatible fixes.
:::

## Current version — `3.3.0`

Restricted access to the IPP (display, entry, search, exports), IPP and sex column import, environment banner, documentation link on the login page; displayed version derived from the git tag.

## In progress (`Unreleased`)

Nothing yet.

## `3.3.0`

Release that restricts access to the IPP and improves the import, the login page and environment identification.

:::caution[Check before deploying]
- **Version from the tag** (#248): export `APP_VERSION="$(bin/app-version)"` and `APP_REVISION="$(git rev-parse HEAD)"` before the build (`make build` does it) and remove `APP_VERSION` from the servers' `.env.local`.
- **Optional variables**: `APP_DOCS_URL` (#247); `APP_ENVIRONMENT_LABEL` (#252), empty in production (no banner); `MAILER_ALLOWED_RECIPIENTS` (#249), empty in production, required as soon as `APP_ENVIRONMENT_LABEL` is set (empty list = no e-mail sent).
- **Exports and IPP** (#269): the IPP is no longer exported and is visible only to the site investigators and administrators; IPP search is an exact match.
- No migration or command to run; recreate the worker.
:::

### Added

- **Restricted IPP access** (#269), "Patient IPP" import target and patient sex (#261), **environment banner** (#252), documentation link on the login page (#247).

### Changed

- CSV / XLSX exports of patients and eCRFs without the IPP (#269); displayed version computed from the git tag (#248).

### Fixed

- Import: correcting an empty cell (#254), reloading the Import step (#255), replacement confirmation (#256), warning without a data column (#259), screen polish (#260).

## `3.2.0`

Release that ships the study creation wizard end to end, per-workspace job titles and a hardening of data security.

:::caution[Check before deploying]
- **Database role `app_runtime`** (#155): the application no longer connects as the owner; `POSTGRES_APP_PASSWORD` is mandatory in production and the role is created before deploying (see the production guide). Row-level security is now closed by default.
- **New `APP_FILE_ENCRYPTION_KEY` key** (#90), mandatory in production, and **recreate the worker** on every deployment.
- **Demote former Owners** (#224): `app:security:workspace-owner-roles` (list), then `--apply --user=<email>` for each Owner who is not a platform administrator.
- **Automatic migrations** at startup (including `Version20261024140000` and `Version20261024160000`): back up the database before deploying. Then run `app:regulatory-packs:seed`.
- The documentation sync on `develop` is paused (#228). Known limitation (#239): an existing account invited as administrator or Owner does not reach the admin screens yet.
:::

### Added

- **Study creation wizard**: prospective and retrospective paths, Essential and Advanced modes, four-step data import applied by the worker, team and GCP certificates, printable study sheet, go-live checklist.
- **Regulatory file**, versioned packs and their administration, rules engine, electronic signatures and study lifecycle (Configuration).
- **Per-workspace job titles**, chosen when inviting (#217, #219, #222).

### Changed

- Shared authentication pages (#220), fonts and icons served by the application (#157), CI suspended outside releases.

### Fixed

- Invitation of an address that already has an account (#223, #238), invitation and password pages (#221), adding a member who is already present (#104), adding a patient to a study that has visits (#115), TLS certificates of the production image (#214) and many wizard polish items.

### Security

- Restricted database role and closed row-level security (#155); a workspace Owner is no longer a super administrator (#224); an invited existing account no longer changes its global roles (#238); account actions reserved to the Owner (#234).

## `3.1.0`

Intermediate release: it ships the foundation of the study creation wizard and the closing of a study, **without any new creation or import screen**.

:::caution[Check before deploying]
- **No import screen**: the old import is removed (#82) and the new one has no interface yet (service, worker and JSON endpoints only).
- **Start the new `worker` service** (#88) and recreate it on every deployment (`up -d --force-recreate worker` without a rebuild); failed messages are handled with `messenger:failed:show` / `retry` / `remove`.
- **Named volume `private_uploads`** (#108): if files have already been uploaded in production, copy them out before deploying and back into the volume (see the production guide).
- **Two migrations**, applied at startup: `Version20261017160000` (#83) and `Version20261018091435` (#88). Back up the database before deploying; no manual data migration.
- `MESSENGER_TRANSPORT_DSN` is built into the image (nothing to add); `IMPORT_ASYNC_THRESHOLD` is optional (2000 by default).
:::

### Added

- **Closing a prospective study** (#84): "Clôturer l'étude" button, restricted to administrators, once the data are locked.
- **Wizard v2 data model** (#83), **data import** service (#87), **Messenger worker** for large files (#88) and **eCRF field definition from the columns** (#92): no screen in this release.
- Playwright **end-to-end tests**, run in CI (#80).

### Changed

- CI dependencies and Composer patches (#96); the `worker` service also starts in development.

### Removed

- **Old data import** (#82) and its menu entries.

### Fixed

- **Uploaded files** kept when the container is recreated in production (#108).
- **Freezing and unfreezing a study**: no more HTTP 500 (#84).
- **Fresh clone**: no more HTTP 500 on `/login`, development secrets generated (#50).
- **eCRF autosave**: same rules as the full entry (#82); a duplicated study stays in its workspace.

## `3.0.1`

Patch release: no new feature, no breaking change.

:::caution[Check before deploying]
- Migration `Version20261015110000` (#62) **stops without changing anything** and lists the duplicates if the database holds several eCRF records for the same study patient, form and visit. The detection query and how to resolve them are described in the migration header. Back up the database before deploying.
- `make db-setup` no longer exists: use `make up` then `make migrate`.
:::

### Removed

- **`make db-setup`, `bin/setup-db.sh` and `docker/db/provision.sql`** (#52): obsolete (the PostgreSQL container creates the role and database, the `php` entrypoint applies the migrations).

### Fixed

- **CSP** (#48): inline scripts carry a nonce and inline event handlers are replaced by `data-*` attributes.
- **eCRF builder preview** (#49): multiple-choice dropdown no longer clipped, theme colours.
- **2FA** (#59): backup codes generated at setup, shown once and managed from the profile; 2FA code submission on the login page fixed.
- **eCRF** (#62): partial unique indexes of `ecrf_record` recreated; the migration lists any duplicates.
- **Invitations** (#63): `assigned_role` default aligned on `member`.
- **Study members** (#74): add and edit pages, users limited to the workspace.
- **Study eCRF creation** (#75): `/studies/{id}/ecrf/new` no longer returns HTTP 500.

### Changed

- CI: Composer authenticated to avoid HTTP 429 errors (#67).

## `3.0.0`

### Breaking changes

- **PostgreSQL 18**: new `database_data_pg18` volume, manual migration (see [Upgrading to PostgreSQL 18](/en/deployment/postgresql-18-upgrade/)); `POSTGRES_VERSION` removed.
- **`app:seed`**: `--admin-email` / `--admin-password` options removed (use `--admin` and `SEED_ADMIN_PASSWORD`); no default administrator any more: `--reset` requires a named super administrator (`--admin=<email>` when non-interactive).
- **`backup`** service behind the `backup` Compose profile.
- **Mercure 1.0 hub**: `issuer` block, `match=` instead of `topic=`.

### Added

- Developer documentation in French and English, documentation site moved to `synapse-docs`, Quick Start, Mermaid diagrams.
- Quality tooling (PHPStan, php-cs-fixer, Rector), weekly dependency audit, Dependabot on `develop`.
- RBAC permission simulator, adaptive favicon.

### Changed

- **PostgreSQL 18**, **Symfony 8.1**, **PHP 8.5.11** minimum, pinned container images, choices.js 11.
- Several UI pages redesigned and a seed without personal data or default administrator.
- Login: a user without 2FA configured now lands on the `/2fa/setup` page instead of being asked for a non-existent code.
- Doctrine schema back in sync with the migrations and validated in CI; the study identifier is now unique per workspace only; every audit log entry always has an author.

### Security

- symfony/yaml CVE-2026-109413 and symfony/http-foundation CVE-2026-108082 fixed; 48 other advisories fixed by the dependency update.

## `2.0.4`

Internal version, never published as a release: its content is included in `3.0.0`.

### Added

- **"What can this user do"** permissions simulator (RBAC).
- Bilingual developer technical documentation.
- Adaptive favicon (`prefers-color-scheme`).

### Changed

- Redesigned Access page; site KPI based on the **average enrollment rate**.

### Fixed

- Full-width site KPIs; "Reset" button hidden without an active filter.

---

> 📋 The full, detailed history is maintained in [`CHANGELOG.md`](https://github.com/stevenCayla/synapse-app/blob/main/CHANGELOG.md). For compatibility
> breaks, see [Breaking changes](/en/changelog/breaking-changes/).
