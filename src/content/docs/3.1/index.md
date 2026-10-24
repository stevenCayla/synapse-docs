---
title: Synapse Medical - Docs
description: Plateforme de gestion d'études cliniques et de recueil de données
  électroniques (eCRF). Architecture, développement, sécurité et exploitation.
sidebar:
  label: Accueil
  order: 0
slug: "3.1"
---

> 🌐 Version française · [English version](en/)

Plateforme de gestion d'études cliniques et de recueil de données électroniques (eCRF).
Stack : **Symfony 8 · PHP 8.5 · FrankenPHP · PostgreSQL 18 · Mercure · AssetMapper/Stimulus**.

<div class="sl-flex" style="gap:1.25rem;flex-wrap:wrap;margin:1rem 0;font-weight:600;">
  <a href="https://github.com/stevenCayla/SYNAPSE-MEDICAL" class="sl-flex" style="gap:.4em;align-items:center;">🐙 Voir le code sur GitHub</a>
  <a href="https://discord.com/channels/1521440528388984934/1521440528829382718" class="sl-flex" style="gap:.4em;align-items:center;">💬 Rejoindre le Discord</a>
  <a href="/3.1/contribute/" class="sl-flex" style="gap:.4em;align-items:center;">🤝 Contribuer</a>
</div>

:::tip[Nouveau sur le projet ?]
Commence par le **[Quick Start — lancer Synapse Medical en 5 minutes](/3.1/getting-started/)**.
:::

## 🛠️ Développement

| Document | Contenu |
|----------|---------|
| [Guide de démarrage](/3.1/backend/getting-started/) | Installer, lancer et contribuer en local |
| [Structure du code backend](/3.1/backend/symfony-structure/) | Organisation `src/`, couches, conventions |
| [Service d'import de données](/3.1/backend/import/) | Lecture, mapping, conversion, validation, reprise |
| [Modèle de données](/3.1/database/data-model/) | Entités, relations, conventions transverses |
| [Commandes console](/3.1/commands/readme/) | Référence des commandes `app:*` |
| [Documentation API](/3.1/api/readme/) | Endpoints, Swagger, conventions OpenAPI |
| [Convention CSS](/3.1/code-convention/css-convention/) | BEM + CSS Nesting |

## 🏗️ Architecture

| Document | Contenu |
|----------|---------|
| [Vue d'ensemble](/3.1/architecture/overview/) | Architecture technique globale |
| [Décisions d'architecture (ADR)](/3.1/en/architecture/adr/readme/) | Journal des choix structurants *(EN)* |
| Architecture, sécurité & TMA | Document de référence complet |

## 🔒 Sécurité & conformité

| Document | Contenu |
|----------|---------|
| [Bonnes pratiques de sécurité](/3.1/security/best-practices/) 📌 | Règles de codage sécurisé non négociables |
| [Permissions](/3.1/security/permissions/) | Modèle d'autorisation |
| [Sécurité — vue d'ensemble](/3.1/en/security/readme/) | Mécanismes de sécurité *(EN)* |
| [Conformité & audits](/audit/checklist/) · [RGPD](/3.1/rgpd/registre-traitements/) | HDS / CNIL / ANSSI / 21 CFR Part 11 |
| [Checklist QA sécurité](/3.1/qa/security-checklist/) | Contrôles de revue |

## 🚀 Exploitation

| Document | Contenu |
|----------|---------|
| [Déploiement en production](/3.1/deployment/production/) | Guide d'entrée production |
| [Debian + Apache + Docker](/3.1/deployment/debian-apache-docker/) | Configuration hôte complète |
| [Sauvegardes](/3.1/deployment/backup/) · [Process de release](/3.1/deployment/release-process/) | MCO |

## 🤝 Contribution & communauté

| Ressource | Détail |
|-----------|--------|
| [Contribuer](/3.1/contribute/) 📌 | Workflow Git, conventions, mise en place |
| [🐙 GitHub](https://github.com/stevenCayla/SYNAPSE-MEDICAL) | Code source |
| [💬 Discord](https://discord.com/channels/1521440528388984934/1521440528829382718) | Discussion et entraide |

## 📣 Présentation

* Présentation client

***

:::note[Documentation bilingue]
La documentation est organisée en deux locales : **`fr/`** (langue par défaut) et
**`en/`**. Les pages absentes dans une langue sont servies dans l'autre via le
*fallback* Starlight. Voir aussi la [documentation anglaise](en/).
:::
