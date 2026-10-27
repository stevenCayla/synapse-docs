---
title: Import data
description: Bring in an Excel or CSV file, with column mapping, checks, then signed confirmation.
time: "12 min"
introduced: "3.2.0"
sheet: true
---

The Import step is **optional**: you can also import later from **Patients › Import**. It runs in four stages.

:::note[Prepare the file]
One row per patient, the header in row 1, dates formatted as dates. Color the headers: Synapse creates **one eCRF section per color**. A legend row such as `0: no 1: yes` becomes the options of the lists.
:::

## 11.1 File

Drop the file by drag and drop, then check how it was read.

| Field | Example | What it is for |
|-------|---------|----------------|
| **SHA-256 fingerprint** | displayed | Proves later which file was imported. |
| **Sheet, header row** | default | Change only if the workbook has several sheets or a title above the header. |
| **Date format** | `Automatic` | For dates entered as text: DD/MM/YYYY or MM/DD/YYYY. |
| **Identifying data** \* | `Do not import` | **Do not import** (recommended), **Pseudonymize**, or **Keep** encrypted, only if the regulatory database allows it. |

## 11.2 Columns

Map each column to a study field, or create the missing fields.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Patient identifier** \* | `id → Patient identifier` | Mapped automatically when the name is recognized. |
| **Identifying columns** | — | No eCRF field: they follow the policy chosen at the File step. |
| **Define as fields** | `New form…` | Creates a form and its fields: label, type, unit and section for each column. |

:::tip[Readable labels]
Labels reuse the raw column name. Rename them here ("Date of diagnosis") or later in the designer.
:::

## 11.3 Checks

The values in the file are checked against the fields: blocking errors and warnings.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Correct** | — | Replaces a value; the original value stays in the audit trail. |
| **Accept and create a query** | — | Keeps the value and opens a question to the site, created when the import is applied. |
| **Exclude rows** | — | Removes the affected patients from the import. |

## 11.4 Confirmation and signature

Review the summary, then sign the import.

| Field | Example | What it is for |
|-------|---------|----------------|
| **Certification** \* | check | You attest that the data and the mapping are correct. |
| **Meaning** \* | `Conformity with source documents` | The legal meaning of the signature, recorded with it (21 CFR Part 11). |
| **Password** \* | your password | Re-authentication required for any electronic signature. |

:::note[When is the data applied?]
The signed import session is saved now; patients are created when the study is launched.
:::
