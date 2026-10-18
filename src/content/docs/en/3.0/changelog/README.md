---
title: Changelog
description: Synapse Medical versioning policy (SemVer + GitHub Releases + Keep
  a Changelog) and history of notable releases.
sidebar:
  label: Changelog
  order: 1
slug: en/3.0/changelog/readme
---

> 🌐 [Version française](/3.0/changelog/readme/) · English version

Synapse Medical follows **[Semantic Versioning](https://semver.org/)**
(`MAJOR.MINOR.PATCH`) and the **[Keep a Changelog](https://keepachangelog.com/en/1.1.0/)**
format.

| Source | Role |
|--------|------|
| [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) (repo root) | **Source of truth**, Keep a Changelog format |
| [GitHub Releases](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases) | One release per published version (tag `vX.Y.Z`) |
| This page | Readable mirror of the release history |

:::note[SemVer convention]
* **MAJOR** — incompatible changes ([breaking changes](/en/3.0/changelog/breaking-changes/)).
* **MINOR** — backward-compatible new features.
* **PATCH** — backward-compatible fixes.
:::

## Current version — `3.0.1`

Patch release of `3.0.0`; application version (`APP_VERSION`).

## In progress (`Unreleased`)

Nothing yet.

## `3.0.1`

Patch release: no new feature, no breaking change.

:::caution[Check before deploying]
* Migration `Version20261015110000` (#62) **stops without changing anything** and lists the duplicates if the database holds several eCRF records for the same study patient, form and visit. The detection query and how to resolve them are described in the migration header. Back up the database before deploying.
* `make db-setup` no longer exists: use `make up` then `make migrate`.
:::

### Removed

* **`make db-setup`, `bin/setup-db.sh` and `docker/db/provision.sql`** (#52): obsolete (the PostgreSQL container creates the role and database, the `php` entrypoint applies the migrations).

### Fixed

* **CSP** (#48): inline scripts carry a nonce and inline event handlers are replaced by `data-*` attributes.
* **eCRF builder preview** (#49): multiple-choice dropdown no longer clipped, theme colours.
* **2FA** (#59): backup codes generated at setup, shown once and managed from the profile; 2FA code submission on the login page fixed.
* **eCRF** (#62): partial unique indexes of `ecrf_record` recreated; the migration lists any duplicates.
* **Invitations** (#63): `assigned_role` default aligned on `member`.
* **Study members** (#74): add and edit pages, users limited to the workspace.
* **Study eCRF creation** (#75): `/studies/{id}/ecrf/new` no longer returns HTTP 500.

### Changed

* CI: Composer authenticated to avoid HTTP 429 errors (#67).

## `3.0.0`

### Breaking changes

* **PostgreSQL 18**: new `database_data_pg18` volume, manual migration (see [Upgrading to PostgreSQL 18](/en/3.0/deployment/postgresql-18-upgrade/)); `POSTGRES_VERSION` removed.
* **`app:seed`**: `--admin-email` / `--admin-password` options removed (use `--admin` and `SEED_ADMIN_PASSWORD`); no default administrator any more: `--reset` requires a named super administrator (`--admin=<email>` when non-interactive).
* **`backup`** service behind the `backup` Compose profile.
* **Mercure 1.0 hub**: `issuer` block, `match=` instead of `topic=`.

### Added

* Developer documentation in French and English, documentation site moved to `synapse-docs`, Quick Start, Mermaid diagrams.
* Quality tooling (PHPStan, php-cs-fixer, Rector), weekly dependency audit, Dependabot on `develop`.
* RBAC permission simulator, adaptive favicon.

### Changed

* **PostgreSQL 18**, **Symfony 8.1**, **PHP 8.5.11** minimum, pinned container images, choices.js 11.
* Several UI pages redesigned and a seed without personal data or default administrator.
* Login: a user without 2FA configured now lands on the `/2fa/setup` page instead of being asked for a non-existent code.
* Doctrine schema back in sync with the migrations and validated in CI; the study identifier is now unique per workspace only; every audit log entry always has an author.

### Security

* symfony/yaml CVE-2026-109413 and symfony/http-foundation CVE-2026-108082 fixed; 48 other advisories fixed by the dependency update.

## `2.0.4`

Internal version, never published as a release: its content is included in `3.0.0`.

### Added

* **"What can this user do"** permissions simulator (RBAC).
* Bilingual developer technical documentation.
* Adaptive favicon (`prefers-color-scheme`).

### Changed

* Redesigned Access page; site KPI based on the **average enrollment rate**.

### Fixed

* Full-width site KPIs; "Reset" button hidden without an active filter.

***

> 📋 The full, detailed history is maintained in [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md). For compatibility
> breaks, see [Breaking changes](/en/3.0/changelog/breaking-changes/).
