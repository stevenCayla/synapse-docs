---
title: "Versions & processus de release"
description: "Comment les versions de Synapse Medical sont numérotées, taguées et publiées via GitHub Releases."
sidebar:
  label: "Versions"
  order: 2
---

> 🌐 Version française · [English version](/en/changelog/releases/)

Chaque version publiée est matérialisée par un **tag Git `vX.Y.Z`** et une
**[GitHub Release](https://github.com/stevenCayla/SYNAPSE-MEDICAL/releases)** associée.

## Numérotation (SemVer)

`MAJOR.MINOR.PATCH` — voir [Semantic Versioning](https://semver.org/lang/fr/).

| Incrément | Quand | Exemple |
|-----------|-------|---------|
| **MAJOR** | Changement incompatible | `3.0.0` → `4.0.0` |
| **MINOR** | Fonctionnalité rétrocompatible | `3.0.0` → `3.1.0` |
| **PATCH** | Correction rétrocompatible | `3.0.0` → `3.0.1` |

La version est celle du dernier tag git `vX.Y.Z` : l'image la reçoit au build dans la variable d'environnement
`APP_VERSION` (`vX.Y.Z` sur un tag, `vX.Y.Z-N-gsha` entre deux tags, `dev` en développement), sans fichier à modifier.

## Processus de publication

1. Regrouper les changements de `[Unreleased]` dans le [`CHANGELOG.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CHANGELOG.md) sous un numéro de
   version daté.
2. Taguer : `git tag -a v2.1.0 -m "Release 2.1.0"` puis `git push --tags`.
3. Créer la **GitHub Release** correspondante (notes = section du changelog).
4. Aucune version à modifier dans le dépôt : le tag fait foi. Le sélecteur de version de la documentation
   est **dérivé automatiquement** du dernier tag au build — aucune autre action.

:::tip
Les notes de release reprennent **mot pour mot** la section correspondante du
`CHANGELOG.md`. Une seule source de vérité, deux points de diffusion.
:::

Voir aussi : [Journal des modifications](/changelog/readme/) ·
[Changements incompatibles](/changelog/breaking-changes/) ·
[Process de release (déploiement)](/deployment/release-process/).
