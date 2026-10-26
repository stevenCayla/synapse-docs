---
title: "Releases & release process"
description: "How Synapse Medical versions are numbered, tagged and published via GitHub Releases."
sidebar:
  label: "Releases"
  order: 2
---

> 🌐 [Version française](/changelog/releases/) · English version

Every published version is materialized by a **Git tag `vX.Y.Z`** and an associated
**[GitHub Release](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases)**.

## Numbering (SemVer)

`MAJOR.MINOR.PATCH` — see [Semantic Versioning](https://semver.org/).

| Increment | When | Example |
|-----------|------|---------|
| **MAJOR** | Incompatible change | `3.0.0` → `4.0.0` |
| **MINOR** | Backward-compatible feature | `3.0.0` → `3.1.0` |
| **PATCH** | Backward-compatible fix | `3.0.0` → `3.0.1` |

The version is that of the latest `vX.Y.Z` git tag: the image receives it at build time in the `APP_VERSION` environment variable (`vX.Y.Z` on a tag, `vX.Y.Z-N-gsha` between two tags, `dev` in development), with no file to edit.

## Publishing process

1. Group the `[Unreleased]` changes in [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) under a dated version number.
2. Tag: `git tag -a v2.1.0 -m "Release 2.1.0"` then `git push --tags`.
3. Create the matching **GitHub Release** (notes = changelog section).
4. No version to edit in the repository: the tag is authoritative. The documentation version selector is
   **derived automatically** from the latest tag at build time — nothing else to do.

:::tip
Release notes reuse the matching `CHANGELOG.md` section **word for word**. One source of
truth, two distribution points.
:::

See also: [Changelog](/en/changelog/readme/) ·
[Breaking changes](/en/changelog/breaking-changes/) ·
[Release process (deployment)](/en/deployment/release-process/).
