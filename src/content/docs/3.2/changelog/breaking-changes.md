---
title: Changements incompatibles
description: Liste des ruptures de compatibilité par version majeure et guides
  de migration associés.
sidebar:
  label: Changements incompatibles
  order: 3
slug: 3.2/changelog/breaking-changes
---

> 🌐 Version française · [English version](/en/3.2/changelog/breaking-changes/)

Cette page recense les **ruptures de compatibilité** (changements `MAJOR` au sens
[SemVer](https://semver.org/lang/fr/)) et les actions de migration nécessaires.

:::note
Un changement n'apparaît ici que s'il **casse** une compatibilité existante (schéma de base,
contrat d'API, variable d'environnement requise, comportement par défaut). Les ajouts et
corrections rétrocompatibles sont dans le [Journal des modifications](/3.2/changelog/readme/).
:::

## Aucune rupture en attente

La branche `[Unreleased]` ne contient actuellement **aucun changement incompatible**.

## Historique

| Version | Rupture | Migration |
|---------|---------|-----------|
| `3.0.0` | PostgreSQL 18 : nouveau volume `database_data_pg18`, `POSTGRES_VERSION` supprimée | [Migration vers PostgreSQL 18](/3.2/deployment/postgresql-18-upgrade/) |
| `3.0.0` | `app:seed` : options `--admin-email` / `--admin-password` supprimées | Utiliser `--admin=<email>` et `SEED_ADMIN_PASSWORD` ; `--reset` exige un super-administrateur nommé (plus de compte par défaut) |
| `3.0.0` | Service `backup` derrière le profil Compose `backup` | `--profile backup` ou `COMPOSE_PROFILES=backup` |
| `3.0.0` | Hub Mercure 1.0 : bloc `issuer`, `match=` à la place de `topic=` | Adapter toute configuration Caddy personnalisée |
| `2.0.0` | Clés de chiffrement obligatoires (`APP_TOTP_ENCRYPTION_KEY`, `APP_PATIENT_ENCRYPTION_KEY`, `APP_PATIENT_SEARCH_HMAC_KEY`) | Générer les clés — voir [Quick Start §2](/3.2/getting-started/#-étape-2--générer-les-clés-de-chiffrement) |

:::caution[Avant une montée de version majeure]
Sauvegarder la base de données et lire la GitHub Release correspondante. Les commandes de
backfill (ex. `app:patient:encrypt-existing`) sont documentées dans la
[Référence des commandes](/3.2/commands/readme/).
:::
