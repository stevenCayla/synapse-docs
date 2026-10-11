---
title: "Breaking changes"
description: "List of compatibility breaks per major version and the associated migration guides."
sidebar:
  label: "Breaking changes"
  order: 3
---

> 🌐 [Version française](/changelog/breaking-changes/) · English version

This page lists **compatibility breaks** (`MAJOR` changes per [SemVer](https://semver.org/))
and the required migration steps.

:::note
A change appears here only if it **breaks** existing compatibility (database schema, API
contract, required environment variable, default behavior). Backward-compatible additions and
fixes live in the [Changelog](/en/changelog/readme/).
:::

## No pending break

The `[Unreleased]` branch currently contains **no breaking change**.

## History

| Version | Break | Migration |
|---------|-------|-----------|
| `2.0.0` | Encryption keys now required (`APP_TOTP_ENCRYPTION_KEY`, `APP_PATIENT_ENCRYPTION_KEY`, `APP_PATIENT_SEARCH_HMAC_KEY`) | Generate the keys — see [Quick Start §2](/en/getting-started/#-step-2--generate-the-encryption-keys) |

:::caution[Before a major upgrade]
Back up the database and read the matching GitHub Release. Backfill commands (e.g.
`app:patient:encrypt-existing`) are documented in the [Commands reference](/en/commands/readme/).
:::
