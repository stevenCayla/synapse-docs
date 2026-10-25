---
title: Export data
description: Extract the data for statistical analysis or regulatory submission.
time: "4 min"
sheet: true
---

## 1. Choose the format

**Study** → **Exports** → **New export**.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Format** \* | `CDISC ODM` | **Excel / CSV** for analysis, **CDISC ODM** for exchange and archiving, with the SDTM mapping defined in the designer. |
| **Scope** | `All sites` | Sites, forms, period. |
| **Identifying data** \* | `Excluded` | Excluded by default; pseudonymized on request. |
| **Audit trail** | include | Attaches the full history of changes. |

## 2. Download

The export is prepared in the background; a notification signals that it is ready.

**What you should see**: each export has a SHA-256 fingerprint and appears in the activity log.

:::tip[Locked database exports]
After lock, exports are based on the frozen snapshot: two successive exports are identical.
:::
