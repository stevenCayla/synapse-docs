---
title: Synapse Medical - Docs
description: Plateforme de gestion d'études cliniques et de recueil de données
  électroniques (eCRF). Architecture, développement, sécurité et exploitation.
sidebar:
  label: Accueil
  order: 0
slug: "3.0"
---

> 🌐 Version française · [English version](/en/3.0/)

Plateforme de gestion d'études cliniques et de recueil de données électroniques (eCRF).
Stack : **Symfony 8 · PHP 8.5 · FrankenPHP · PostgreSQL 18 · Mercure · AssetMapper/Stimulus**.

<div class="sl-flex" style="gap:1.25rem;flex-wrap:wrap;margin:1rem 0;font-weight:600;">
  <a href="https://github.com/stevenCayla/SYNAPSE-MEDICAL" class="sl-flex" style="gap:.4em;align-items:center;">🐙 Voir le code sur GitHub</a>
  <a href="https://discord.com/channels/1521440528388984934/1521440528829382718" class="sl-flex" style="gap:.4em;align-items:center;">💬 Rejoindre le Discord</a>
  <a href="/3.0/contribute/" class="sl-flex" style="gap:.4em;align-items:center;">🤝 Contribuer</a>
</div>

:::tip[Nouveau sur le projet ?]
Commence par le **[Quick Start — lancer Synapse Medical en 5 minutes](/3.0/getting-started/)**.
:::

## 🛠️ Développement

| Document | Contenu |
|----------|---------|
| [Guide de démarrage](/3.0/backend/getting-started/) | Installer, lancer et contribuer en local |
| [Structure du code backend](/3.0/backend/symfony-structure/) | Organisation `src/`, couches, conventions |
| [Modèle de données](/3.0/database/data-model/) | Entités, relations, conventions transverses |
| [Commandes console](/3.0/commands/readme/) | Référence des commandes `app:*` |
| [Documentation API](/3.0/api/readme/) | Endpoints, Swagger, conventions OpenAPI |
| [Convention CSS](/3.0/code-convention/css-convention/) | BEM + CSS Nesting |

## 🏗️ Architecture

| Document | Contenu |
|----------|---------|
| [Vue d'ensemble](/3.0/architecture/overview/) | Architecture technique globale |
| [Décisions d'architecture (ADR)](/en/3.0/architecture/adr/readme/) | Journal des choix structurants *(EN)* |
| Architecture, sécurité & TMA | Document de référence complet |

## 🔒 Sécurité & conformité

| Document | Contenu |
|----------|---------|
| [Bonnes pratiques de sécurité](/3.0/security/best-practices/) 📌 | Règles de codage sécurisé non négociables |
| [Permissions](/3.0/security/permissions/) | Modèle d'autorisation |
| [Sécurité — vue d'ensemble](/en/3.0/security/readme/) | Mécanismes de sécurité *(EN)* |
| [Conformité & audits](/audit/checklist/) · [RGPD](/3.0/rgpd/registre-traitements/) | HDS / CNIL / ANSSI / 21 CFR Part 11 |
| [Checklist QA sécurité](/3.0/qa/security-checklist/) | Contrôles de revue |

## 🚀 Exploitation

| Document | Contenu |
|----------|---------|
| [Déploiement en production](/3.0/deployment/production/) | Guide d'entrée production |
| [Debian + Apache + Docker](/3.0/deployment/debian-apache-docker/) | Configuration hôte complète |
| [Sauvegardes](/3.0/deployment/backup/) · [Process de release](/3.0/deployment/release-process/) | MCO |

## 🤝 Contribution & communauté

| Ressource | Détail |
|-----------|--------|
| [Contribuer](/3.0/contribute/) 📌 | Workflow Git, conventions, mise en place |
| [🐙 GitHub](https://github.com/stevenCayla/SYNAPSE-MEDICAL) | Code source |
| [💬 Discord](https://discord.com/channels/1521440528388984934/1521440528829382718) | Discussion et entraide |

## 📣 Présentation

* Présentation client

***

:::note[Documentation bilingue]
La documentation est organisée en deux locales : **`fr/`** (langue par défaut) et
**`en/`**. Les pages absentes dans une langue sont servies dans l'autre via le
*fallback* Starlight. Voir aussi la [documentation anglaise](/en/3.0/).
:::
