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
| [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) (repo root) | **Source of truth**, Keep a Changelog format |
| [GitHub Releases](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases) | One release per published version (tag `vX.Y.Z`) |
| This page | Readable mirror of the release history |

:::note[SemVer convention]
- **MAJOR** — incompatible changes ([breaking changes](/en/changelog/breaking-changes/)).
- **MINOR** — backward-compatible new features.
- **PATCH** — backward-compatible fixes.
:::

## Current version — `2.0.4`

Baseline application version (`APP_VERSION`).

## In progress (`Unreleased`)

### Added

- Bilingual **Quick Start** guide.
- **Mermaid** diagrams (architecture, data model, eCRF workflow).
- **Contribute** and **Security best practices** pages, `CONTRIBUTING.md`.
- Documentation **version selector** and Changelog page.
- **GitHub** / **Discord** links and community footer.

### Changed

- Reworked **Commands** and **API** references (Astro docs style).

## `2.0.4`

### Added

- **"What can this user do"** permissions simulator (RBAC).
- Bilingual developer technical documentation.
- Adaptive favicon (`prefers-color-scheme`).

### Changed

- Redesigned Access page; site KPI based on the **average enrollment rate**.

### Fixed

- Full-width site KPIs; "Reset" button hidden without an active filter.

---

> 📋 The full, detailed history is maintained in [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md). For compatibility
> breaks, see [Breaking changes](/en/changelog/breaking-changes/).
