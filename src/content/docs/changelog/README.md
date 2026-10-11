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

## Version actuelle — `2.0.4`

Version applicative de référence (`APP_VERSION`).

## En cours (`Unreleased`)

### Ajouté

- Guide de démarrage rapide (**Quick Start**) bilingue.
- Diagrammes **Mermaid** (architecture, modèle de données, workflow eCRF).
- Pages **Contribuer** et **Bonnes pratiques de sécurité**, `CONTRIBUTING.md`.
- **Sélecteur de version** et page Changelog sur le site de doc.
- Liens **GitHub** / **Discord** et footer communautaire.

### Modifié

- Refonte des références **Commandes** et **API** (style doc Astro).

## `2.0.4`

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
