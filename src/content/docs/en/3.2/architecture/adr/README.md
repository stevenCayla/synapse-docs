---
title: Architecture Decision Records (ADR)
description: Index of the project's Architecture Decision Records (Nygard
  format) and how to add a new ADR.
slug: en/3.2/architecture/adr/readme
---

This directory records the **structural decisions** taken on the project, using
the lightweight [Michael Nygard ADR format](https://github.com/joelparkerhenderson/architecture-decision-record)
(Status / Context / Decision / Consequences).

> An ADR is immutable once **Accepted**. To change a past decision, add a new ADR
> that supersedes it (reference it in the new ADR's *Status*) rather than editing
> the old one.

## Index

| # | Title | Status |
|---|-------|--------|
| [0001](/en/3.2/architecture/adr/0001-use-symfony-security/) | Use the Symfony Security component | Accepted |
| [0002](/en/3.2/architecture/adr/0002-session-timeout-server-side/) | Session timeout enforced server-side | Accepted |
| [0003](/en/3.2/architecture/adr/0003-security-foundations/) | Layered security foundations (defense in depth) | Accepted |

## Adding an ADR

1. Copy the structure of an existing ADR.
2. Use the next free sequential number (`000N-short-kebab-title.md`).
3. Fill **Status** (`Proposed` → `Accepted` / `Rejected` / `Superseded by 000X`),
   **Context**, **Decision**, **Consequences**.
4. Add a row to the index above and link it from the relevant docs (e.g.
   [architecture overview](/en/3.2/architecture/overview/#9-architecture-decisions-adr)).
