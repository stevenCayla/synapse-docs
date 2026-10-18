---
title: Synapse Medical - Docs
description: Clinical study management and electronic data capture (eCRF) platform. Architecture, development, security and operations.
sidebar:
  label: Home
  order: 0
---

> 🌐 English version · [Version française](../)

Clinical study management and electronic data capture (eCRF) platform.
Stack: **Symfony 8 · PHP 8.5 · FrankenPHP · PostgreSQL 18 · Mercure · AssetMapper/Stimulus**.

:::tip[New to the project?]
Start with the **[Quick Start — run Synapse Medical in 5 minutes](/en/getting-started/)**.
:::

## Development

| Document | Content |
|----------|---------|
| [Getting started](/en/backend/getting-started/) | Install, run and contribute locally |
| [Backend code structure](/en/backend/symfony-structure/) | `src/` layout, layers, conventions |
| [Data import service](/en/backend/import/) | Reading, mapping, conversion, validation, resume |
| [Data model](/en/database/data-model/) | Entities, relationships, cross-cutting conventions |
| [Console commands](/commands/readme/) | `app:*` command reference *(FR)* |
| [API documentation](/api/readme/) | Endpoints, Swagger, OpenAPI conventions *(FR)* |
| [CSS convention](/en/code-convention/css-convention/) | BEM + CSS Nesting |

## Architecture

| Document | Content |
|----------|---------|
| [Overview](/en/architecture/overview/) | Global technical architecture |
| [Architecture decisions (ADR)](/en/architecture/adr/readme/) | Log of structural decisions |

## Security & compliance

| Document | Content |
|----------|---------|
| [Security overview](/en/security/readme/) | Security mechanisms |
| [Settings](/en/security/settings/) · [Permissions](/security/permissions/) | Configuration & authorization model |

## Operations

| Document | Content |
|----------|---------|
| [Production deployment](/en/deployment/production/) | Production entry-point guide |
| Makefile · Xdebug · Options | Tooling |
| Troubleshooting · TLS · Extra services | Support & configuration |

---

:::note[Bilingual documentation]
Documentation is organized into two locales: **`fr/`** (default language) and
**`en/`**. Pages missing in one language fall back to the other (Starlight
fallback). Many operational and compliance documents are authored in French —
see the [French documentation](../).
:::
