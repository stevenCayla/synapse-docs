---
title: Compliance FAQ
description: The questions asked by sponsors, DPOs and auditors, with the
  supporting evidence documents.
slug: en/3.2/resources/compliance-faq
---

The questions asked by sponsors, DPOs and auditors, with the supporting evidence documents.

## 21 CFR Part 11 and electronic signatures

<details>
  <summary>Are electronic signatures compliant with 21 CFR Part 11?</summary>

  Each signature requires re-authentication, records the selected meaning, the signer's name and the timestamp, and remains inseparably linked to the signed record.
</details>

<details>
  <summary>Can the audit trail be modified or disabled?</summary>

  No. It is append-only, timestamped in UTC, and keeps the old value, the new value, the user and the reason. No role, including administrator, can modify it.
</details>

<details>
  <summary>How is access controlled?</summary>

  Mandatory two-factor authentication, roles per study and per site, session expiry after inactivity and periodic review of rights.

  Evidence: [Permissions model](/en/3.2/security/permissions/)
</details>

## Hosting and security

<details>
  <summary>Where is the data hosted?</summary>

  In France, with an HDS-certified host. Identifying data is encrypted at rest.

  Evidence: [Backup policy](/en/3.2/deployment/backup/)
</details>

<details>
  <summary>How are backups tested?</summary>

  Restores are tested periodically in accordance with the backup policy (HDS v1.1 §8.4, ISO 27001 A.12.3).

  Evidence: [Backup policy](/en/3.2/deployment/backup/)
</details>

## GDPR and patient data

<details>
  <summary>What is the legal basis for retaining identifying data?</summary>

  It depends on the study framework: in France, a category 1 or 2 RIPH with filed consent. Synapse only offers "Keep" at import if the regulatory basis allows it.

  Evidence: [Record of processing activities](/en/3.2/rgpd/registre-traitements/)
</details>

<details>
  <summary>How are a patient's rights (access, objection) exercised?</summary>

  The data manager can export or remove a patient's data; the operation is traced and requires a reason.
</details>

## System validation

<details>
  <summary>Is Synapse validated (CSV / GAMP 5)?</summary>

  Each release follows a risk-based acceptance testing strategy, with test books linked to requirements and a signed test report.
</details>

<details>
  <summary>How do we run acceptance testing on Synapse ourselves?</summary>

  Use the acceptance test kit: test file, test books and issue report template.

  [Open the acceptance test kit](/en/3.2/recette/kit/)
</details>
