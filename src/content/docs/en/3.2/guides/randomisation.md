---
title: Randomize a patient
description: Assign a treatment arm, manage blinding and emergency unblinding.
time: 5 min
sheet: true
slug: en/3.2/guides/randomisation
---

:::caution[Studies concerned]
Randomized-design studies only. Randomization is not available for a RIPH 3.
:::

## 1. Settings (Data Manager)

Configured when the study is created, then locked in production.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Ratio** \* | `1:1` | The allocation between arms. |
| **Block size** \* | `4` | Must be a multiple of the sum of the ratio. |
| **Stratification factors** | `Site, stage` | Balance the arms within each stratum. |

## 2. Randomize

Patient record → **Randomize**. The button only appears once eligibility is confirmed.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Strata** \* | `Stage III` | Pre-filled from the eCRF when possible. |
| **Signature** \* | your password | Randomization is final and signed. |

**What you should see**: when blinded, only the treatment number is displayed, never the arm.

## 3. Emergency unblinding

Patient record → **Unblind**. Restricted to the principal investigator.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Reason** \* | `Serious adverse event` | Required, kept in the audit trail. |
| **Confirmation** \* | password | A notification is sent to the sponsor and the Data Manager. |

:::caution[Irreversible action]
The arm is revealed only to the user who unblinds, for that patient.
:::
