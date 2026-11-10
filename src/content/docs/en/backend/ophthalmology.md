---
title: "Ophthalmology: laterality and measures per eye"
description: "Laterality settings of an ophthalmology study, study eye at inclusion, per-eye eCRF fields, values stored with their eye, eCRF templates, long and wide exports."
---

> 🌐 [Version française](/backend/ophtalmologie/) · English version

Ophthalmologists work eye by eye: a patient may be included for one eye or both, and most measures (visual acuity, intraocular pressure, OCT) are recorded for each eye. Laterality is an explicit attribute of the stored value, not two unrelated fields.

---

## Study settings

Shown on the Design step of the wizard (and on the Study step of the Essential mode) when the therapeutic area is ophthalmology (`Study::usesLaterality()`), stored on the study row (`App\Entity\Embeddable\LateralitySettings`, `laterality_*` columns):

| Setting | Values | Role |
|---------|--------|------|
| `unit` | `patient`, `eye` | Unit of analysis: the patient or the eye |
| `eyes` | `one`, `both`, `either` | One eye (chosen at inclusion), both eyes, or one eye or both |
| `rule` | `worse`, `better`, `investigator` | Rule when both eyes are eligible (single-eye study): worse eye, better eye, investigator's choice |

## Study eye at inclusion

`StudyPatient::$studyEyes` (`App\Enum\Laterality`: `OD` right eye, `OS` left eye, `OU` both, null when not recorded).

The inclusion form and the edit page require it for an ophthalmology study, among the values the settings allow (`App\Laterality\StudyEyePolicy`: one eye gives OD or OS, both eyes give OU, one eye or both give OD, OS or OU). A change is traced in the activity log (`study_eye:OD->OS`).

## Per-eye fields

- `EcrfField::$perEye` / `EcrfTemplateField::$perEye` (the "One value per eye (OD / OS)" switch in the builder field properties). Limited to simple fields (`EcrfFieldType::supportsPerEye()`: text, textarea, number, date, boolean, select, radio, checkbox group) of a top-level section that does not repeat; anywhere else the flag is ignored.
- Data entry shows OD and OS side by side, the study eye is marked. Inputs are named `field_{id}_OD` and `field_{id}_OS`.
- Storage: `EcrfValue::$laterality` (`OD`, `OS`, empty for any other value). The column is not nullable (`''` by default) so that the unique index `UNIQ_ECRF_VALUE (record, field, repeat_index, parent_repeat_index, laterality)` keeps refusing a duplicate. Existing data is unchanged. An eye left empty has no row.
- Only the study eye can be required; the fellow eye stays optional. With no study eye recorded, no eye is required. The range (minimum, maximum) and the rules apply to each eye (`EcrfRuleEngine::validateFields`, messages such as "BCVA (OD)").
- Autosave sends `laterality` (`OD` or `OS`); a per-eye field without eye, or another field with an eye, is refused (422).
- Limit: a visibility condition that cites a per-eye field does not see its value.

## Audit trail, queries, signature

- `EcrfValueAudit::$laterality`; the eye joins the HMAC hash only when there is one (`lat:OD`), so the hashes already written stay valid. The entries of one submission are chained to each other (`EcrfAuditWriter::createChained`). The audit panel of a field and the audit export (`eye` column) show the eye.
- `EcrfQuery::$laterality`: a query on a per-eye field names the eye concerned.
- The signed content of a record (`EcrfSignatureService`) includes the eye (`field:repeat:parent:OD`), without changing content already signed.

## Units and templates

The visual acuity conversion is shown while typing (`App\Laterality\BcvaConversion`, `assets/js/eye-measures.js`): logMAR = (85 - ETDRS letters) / 50, decimal = 10^-logMAR, Snellen 20/x with x = 20 x 10^logMAR. The scale comes from the field unit (`lettres ETDRS`, `logMAR`, `Snellen décimal`).

Three templates (`App\Laterality\OphthalmologyTemplates`, references `ECRF-OPH-001` to `003`). A new workspace receives them at creation (`EcrfTemplateLoader::loadLibrary()`, in the same transaction; a template it deletes does not return). For existing workspaces they are loaded as published templates, in every workspace or in one, by `app:ecrf-templates:seed`
(idempotent, allowed in production, see [Commands](/en/commands/#appecrf-templatesseed) and
[Production deployment](/en/deployment/production/)). `app:create-fake-ecrf-templates` (hence `app:seed`) loads the
same definitions through the same loader (`App\Service\EcrfTemplateLoader`) and does not copy a template the
workspace already holds:

- "Ophtalmologie : visite initiale" (history, lens status, BCVA, IOP and method, refraction, slit lamp, fundus, OCT);
- "Ophtalmologie : visite de suivi" (BCVA, IOP, OCT, adverse events per eye);
- "Ophtalmologie : événements indésirables oculaires" (repeating section with the eye concerned).

Visits proposed by the wizard (column `ecrf_template.visit_plan`, `App\Enum\TemplateVisitPlan`): the initial visit from the first visit up to and including the inclusion visit, so at selection and at inclusion (`first`), the follow-up visit at the visits after inclusion (`after_first`), the adverse events at every visit (no rule). The stored values keep their name.
The inclusion visit is the first visit at day 0 (otherwise the first visit: with no selection visit, the initial form is at inclusion only). With no visit after inclusion, the follow-up form is planned at the last visit. It is a starting point: the matrix stays editable. The migration sets the rule on the templates already loaded (original reference and title); any other template has no rule.

Defaults: BCVA 0 to 100 ETDRS letters (logMAR -0.3 to 3.0), IOP 0 to 80 mmHg (Goldmann, rebound, non-contact), CST in µm, macular volume in mm³, intraretinal and subretinal fluid.

The logMAR of a form that also has the per-eye ETDRS letters is **computed** (`App\Laterality\DerivedLogMar`): read-only on screen, never asked, written with the letters of the same eye (entry, autosave) with its own audit entry (source `computed`, generated reason on a recomputation). A value that is not the conversion of the letters (entered before the rule, imported) is never overwritten.

## Exports

`StudyEcrfExportService` (`GET /studies/{id}/export/ecrf/csv` and `/xlsx`).
The CSV is a **ZIP with one CSV file per form** (`01_<form>.csv`, one header row), the Excel file has one sheet per form; a column empty on every row is left out, dates are ISO (`2026-10-31`), times are in the display zone of the screen (Europe/Paris by default, named in the header `Dernière mise à jour (Europe/Paris)`) and statuses are those of the screen:

- **Wide** (default): one row per record, two columns `<field>_od` and `<field>_os` per per-eye field (technical names, readable by the import).
- **Long** (`?layout=long`): one row per record and eye, with the `eye` column (OD / OS) and `study_eye` (`Y` when the eye is a study eye, `N` otherwise); fields that are not per eye are repeated on each row.
- An ophthalmology study adds `study_eyes` (OD, OS or OU, the study eye of the inclusion).
- **Visits**: one row per patient (per patient and eye in the long layout); the columns of each visit follow one another with the lower-cased visit code as suffix, after the field name and the eye: `bcva_od_v0`, `bcva_os_v0`, `bcva_od_v1`, `BCVA_v1` (a field that is not per eye). No code: the visit
  name, else `v<position>`; characters other than letters and digits become `_`; a suffix already taken gets `_2`, `_3` (visits in schedule order). Columns are ordered by visit position, then field order. A form has columns at a visit when the schedule matrix (`study_visit_form`) plans it there or a
  record exists there (no entered value is lost); a second occurrence of the same visit for a patient adds `_r2`, `_r3`. Records without visit (free eCRF, imports) keep their columns without suffix, first. Repeatable sections: one row per instance, the highest repeat count of the patient (all
  visits) decides; a visit with fewer leaves its repeatable cells empty, non-repeatable fields are repeated on each row. A form stays one sheet (XLSX) or one file of the ZIP (CSV).
- **Test data**: `GET /studies/{id}/export/test/{patients|ecrf}/{csv|xlsx}` (`?layout=long`), only in Configuration (403 otherwise), same rights and site filtering as the normal exports, test patients only; file named `*_TEST_*` and a last column "Donnée de test" (`TEST` on every row); `study.test_exported` activity log entry. The normal exports never hold a test patient.

There is no CDISC ODM export in the application yet: the laterality qualifier will come with it.

## Import

The import reads the wide-format per-eye columns (`_od` / `_os`, `_og`, `OD` / `OG`, `droit` / `gauche`, in French or English) and the `study_eyes` column (OD, OS, OG or OU, checked against the laterality settings of the study): the same names as the wide export, so an export reads back. Each value is stored with its eye and never overwritten. A header without an eye (`BCVA`)
is flagged and left to the user.
The long format of the export is not read. See [Import service](/en/backend/import/).
