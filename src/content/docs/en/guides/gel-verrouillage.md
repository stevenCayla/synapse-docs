---
title: Freeze and lock
description: Freeze a patient's data, then lock the database for analysis.
time: "5 min"
sheet: true
---

## 1. Freeze

Per form, visit or patient: **Actions** → **Freeze**.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Effect** | — | Data entry is blocked; queries remain possible. Unfreezing requires a reason. |

**What you should see**: an open padlock is displayed on frozen items.

## 2. Check the prerequisites

**Study** → **Close-out** displays the checklist.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Open queries** \* | `0` | All queries must be closed. |
| **SDV** \* | `100% of planned fields` | According to the monitoring strategy. |
| **PI signatures** \* | all patients | Each patient must be signed by their investigator. |

## 3. Lock the database

Dual signature: Data Manager, then sponsor.

**What you should see**

- The study moves to the "Locked" status; no further changes are possible.
- A timestamped snapshot is created for exports.

:::note[Exceptional unlock]
Possible by an administrator with a reason and dual signature; tracked in the audit trail.
:::
