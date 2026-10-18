---
title: Releases & release process
description: How Synapse Medical versions are numbered, tagged and published via
  GitHub Releases.
sidebar:
  label: Releases
  order: 2
slug: en/3.0/changelog/releases
---

> 🌐 [Version française](/3.0/changelog/releases/) · English version

Every published version is materialized by a **Git tag `vX.Y.Z`** and an associated
**[GitHub Release](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases)**.

## Numbering (SemVer)

`MAJOR.MINOR.PATCH` — see [Semantic Versioning](https://semver.org/).

| Increment | When | Example |
|-----------|------|---------|
| **MAJOR** | Incompatible change | `3.0.0` → `4.0.0` |
| **MINOR** | Backward-compatible feature | `3.0.0` → `3.1.0` |
| **PATCH** | Backward-compatible fix | `3.0.0` → `3.0.1` |

The current version is exposed by the `APP_VERSION` environment variable (**`3.0.1`**).

## Publishing process

1. Group the `[Unreleased]` changes in [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) under a dated version number.
2. Tag: `git tag -a v2.1.0 -m "Release 2.1.0"` then `git push --tags`.
3. Create the matching **GitHub Release** (notes = changelog section).
4. Bump `APP_VERSION` (`.env`). The documentation version selector is **derived
   automatically** from this variable at build time — nothing else to do.

:::tip
Release notes reuse the matching `CHANGELOG.md` section **word for word**. One source of
truth, two distribution points.
:::

See also: [Changelog](/en/3.0/changelog/readme/) ·
[Breaking changes](/en/3.0/changelog/breaking-changes/) ·
[Release process (deployment)](/en/3.0/deployment/release-process/).
