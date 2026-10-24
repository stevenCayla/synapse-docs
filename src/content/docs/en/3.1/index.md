---
title: Synapse Medical - Docs
description: Clinical study management and electronic data capture (eCRF)
  platform. Architecture, development, security and operations.
sidebar:
  label: Home
  order: 0
slug: en/3.1
---

> 🌐 English version · [Version française](/3.1/)

Clinical study management and electronic data capture (eCRF) platform.
Stack: **Symfony 8 · PHP 8.5 · FrankenPHP · PostgreSQL 18 · Mercure · AssetMapper/Stimulus**.

:::tip[New to the project?]
Start with the **[Quick Start — run Synapse Medical in 5 minutes](/en/3.1/getting-started/)**.
:::

## Development

| Document | Content |
|----------|---------|
| [Getting started](/en/3.1/backend/getting-started/) | Install, run and contribute locally |
| [Backend code structure](/en/3.1/backend/symfony-structure/) | `src/` layout, layers, conventions |
| [Data import service](/en/3.1/backend/import/) | Reading, mapping, conversion, validation, resume |
| [Data model](/en/3.1/database/data-model/) | Entities, relationships, cross-cutting conventions |
| [Console commands](/3.1/commands/readme/) | `app:*` command reference *(FR)* |
| [API documentation](/3.1/api/readme/) | Endpoints, Swagger, OpenAPI conventions *(FR)* |
| [CSS convention](/en/3.1/code-convention/css-convention/) | BEM + CSS Nesting |

## Architecture

| Document | Content |
|----------|---------|
| [Overview](/en/3.1/architecture/overview/) | Global technical architecture |
| [Architecture decisions (ADR)](/en/3.1/architecture/adr/readme/) | Log of structural decisions |

## Security & compliance

| Document | Content |
|----------|---------|
| [Security overview](/en/3.1/security/readme/) | Security mechanisms |
| [Settings](/en/3.1/security/settings/) · [Permissions](/3.1/security/permissions/) | Configuration & authorization model |

## Operations

| Document | Content |
|----------|---------|
| [Production deployment](/en/3.1/deployment/production/) | Production entry-point guide |
| Makefile · Xdebug · Options | Tooling |
| Troubleshooting · TLS · Extra services | Support & configuration |

***

:::note[Bilingual documentation]
Documentation is organized into two locales: **`fr/`** (default language) and
**`en/`**. Pages missing in one language fall back to the other (Starlight
fallback). Many operational and compliance documents are authored in French —
see the [French documentation](/3.1/).
:::
