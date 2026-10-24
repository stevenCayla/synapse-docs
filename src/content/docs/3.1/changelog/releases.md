---
title: Versions & processus de release
description: Comment les versions de Synapse Medical sont numérotées, taguées et
  publiées via GitHub Releases.
sidebar:
  label: Versions
  order: 2
slug: 3.1/changelog/releases
---

> 🌐 Version française · [English version](/en/3.1/changelog/releases/)

Chaque version publiée est matérialisée par un **tag Git `vX.Y.Z`** et une
**[GitHub Release](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases)** associée.

## Numérotation (SemVer)

`MAJOR.MINOR.PATCH` — voir [Semantic Versioning](https://semver.org/lang/fr/).

| Incrément | Quand | Exemple |
|-----------|-------|---------|
| **MAJOR** | Changement incompatible | `3.0.0` → `4.0.0` |
| **MINOR** | Fonctionnalité rétrocompatible | `3.0.0` → `3.1.0` |
| **PATCH** | Correction rétrocompatible | `3.0.0` → `3.0.1` |

La version courante est exposée par la variable d'environnement `APP_VERSION`
(**`3.1.0`** actuellement).

## Processus de publication

1. Regrouper les changements de `[Unreleased]` dans le [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) sous un numéro de
   version daté.
2. Taguer : `git tag -a v2.1.0 -m "Release 2.1.0"` puis `git push --tags`.
3. Créer la **GitHub Release** correspondante (notes = section du changelog).
4. Mettre à jour `APP_VERSION` (`.env`). Le sélecteur de version de la documentation est
   **dérivé automatiquement** de cette variable au build — aucune autre action.

:::tip
Les notes de release reprennent **mot pour mot** la section correspondante du
`CHANGELOG.md`. Une seule source de vérité, deux points de diffusion.
:::

Voir aussi : [Journal des modifications](/3.1/changelog/readme/) ·
[Changements incompatibles](/3.1/changelog/breaking-changes/) ·
[Process de release (déploiement)](/3.1/deployment/release-process/).
