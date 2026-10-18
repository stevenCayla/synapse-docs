---
title: Contribuer
description: "Guide de contribution à Synapse Medical : façons de contribuer,
  mise en place de l'environnement, workflow Git, conventions de commit,
  documentation et exigences de sécurité."
sidebar:
  label: Contribuer
  badge:
    text: Nouveau
    variant: tip
slug: 3.0/contribute
---

> 🌐 Version française · [English version](/en/3.0/contribute/)

Merci de votre intérêt pour **Synapse Medical** ! Les contributions de **toute taille et
tout niveau** sont les bienvenues — du correctif de typo à une nouvelle fonctionnalité.

:::tip[Pour aller vite]
Le fichier [`CONTRIBUTING.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CONTRIBUTING.md) à la racine du dépôt résume tout ce qui suit. Cette page
en est la version enrichie et navigable.
:::

<div class="sl-flex" style="gap:1rem;flex-wrap:wrap;margin:1rem 0;">
  <a href="https://github.com/stevenCayla/SYNAPSE-MEDICAL" class="sl-flex" style="gap:.4em;align-items:center;">🐙 Voir le code sur GitHub</a>
  <a href="https://discord.com/channels/1521440528388984934/1521440528829382718" class="sl-flex" style="gap:.4em;align-items:center;">💬 Rejoindre le Discord</a>
</div>

## 💡 Façons de contribuer

Contribuer ne se limite pas au code :

* 🐛 **Signaler des bugs** et comportements inattendus.
* 💡 **Proposer des fonctionnalités** ou améliorations.
* 📝 **Améliorer la documentation** (typos, clarté, traductions FR ↔ EN).
* 🔍 **Relire des Pull Requests** : un « LGTM », une suggestion ou une remarque sont déjà
  des contributions précieuses.
* 💬 **Aider la communauté** sur le [Discord](https://discord.com/channels/1521440528388984934/1521440528829382718).

## 🛠️ Contribuer au code

### Prérequis

* **Docker** + **Docker Compose v2**
* **Make**
* Un client **Git**

:::note
Aucune installation locale de PHP/Composer : tout passe par le conteneur FrankenPHP.
:::

### Installation

```bash
git clone <url-du-dépôt> synapse-medical
cd synapse-medical
make start
make sf c="app:seed --reset --all-sites"
# → https://localhost
```

Détail : [Guide de démarrage](/3.0/backend/getting-started/).

### Workflow Git

1. Branche depuis `develop` : `git switch -c feature/ma-fonctionnalite`
   (préfixes : `feature/`, `fix/`, `docs/`, `refactor/`, `ci/`, `chore/`).
2. Commits atomiques et descriptifs.
3. Pull Request vers `develop`, CI verte (tests + lint).
4. Revue, puis itérations par nouveaux commits.

:::caution
Ne committez **jamais** de secret, de donnée patient réelle ou de fichier `.env.*.local`.
:::

### Conventions de commit

[Conventional Commits](https://www.conventionalcommits.org/), **en anglais** :

```
feat(ecrf): add conditional field visibility engine
fix(security): enforce workspace check in PatientRepository
docs(commands): restructure console reference
```

Types : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`.

### Tests & qualité

```bash
make test                       # PHPUnit (APP_ENV=test)
make test c="--group e2e"       # filtrer un groupe
```

Toute nouvelle logique métier doit être **couverte par des tests**.

## 📝 Contribuer à la documentation

La documentation vit dans `docs/` (FR à la racine, EN sous `docs/en/`). Le site
(**Astro + Starlight**) est maintenu dans le dépôt séparé `synapse-docs` ; une modification
de `docs/` fusionnée sur `develop` met à jour automatiquement le site de développement
(dev-docs.synapse-medical.fr). Le site de production (docs.synapse-medical.fr) est publié
via une PR de release dans `synapse-docs`, puis déployé à la main.

Prévisualisation locale, depuis un checkout de `synapse-docs` :

```bash
npm install
SYNAPSE_DIR=../chemin/vers/ce-depot npm run dev
```

* Toute page FR ajoutée/modifiée doit l'être **aussi en anglais** (`docs/en/`).
* Conserver les **diacritiques français** (accents).
* Utiliser les callouts (`:::note`, `:::tip`, `:::caution`).

## 🔒 Exigences de sécurité

Synapse Medical traite des **données de santé** (HDS / RGPD / 21 CFR Part 11). Règles non
négociables :

* 🔒 **Isolation par workspace** : jamais de chargement par ID seul ; toujours filtrer par
  `workspace_id`.
* 🔒 **Fichiers** : jamais dans `public/` ; toujours via `SecureFileUploadService`.
* 🔒 **Aucune PII en clair** dans les logs, noms de fichiers ou messages d'erreur.

Détail : [Bonnes pratiques de sécurité](/3.0/security/best-practices/).

:::danger[Vulnérabilité de sécurité]
Ne l'ouvrez **pas** en *issue* publique. Contactez directement les mainteneurs sur le
[Discord](https://discord.com/channels/1521440528388984934/1521440528829382718) (canal
privé) ou par e-mail.
:::
