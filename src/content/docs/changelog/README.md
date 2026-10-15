---
title: "Journal des modifications"
description: "Politique de versioning de Synapse Medical (SemVer + GitHub Releases + Keep a Changelog) et historique des versions notables."
sidebar:
  label: "Journal des modifications"
  order: 1
---

> 🌐 Version française · [English version](/en/changelog/readme/)

Synapse Medical suit le **[Semantic Versioning](https://semver.org/lang/fr/)**
(`MAJOR.MINOR.PATCH`) et le format **[Keep a Changelog](https://keepachangelog.com/fr/1.1.0/)**.

| Source | Rôle |
|--------|------|
| [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) (racine du dépôt) | **Source de vérité**, format Keep a Changelog |
| [GitHub Releases](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases) | Une release par version publiée (tag `vX.Y.Z`) |
| Cette page | Reflet lisible de l'historique des versions |

:::note[Convention SemVer]
- **MAJOR** — changements incompatibles ([changements incompatibles](/changelog/breaking-changes/)).
- **MINOR** — nouvelles fonctionnalités rétrocompatibles.
- **PATCH** — corrections rétrocompatibles.
:::

## Version actuelle — `3.0.0`

Première version publiée en release ; version applicative (`APP_VERSION`).

## En cours (`Unreleased`)

Aucun changement en attente.

## `3.0.0`

### Changements incompatibles

- **PostgreSQL 18** : nouveau volume `database_data_pg18`, migration manuelle (voir [Migration vers PostgreSQL 18](/deployment/postgresql-18-upgrade/)) ; `POSTGRES_VERSION` supprimée.
- **`app:seed`** : options `--admin-email` / `--admin-password` supprimées (utiliser `--admin` et `SEED_ADMIN_PASSWORD`).
- Service **`backup`** derrière le profil Compose `backup`.
- **Hub Mercure 1.0** : bloc `issuer`, `match=` à la place de `topic=`.

### Ajouté

- Documentation développeur FR/EN, site de documentation dans `synapse-docs`, Quick Start, diagrammes Mermaid.
- Outillage qualité (PHPStan, php-cs-fixer, Rector), audit hebdomadaire des dépendances, Dependabot sur `develop`.
- Simulateur d'autorisations RBAC, favicon adaptatif.

### Modifié

- **PostgreSQL 18**, **Symfony 8.1**, **PHP 8.5.11** minimum, images conteneur épinglées, choices.js 11.
- Refonte de plusieurs pages de l'interface et seed sans données personnelles.

### Sécurité

- Avis symfony/yaml CVE-2026-109413 et symfony/http-foundation CVE-2026-108082 corrigés ; 48 autres avis corrigés par la mise à jour des dépendances.

## `2.0.4`

Version interne, jamais publiée en release : son contenu est inclus dans `3.0.0`.

### Ajouté

- Simulateur d'autorisations **« what can this user do »** (RBAC).
- Documentation technique développeur bilingue.
- Favicon adaptatif (`prefers-color-scheme`).

### Modifié

- Page Accès redessinée ; KPI des centres basé sur le **taux d'inclusion moyen**.

### Corrigé

- KPI des centres sur toute la largeur ; bouton « Réinitialiser » masqué sans filtre.

---

> 📋 L'historique complet et détaillé est maintenu dans [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md). Pour les
> ruptures de compatibilité, voir [Changements incompatibles](/changelog/breaking-changes/).
