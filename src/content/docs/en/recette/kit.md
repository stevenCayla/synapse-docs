---
title: Acceptance test kit
description: The test file, known issues and issue report template, shared by all acceptance test books.
---

:::caution[Fictitious data only]
The dev server is not a certified health data host. Never import real patients.
:::

## Test file

Copy the table, paste it into cell A1 in Excel, then color the headers: Synapse creates **one eCRF section per color**. Dates must use the date format.

<div class="kit-wrap"><table class="kit" id="kitTable"><thead><tr><th class="g0">id</th><th class="g0">nom_usuel</th><th class="g0">nom_naissance</th><th class="g0">prenom</th><th class="g0">date_naissance</th><th class="g0">sexe</th><th class="g1">date_diagnostic</th><th class="g1">diagnostic</th><th class="g1">stade_ajcc</th><th class="g1">breslow_mm</th><th class="g2">chirurgie</th><th class="g2">date_chirurgie</th><th class="g2">traitement_adjuvant</th><th class="g3">date_dernieres_nouvelles</th><th class="g3">recidive</th><th class="g3">deces</th><th class="g3">date_deces</th></tr></thead><tbody><tr><td class="g0">REC-001</td><td class="g0">Martin</td><td class="g0">Martin</td><td class="g0">Lucie</td><td class="g0">14/03/1961</td><td class="g0">1</td><td class="g1">02/02/2023</td><td class="g1">2</td><td class="g1">IIA</td><td class="g1">1,8</td><td class="g2">1</td><td class="g2">20/02/2023</td><td class="g2">0</td><td class="g3">15/09/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-002</td><td class="g0">Bernard</td><td class="g0">Petit</td><td class="g0">Claire</td><td class="g0">27/11/1958</td><td class="g0">1</td><td class="g1">15/06/2022</td><td class="g1">1</td><td class="g1">IIIB</td><td class="g1"></td><td class="g2">1</td><td class="g2">30/06/2022</td><td class="g2">1</td><td class="g3">02/10/2026</td><td class="g3">1</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-003</td><td class="g0">Dubois</td><td class="g0">Dubois</td><td class="g0">Marc</td><td class="g0">05/07/1949</td><td class="g0">0</td><td class="g1">21/01/2021</td><td class="g1">2</td><td class="g1">IV</td><td class="g1">4,2</td><td class="g2">0</td><td class="g2"></td><td class="g2">2</td><td class="g3">10/12/2024</td><td class="g3">1</td><td class="g3">1</td><td class="g3">10/12/2024</td></tr><tr><td class="g0">REC-004</td><td class="g0">Moreau</td><td class="g0">Leroy</td><td class="g0">Anne</td><td class="g0">19/09/1972</td><td class="g0">1</td><td class="g1">08/10/2024</td><td class="g1">2</td><td class="g1">IB</td><td class="g1 flag">NE</td><td class="g2">1</td><td class="g2">25/10/2024</td><td class="g2">0</td><td class="g3">01/10/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-005</td><td class="g0">Laurent</td><td class="g0">Laurent</td><td class="g0">Paul</td><td class="g0">30/01/1966</td><td class="g0">0</td><td class="g1">13/04/2023</td><td class="g1">1</td><td class="g1">IIB</td><td class="g1"></td><td class="g2">1</td><td class="g2">28/04/2023</td><td class="g2">1</td><td class="g3">22/08/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr><td class="g0">REC-006</td><td class="g0">Simon</td><td class="g0">Simon</td><td class="g0">Julie</td><td class="g0">08/12/1980</td><td class="g0">1</td><td class="g1">17/05/2025</td><td class="g1">2</td><td class="g1">IA</td><td class="g1">0,6</td><td class="g2">1</td><td class="g2">03/06/2025</td><td class="g2">0</td><td class="g3">12/10/2026</td><td class="g3">0</td><td class="g3">0</td><td class="g3"></td></tr><tr class="empty"><td colspan="17"></td></tr><tr class="legend"><td>Legend</td><td></td><td></td><td></td><td></td><td>0: male 1: female</td><td></td><td>1: carcinoma 2: melanoma</td><td>AJCC 8th ed. stage</td><td>in mm, NE = not evaluable</td><td>0: no 1: yes</td><td></td><td>0: none 1: radiotherapy 2: chemotherapy</td><td></td><td>0: no 1: yes</td><td>0: no 1: yes</td><td></td></tr></tbody></table></div>
<div class="kit-act"><button type="button" class="kit-btn" id="kitCopy">Copy for Excel</button><span id="kitMsg" class="kit-msg" role="status"></span><span class="kit-key"><i class="g1"></i>Diagnosis<i class="g2"></i>Treatment<i class="g3"></i>Follow-up</span></div>

### What the file tests

- **4 identifying columns** recognized by their name, hidden in previews.
- **The blank row then the legend**: ignored as patients; `0: no 1: yes` becomes the options of the lists.
- **`NE` in `breslow_mm`** (REC-004): a non-numeric value that the Checks step must flag.
- **Empty cells**: no value created, no error.
- **Days above 12** (14/03, 27/11): check the detection of the DD/MM/YYYY format.

## Known issues

Tracked in the "Study wizard — UX polish" milestone. No need to report them again.

| Where | What you will see | Tracking |
|----|--------------------|-------|
| Everywhere | Completeness only updates on "Continue". | `#184` |
| Resuming a draft | Steps that were never opened are ticked in green. | `#185` |
| Regulatory framework | The category is only known after the countries are chosen. | `#187` |
| Design | Phase required even for a device; randomization visible for a single arm. | `#188` |
| Sites | "Σ site targets" in orange with no site. | `#189` |
| Schedule | A visit without a form blocks progress; adding a visit during data entry clears it. | `#179` |
| Import | Raw labels, "Group N" sections, "out of range" limits flagged wrongly. | `#193` `#178` `#198` |
| Session | Possible expiry after 15 min without activity outside the window. | `#181` |

## Reporting an issue

For each defect, send this information with a screenshot:

```text
Test book and step: (e.g. REC-01 · step 6 Sites)
Page address: https://dev-app.synapse-medical.fr/…
What I did: (values entered)
What I expected:
What happened: (exact message, screenshot)
Browser and time:
```
