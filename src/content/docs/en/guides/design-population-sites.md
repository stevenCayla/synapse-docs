---
title: Design, population and sites
description: Describe the trial, who can be enrolled, and at which institutions.
time: "8 min"
introduced: "3.2.0"
sheet: true
---

## 4. Design

The structure of the trial.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Phase** \* | `Phase III` | The development stage. For a device, choose the closest phase. |
| **Trial design** \* | `Single arm` | A single group, with no comparator or randomisation. Randomised designs enable randomisation. |
| **Randomisation** | `1:1` | The allocation ratio between arms. Not applicable to a single-arm trial. |
| **Blinding** \* | `Open` | Who knows the treatment received: single or double blind. |
| **Control type** \* | `None` | Placebo, active comparator, standard of care or none. |
| **Enrolment / Follow-up** | `12 and 12 months` | Duration of recruitment, then of each patient's follow-up. |
| **Total duration** \* | `24 months` | Calculated automatically (enrolment + follow-up), editable. |

<!-- Screenshot to provide: the completed design; the total duration was calculated automatically. -->

## 5. Population

Who can be enrolled, and how many.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Target sample size** \* | `50` | Number of patients to enrol; used as the reference for site targets. |
| **Performance status** | `Any` | Minimum general condition required: ECOG or Karnofsky index. |
| **Minimum / maximum age** | `18 and 99 years` | The maximum age must be greater than the minimum age. |
| **Sex** | `All` | |
| **Inclusion / exclusion criteria** | `Adult patient ↵` | Type a criterion then press Enter: it becomes a tag; the cross removes it. |

<!-- Screenshots to provide: the completed Population step; inconsistent ages (the message appears below the field). -->

## 6. Sites

The study countries, then the participating institutions.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Countries** \* | `France` | Determines the regulatory requirements applied (France, EU…). |
| **Site** | `Lariboisière Hospital` | Chosen from the organisation's directory, or created with "Create a new site". Optional at this stage. |
| **Principal investigator** | `Dr A. Payet` | The physician responsible at this site. They only see the patients of their site. |
| **Target** | `50` | Patients expected at this site. The sum is compared with the target sample size. |
| **Planned activation** | `01/12/2026` | Date the site opens to enrolment. |

<!-- Screenshots to provide: a complete site (the sum of targets equals the target sample size); without a site, the gap to the target is shown in orange, which is not blocking. -->

:::tip[Add sites later]
Sites are optional: you can add them later from the study Configuration page.
:::
