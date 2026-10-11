---
title: Synapse Medical - Docs
description: Plateforme de gestion d'études cliniques et de recueil de données électroniques (eCRF). Architecture, développement, sécurité et exploitation.
sidebar:
  label: Accueil
  order: 0
---

> 🌐 Version française · [English version](en/)

Plateforme de gestion d'études cliniques et de recueil de données électroniques (eCRF).
Stack : **Symfony 8 · PHP 8.5 · FrankenPHP · PostgreSQL 16 · Mercure · AssetMapper/Stimulus**.

<div class="sl-flex" style="gap:1.25rem;flex-wrap:wrap;margin:1rem 0;font-weight:600;">
  <a href="#" class="sl-flex" style="gap:.4em;align-items:center;">🐙 Voir le code sur GitHub</a>
  <a href="https://discord.com/channels/1521440528388984934/1521440528829382718" class="sl-flex" style="gap:.4em;align-items:center;">💬 Rejoindre le Discord</a>
  <a href="/contribute/" class="sl-flex" style="gap:.4em;align-items:center;">🤝 Contribuer</a>
</div>

:::tip[Nouveau sur le projet ?]
Commence par le **[Quick Start — lancer Synapse Medical en 5 minutes](/getting-started/)**.
:::

## 🛠️ Développement

| Document | Contenu |
|----------|---------|
| [Guide de démarrage](/backend/getting-started/) | Installer, lancer et contribuer en local |
| [Structure du code backend](/backend/symfony-structure/) | Organisation `src/`, couches, conventions |
| [Modèle de données](/database/data-model/) | Entités, relations, conventions transverses |
| [Commandes console](/commands/readme/) | Référence des commandes `app:*` |
| [Documentation API](/api/readme/) | Endpoints, Swagger, conventions OpenAPI |
| [Convention CSS](/code-convention/css-convention/) | BEM + CSS Nesting |

## 🏗️ Architecture

| Document | Contenu |
|----------|---------|
| [Vue d'ensemble](/architecture/overview/) | Architecture technique globale |
| [Décisions d'architecture (ADR)](/en/architecture/adr/readme/) | Journal des choix structurants *(EN)* |
| Architecture, sécurité & TMA | Document de référence complet |

## 🔒 Sécurité & conformité

| Document | Contenu |
|----------|---------|
| [Bonnes pratiques de sécurité](/security/best-practices/) 📌 | Règles de codage sécurisé non négociables |
| [Permissions](/security/permissions/) | Modèle d'autorisation |
| [Sécurité — vue d'ensemble](/en/security/readme/) | Mécanismes de sécurité *(EN)* |
| [Conformité & audits](/audit/checklist/) · [RGPD](/rgpd/registre-traitements/) | HDS / CNIL / ANSSI / 21 CFR Part 11 |
| [Checklist QA sécurité](/qa/security-checklist/) | Contrôles de revue |

## 🚀 Exploitation

| Document | Contenu |
|----------|---------|
| [Déploiement en production](/deployment/production/) | Guide d'entrée production |
| [Debian + Apache + Docker](/deployment/debian-apache-docker/) | Configuration hôte complète |
| [Sauvegardes](/deployment/backup/) · [Process de release](/deployment/release-process/) | MCO |

## 🤝 Contribution & communauté

| Ressource | Détail |
|-----------|--------|
| [Contribuer](/contribute/) 📌 | Workflow Git, conventions, mise en place |
| [🐙 GitHub](#) | Code source (lien à venir) |
| [💬 Discord](https://discord.com/channels/1521440528388984934/1521440528829382718) | Discussion et entraide |

## 📣 Présentation

- Présentation client

---

:::note[Documentation bilingue]
La documentation est organisée en deux locales : **`fr/`** (langue par défaut) et
**`en/`**. Les pages absentes dans une langue sont servies dans l'autre via le
*fallback* Starlight. Voir aussi la [documentation anglaise](en/).
:::
