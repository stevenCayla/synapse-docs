---
title: Contribute
description: "Contribution guide for Synapse Medical: ways to contribute,
  environment setup, Git workflow, commit conventions, documentation and
  security requirements."
sidebar:
  label: Contribute
  badge:
    text: New
    variant: tip
slug: en/3.1/contribute
---

> 🌐 [Version française](/3.1/contribute/) · English version

Thank you for your interest in **Synapse Medical**! Contributions of **any size and skill
level** are welcome — from a typo fix to a major new feature.

:::tip[Quick start]
The [`CONTRIBUTING.md`](https://github.com/stevenCayla/SYNAPSE-MEDICAL/blob/main/CONTRIBUTING.md) file at the repository root summarizes everything below. This
page is its enriched, navigable version.
:::

<div class="sl-flex" style="gap:1rem;flex-wrap:wrap;margin:1rem 0;">
  <a href="https://github.com/stevenCayla/SYNAPSE-MEDICAL" class="sl-flex" style="gap:.4em;align-items:center;">🐙 View the code on GitHub</a>
  <a href="https://discord.com/channels/1521440528388984934/1521440528829382718" class="sl-flex" style="gap:.4em;align-items:center;">💬 Join the Discord</a>
</div>

## 💡 Ways to contribute

Contributing is not only about code:

* 🐛 **Report bugs** and unexpected behavior.
* 💡 **Propose features** or improvements.
* 📝 **Improve the documentation** (typos, clarity, FR ↔ EN translations).
* 🔍 **Review Pull Requests**: an "LGTM", a suggestion or a remark is already a valuable
  contribution.
* 💬 **Help the community** on [Discord](https://discord.com/channels/1521440528388984934/1521440528829382718).

## 🛠️ Contributing code

### Prerequisites

* **Docker** + **Docker Compose v2**
* **Make**
* A **Git** client

:::note
No local PHP/Composer install: everything runs through the FrankenPHP container.
:::

### Setup

```bash
git clone <repository-url> synapse-medical
cd synapse-medical
make start
make sf c="app:seed --reset --all-sites"
# → https://localhost
```

Details: [Getting started](/en/3.1/backend/getting-started/).

### Git workflow

1. Branch from `develop`: `git switch -c feature/my-feature`
   (prefixes: `feature/`, `fix/`, `docs/`, `refactor/`, `ci/`, `chore/`).
2. Atomic, descriptive commits.
3. Pull Request to `develop`, green CI (tests + lint).
4. Review, then iterate with new commits.

:::caution
**Never** commit a secret, real patient data or a `.env.*.local` file.
:::

### Commit conventions

[Conventional Commits](https://www.conventionalcommits.org/), **in English**:

```
feat(ecrf): add conditional field visibility engine
fix(security): enforce workspace check in PatientRepository
docs(commands): restructure console reference
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`.

### Tests & quality

```bash
make test                       # PHPUnit (APP_ENV=test)
make test c="--group e2e"       # filter a group
```

Any new business logic must be **covered by tests**.

## 📝 Contributing to the docs

The documentation lives in `docs/` (FR at the root, EN under `docs/en/`). The website
(**Astro + Starlight**) is maintained in the separate `synapse-docs` repository; a change
to `docs/` merged into `develop` automatically refreshes the development site
(dev-docs.synapse-medical.fr). The production site (docs.synapse-medical.fr) is published
through a release PR in `synapse-docs`, then deployed by hand.

Local preview, from a `synapse-docs` checkout:

```bash
npm install
SYNAPSE_DIR=../path/to/this-repo npm run dev
```

* Any FR page added/changed must also be done **in English** (`docs/en/`).
* Keep **French diacritics** (accents).
* Use the callouts (`:::note`, `:::tip`, `:::caution`).

## 🔒 Security requirements

Synapse Medical handles **health data** (HDS / GDPR / 21 CFR Part 11). Non-negotiable
rules:

* 🔒 **Workspace isolation**: never load a resource by its ID alone; always filter by
  `workspace_id`.
* 🔒 **Files**: never in `public/`; always via `SecureFileUploadService`.
* 🔒 **No plaintext PII** in logs, file names or error messages.

Details: [Security best practices](/en/3.1/security/best-practices/).

:::danger[Security vulnerability]
Do **not** open it as a public issue. Contact the maintainers directly on
[Discord](https://discord.com/channels/1521440528388984934/1521440528829382718) (private
channel) or by email.
:::
