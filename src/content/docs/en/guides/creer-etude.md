---
title: Create a study
description: Type, information and regulatory framework, the first three steps of the wizard.
time: "8 min"
introduced: "3.2.0"
sheet: true
---

Open **Studies** → **New study**. This guide follows the **Advanced** mode; in Essential mode, the same fields are grouped into fewer steps.

## 1. Study type

Choose the pathway. This choice determines what follows and **cannot be changed** once validated.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Type** \* | `Prospective study` | Patients are enrolled as they come and data is entered visit by visit. "Retrospective" creates an analysis dataset from a closed prospective study. |
| **Unfinished draft** | — | If an earlier draft is listed, click its name to resume it; the cross deletes it. |

![The type selection, with an unfinished draft listed at the top.](../../../../assets/guides/01-type.webp)

**What you should see**: after "Continue", step 1 is ticked in green.

## 2. Information

The study identification, reused in reports and exports.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Sponsor** \* | `Bordeaux University Hospital` | The sponsor: the organisation responsible for the study. |
| **Study ID** \* | `MELA-2026` | Short, unique code: letters, digits, hyphens. Converted to uppercase; it prefixes identifiers. |
| **Short title** \* | `Follow-up of resected melanoma` | The readable name of the study in lists. |
| **Therapeutic area** | `Oncology` | Used to classify studies. |
| **Indication** | `Melanoma` | The disease under study. |
| **Protocol number** | `BDX-2026-014` | The sponsor's internal protocol reference, distinct from the Study ID. |

:::note[Greyed-out text]
The greyed-out values in empty fields are examples: they disappear as soon as you type.
:::

## 3. Regulatory framework

Four questions are enough: Synapse derives the regulatory category by country and the requirements that apply.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Health product studied** \* | `Medical device` | Medicinal product, device, in vitro diagnostic or no product. Each falls under a different regulation (CTR, MDR, IVDR). |
| **Intervention added to care** \* | `Minimal` | "Not minimal" → RIPH 1; "Minimal" → RIPH 2; "None" → RIPH 3. |
| **New data?** \* | `New data` | "Existing data" leads to a research on data (outside the Jardé law). |
| **Sponsor established in the EU?** \* | `Yes` | A non-EU sponsor must appoint a legal representative in the EU. |

![The four answers; the category is displayed after "Continue".](../../../../assets/guides/03-cadre.webp)

:::caution[The category depends on the countries]
Countries are chosen in the Sites step. As long as no country is selected, the category shows "Not applicable".
:::
