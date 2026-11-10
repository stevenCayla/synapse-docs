---
title: "Data import service"
description: "The server-side import service of the study wizard: reading a wide-format file, mapping to the eCRF fields, unit conversion, validation rules, decisions, identifying data and resumed passes."
---

> 🌐 [Version française](/backend/import/) · English version

Developer reference of `App\Import` (reading and validating write nothing in the study; applying a validated import is described at the end of the page).

---

## Contract

- Every method takes a **readable path** and never copies it. The caller owns the upload (encrypted temporary store) and removes it on success, failure and cancellation.
- The target study belongs to the caller's active workspace: the facade works on a `DataImport` session (workspace scoped by the repository) and a `FieldCatalog` built from that study.
- Nothing identifying is logged or thrown: `ImportException` messages are generic and carry a `reason` code. Excluded identifying columns are **not read into memory** (dropped at parse time) and never reach the session, the report or a temporary file.
- The report is recomputed from the file, the mapping and the decisions on each call. `ImportReport::isBlocked()` / `ImportAnalyzer::assertReady()` are the server-side rule behind "Continue".

## Facade: `ImportAnalyzer`

| Method | Purpose |
|---|---|
| `start($import, $path, $catalog, $visits, ?$settings, $discardDecisions, $options)` | First look or re-parse: resolves sheet, separator and header row, proposes the mapping and the suffix to visit map, stores them (and the SHA-256) in the session, returns the report. Re-parse: see below. |
| `analyze(...)` | Streaming pass: converts and validates every row, updates `DataImport::$statistics`, returns the `ImportReport`. |
| `results(...)` | Generator of `RowResult` (record + issues) for the rows to apply: rows in error and excluded rows are skipped. |
| `mapColumn`, `ignoreColumn`, `leavePending`, `setSourceUnit`, `setVisitForSuffix`, `setIdentifyingPolicy` | Mapping decisions on the session. A base column carries its suffixed columns. Identifying columns cannot be mapped, ignored or corrected. |
| `decisions` / `saveDecisions`, `correctCell` | `ImportDecisions` (replace a value, accept a warning group, exclude rows, correct a cell). `correctCell` reads the "before" value from the file. |
| `pendingHeaders` | Mapped columns no pass has imported yet (resume). |
| `assertReady($report)` | Throws when the report has blocking reasons. |

A re-parse that changes the sheet, the separator or the header row while decisions exist throws `REPARSE_NEEDS_CONFIRMATION` unless `$discardDecisions` is true (the decisions are then cleared).

`ImportReport`: `settings`, `sheets`, `headers`, `preview` (identifying cells masked), `columns` (`ColumnMapping`, one per column), `groups` (one per base column), `suffixMap`, `unmappedRequired`, `mappingConflicts`, `problems` (`ProblemGroup`, by field and rule), `errorRows`, `rowsToFix`,
`counters` (total, ready, warnings, errors, excluded), `summary` (patients, rows, values, forms, exclusions, corrections, queries, identifying columns, SHA-256), `inferred` (proposal per unmapped column), `resume`, `lastDataRow`, `annotationRows`, `columnNotes`, `columnGroups`.

## Reading (`FileReader`)

`.xlsx`, `.xls`, `.csv` (50 MB). CSV is streamed (BOM, quotes and doubled quotes, multi-line cells, separator among `;` `,` tab `|` by sampling, Windows-1252 converted). A spreadsheet loads the chosen sheet only (default: the sheet with the most rows). Header row 1 to 5.

- **Data block**: the header row and the contiguous rows below it, up to the first empty row. Any non-empty row after that gap is an **annotation row**: not a patient, not counted, not checked. `lastDataRow` and `ignoredRows` settings override it (files without a blank separator).
- **Column notes** (`columnNotes`): header to note text, a merged range applying to each column it covers. `NoteParser` suggests options from lines `code: label` / `code = label` (split on a newline or ` / `); a note that does not parse stays plain. These are **suggestions only** (legends are often offset or incomplete): never validation rules.
- **Column groups** (`columnGroups`): consecutive header cells with the same fill colour (spreadsheets only).
- A spreadsheet cell is a date only if its number format is a date format; a plain number is never guessed to be a date.

## Mapping

- **Targets** (`FieldCatalog`): `patient_id` (study subject id, `StudyPatient::subjectId`), `patient_ipp` ("IPP du patient", `Patient::externalId`, distinct from the subject id;
  one column at most), `site` and `visit_date` (system), then every importable eCRF field of the study (type, `required`, `validationMin` / `validationMax`, `unit`, `options`, SDTM variable are read from the field). Static blocks, files, matrices and calculated fields are not targets. Key: field id as a string.
  `AutoMapper` suggests `patient_ipp` for `IPP`, `NIP`, `N° IPP`... **only under the "keep" policy** (`IdentifyingPolicy::KEEP`; switching to "keep" re-runs the suggestion on a column still pending), and never takes the subject id column (`id`, `N° patient` stay `patient_id`); a file whose only identifier is an `IPP` column uses it as the subject id (historical behaviour,
  under any policy).
  A text, list or single choice eCRF field recognised as **sex** (SDTM variable `SEX`, or name / label of the dictionary's `sex` concept) also feeds `Patient::gender` (`TargetField::$patientSex`, `SexNormalizer`: M / H / homme / masculin, F / femme / féminin, autre, U / inconnu; numeric codes are not guessed).
- **Required fields** (`FieldCatalog::missingRequired()`): a required eCRF field is demanded only when its **form is present in the file**, that is when at least one column is mapped to a field of that form. A form with no mapped column is simply not imported (no record is created: the application only creates a record for a form that receives a value).
  A required field missing from a present form still blocks (`unmappedRequired`, with the form name: "BCVA (OD ou OS) · Ophtalmologie : visite de suivi"). A file mapped to no form keeps every required field demanded (it must feed a form). The patient id is always required.
- **Per-visit columns of the export** (`VisitColumnSuffixes`): the eCRF export suffixes the columns of each visit (`bcva_od_v0`, `BCVA_v1`, `Statut eCRF_v1`, `_r2` for a second occurrence). A header ending with the suffix of a visit of the study (computed as the export does; a suffix made of digits only, like `WEIGHT_1`, is not one) is **never mapped, never matched** to the
  column without suffix (`bcva_od`) and not offered as a new field:
  status `per_visit`, ignored state, shown "Colonne par visite : import non pris en charge", left out of the required-field count, refused by `mapColumn` (`PER_VISIT_COLUMN`). No value is written from it: there is no per-visit import, columns without suffix import as before.
- **Patients already in the study** (`ImportKnownPatients`, `ImportReport::$knownPatients`): a file identifier equal to a subject id of the study (case-insensitive) adds its values to that patient, whatever the identifying data policy. The Checks and Confirmation screens, before signing, warn ("N patients de l'étude portent déjà l'identifiant du fichier") and list code by code
  the values added, already present (skipped) and different (kept, conflict query);
  the count is `ResumeChecker`'s over the patient's values in the study, **visit by visit** (protocol visit of the column slot, else by date, or without visit): a value sent to another visit than the one where the field is already entered is an addition, not a duplicate. Only rows without error count; the list shows the first 50, the number is complete. No value is overwritten.
- **Shared visit date** (`VisitDateSharing`): a single date column can be two targets. A column on the system visit date also feeds the "Date de la visite" field (a DATE field whose name or label is a `visit_date` term) of each form present in the file that no column maps; with no column on the system date, the field column also gives the visit date.
  It is explicit on screen ("Alimente aussi: ..." under the column) and the required field is then satisfied. Two distinct date columns, one per target, stay separate. The field is written like any value: never over a stored value (identical skipped, different = conflict query). A date problem is reported once (main column).
- **Per-eye columns** (ophthalmology study, #305): a per-eye eCRF field (`EcrfField::isPerEye()`) has **one target per eye**, keys `<id>@OD` and `<id>@OS` (`TargetField::$eye`, label "BCVA (OD)"). The values of the report, the plan and the application carry that key; the application turns it into `ecrf_value.laterality`
  (chained audit, import queries and conflicts carry the eye). `EyeText::splitHeader()` reads the eye at the start or the end of the header: `_od` / `_os`, `_og`, `OD` / `OG` / `OS`, "droit" / "gauche", "œil droit", "right" / "left", also in brackets; OG is the left eye (OS). A header only attaches to a per-eye target when it names that eye.
  A header that matches a per-eye field **without naming an eye** (`BCVA`) is never mapped silently: status `needs_eye` ("Œil à préciser", column not imported, not offered as a new field), with two buttons "Œil droit (OD)" / "Œil gauche (OS)"; the required field stays missing until the eye is chosen.
  A header may end with the form title in brackets (`bcva_od (Ophtalmologie : visite de suivi)`) to tell the same field of two forms apart.
  **Study eye**: system target `study_eyes` (ophthalmology studies only, `FieldCatalog::studyEyes()`), values OD, OS (OG) or OU, checked by `StudyEyePolicy::allowed()` against the laterality settings of the study (one eye per patient: OD or OS; both eyes: OU; either: the three); a refused value is a replaceable `unrecognised_value`.
  Written on the inclusion (`StudyPatient::studyEyes`) **only where it has none** (never overwritten: a different value is counted, `studyEyeConflicts`). The rule that picks the study eye (worse, better, investigator) is not recomputed: the file gives the eye. A required per-eye field is demanded for the study eye of the row only (`REQUIRED_MISSING` on the target of that eye);
  without a study eye column no eye is required row by row.
  **Wide format only** (the long format, one row per patient and visit, is not supported; #305 stays open): one row per patient, two columns per per-eye field. The long format of the export (one row per eye, `eye` and `study_eye` columns) is not read: the import assumes one row per patient (a repeated id is `duplicate_patient_id`) and cannot merge several rows of the same
  patient and visit.
- **Synonyms**: `config/import/synonyms.yaml` (FR / EN / CDISC). A concept attaches to a field by SDTM variable or by name / label equal to a term; the field then answers to all its terms. Per field: validation rule `{"type": "import_synonyms", "params": {"terms": [...]}}`. The same file holds the identifying categories and the system targets.
- **`AutoMapper`**: accent / case / punctuation insensitive. Score 1.00 (name, label or SDTM variable), 0.95 (synonym), 0.60 to 0.90 (whole-word match of a term of 4 letters or more). From 0.85 the mapping is applied (`auto`), from 0.50 it is a suggestion `review` (state `pending`). One column per field, best score first.
- **Visit suffixes** (`ColumnAnalyzer`): `_n` or `.n`. A column is a visit column only when its **base column exists** (`WEIGHT_1` needs `WEIGHT`); `1ere_cs`, `rcTNM_infiltrant1`, `contrôle_regional` are plain columns. Without any suffix pair a row is no longer forced onto one visit: each form goes to its own visit (see below).
  Base columns (no suffix) follow the placement rule described next; the suffix to visit map follows the protocol order for suffixed columns (editable); without a schedule visits are created from their dates (`visitId` null).
- **Visit of each column** (`VisitPlacement`, #353): a value goes to the **visit** of its column. Suffixed column: the visit of its suffix (unchanged). Base column, in order: (1) the visit **chosen for the column** (the "Visite" selector of the mapping table, `ColumnMapping::$visitId`, stored with the mapping, kept by a re-parse and later passes);
  (2) an explicit choice on the "base column" row of the suffix to visit table (its value `auto`, the default, gives the schedule back); (3) the **first visit, in protocol order, where the schedule of the study plans the form of the field** (`study_visit_form`); (4) the first visit of the study (historical behaviour: form planned nowhere, or a study without schedule: visit
  created from the dates).
  A visit date column with no choice follows the earliest visit of its columns. Each visit is read under a **slot** (`PlanColumn::$suffix`, `VisitRecord::$suffix`): the suffix that designates that visit in the table, else `VisitPlacement::SLOT_BASE + visit id`, so the columns of one visit, suffixed or not, share one date and one record.
  Several columns can target the same field (the visit date for instance) when their visits are chosen apart; otherwise it is the usual conflict. Each visit has **its own** date: the visit date column of that visit, else the "Date de la visite" field of that visit (`VisitDateSharing`, per slot); a visit with values and no date, in a file that dates its visits, is
  `visit_values_without_date`.
  **Per-visit checks**: a required field of a form fed at a visit by base columns must be fed **at that visit** (`unmappedRequired`, with the visit name). **Warnings, never a refusal** (`ImportReport::$placementNotices`, Checks and Confirmation screens): a form planned nowhere (`unplanned`, the values go to the first visit of the study), a form sent to a visit that does not
  plan it (`off_plan`, imported all the same, off schedule). The Confirmation screen lists the columns per visit (`ImportReport::$placements`).
  **Taking back a previous import**: a new import of the study takes back the visits chosen in the latest applied import (`DataImportRepository::findLatestAppliedByStudy()`, same workspace and same study, never another) for each column with the same header and the same field (`ImportAnalyzer::inheritVisits()`, `ColumnMapping::$visitInherited`); the screen says so ("repris de
  l'import précédent") and the choice stays editable. A visit that no longer exists is ignored.
- **Identifying columns** (dictionary): last name, birth name, first name, birth date, NIR, address, phone, e-mail (French snake case included). Policies: `exclude` (default: columns dropped at parse time), `pseudonymise` (keyed HMAC-SHA256 per study, `Pseudonymiser::forStudy()`), `keep` (only when the study's regulatory basis allows it; values stay in memory in
  `PatientRecord::$identifying`).

## Units (`UnitConverter`)

`converted = raw * factor + offset`, to the field's protocol unit, raw value kept in `ConvertedValue::$raw`. Defined in `config/import/units.yaml`: generic pairs (lb to kg 0.4536, m to cm 100, mm, in, g, F to C) and analyte-specific ones (`analytes`: glucose mg/dL to mmol/L 0.0555 and g/L to mmol/L
5.55, cholesterol, creatinine). A field can carry its own factor: `{"type": "unit_conversion", "params": {"from": "mg/dL", "factor": 0.0555, "offset": 0}}` (wins over the file). The source unit is detected from the header (`(kg)`, `[mg/dL]`, trailing `kg`) and editable per column. No conversion
defined: error `unit_not_convertible`.

## Rules (`RowValidator`)

Grouped by field and rule (`ProblemGroup`).

| Rule | Severity |
|---|---|
| `missing_patient_id`, `duplicate_patient_id` (later occurrences), `duplicate_ipp` (the same IPP on two different patients of the file, the later row) | error |
| `required_missing` (existing visits, field flagged required) | error |
| `invalid_date`, `future_date` | error |
| `not_numeric` (text with digits), `unrecognised_value` (list value, boolean, token without digit in a numeric column: replaceable) | error |
| `unit_not_convertible` | error |
| `visit_values_without_date`, `visit_dates_out_of_order` | error |
| `out_of_range` (after conversion), `non_standard_icd10` (SDTM `MHDECOD` / `AEDECOD` or rule `icd10`), `ambiguous_date` (auto format, day and month both 12 or less) | warning |
| `ipp_conflict` (the IPP belongs to another patient of the workspace, or the patient of the subject id already has another one: the IPP of the file is not written) | warning |
| `ipp_ignored` (a column is mapped to the IPP but the policy is not "keep": the column is never read, one warning for the file) | warning |
| `unrecognised_sex` (value of the sex column the patient record cannot hold: the eCRF value is kept, the patient's sex stays empty; replaceable) | warning |

An IPP longer than 100 characters is an `unrecognised_value` on the `patient_ipp` target. The IPP never appears in a problem, in the preview (`•••`) or in the mapping samples.

Numbers accept the decimal comma or dot, thousand separators and scientific notation (`1E-3`). **Exact values** (workbook: `FileReader` returns the cell number with 15 significant digits, 17 when needed to read back the same number, like the spreadsheet that wrote the file): a value that is not converted is stored **as written in the file**, digit for digit
(`NumberParser::decimalText()`, no float in between: `0.15490195998574319` stays `0.15490195998574319`, `1E-3` becomes `0.001`).
A field value is text and no eCRF field has a precision of its own: nothing legitimately forces a rounding, so there is no precision warning. A **converted** value (unit) is computed: only float noise is cut (10 decimals), the raw value stays in the audit reason. Dates: ISO always, `dmy` / `mdy` / `auto`, strict calendar, two-digit years.
A visit whose date cell is empty is absent. Errors block (`blockingReasons()`); warnings do not, and an accepted group creates a query per row (`summary.queries`).

## Decisions (`DataImport::$decisions`)

`replacements` (`target`, raw value, replacement; empty replacement leaves the cell empty), `acceptedWarnings` (`target|rule`), `excludedRows`, `corrections` (`row`, `column`, `before`, `after`). Row numbers are the file's.

## Resume

`AnalysisOptions::$activeHeaders` (default: `pendingHeaders()` once a pass exists) restricts a pass to the newly mapped columns. `AnalysisOptions::$existing` (patient id, then protocol visit id or `Y-m-d` date, then field key, then value) makes the report flag per patient: new or existing; per value: addition, same, or conflict (never overwritten, one query each).

## Unmapped columns

`TypeInferer` proposes a field per unmapped base column: boolean (oui / non), small integer code set 0 to 20 (list of values; a **sex** column coded 0 / 1 is never proposed as yes / no: `FieldProposer` makes it a list whose observed codes are the options to confirm, and the patient record is only filled when the field is mapped and recognised), number (comma, dot, scientific),
date, list (few repeating values), text (TNM strings stay text). The proposal carries the unit from the header and the observed range.

## Defining fields from the columns (`App\Import\FieldDefinition`)

An unmapped base column can become an eCRF field, then be mapped to it so that a later pass imports it (resume never overwrites).

- **Proposals** (`FieldProposer`, from the `ImportReport`, never from the client): one per unmapped base column, in file order. Label = header without unit or suffix, technical name unique in the study (lower case, no accent, `_`), type from `TypeInferer`, unit from the header, observed range for a number.
  A **list of values** takes the options of the column note (`code`, `label`), then adds, to be labelled, the values found in the data but missing from the note: a value is never dropped. A note that does not read as codes becomes the help text.
  Suffixed columns (`X_1`) feed the same field (`visitSuffixes`).
- **Category**: an existing form of the study (draft or active) or a new one, and one section per header colour group ("Groupe 1", "Groupe 2"… in order of appearance, editable); columns without colour go to the "Champs importés" section. An existing section of the form can be chosen (`sectionId`).
- **Creation** (`FieldCreator`, one transaction): a draft form just gets the fields; an **active** form is **amended**: `EcrfForm::amend()` raises `version` (records already entered keep theirs, existing fields do not change) and the activity log gets `ecrf.form.amended` (previous and new version, fields, mandatory reason). Draft: `ecrf.fields.created_from_import`;
  new form: `ecrf.form.created_from_import`.
  A closed or archived form, a frozen study or a finished import is refused. The field carries the import rules: type, range, unit, options (the code the cells hold; the label of the note is kept in the field help) and a synonym of the header. Each column is then mapped to the new field (`ImportAnalyzer::mapColumn`).
- **Isolation**: the form and the section are looked up among those of the import's study (never by id alone); the import is read with its workspace and study; the study admin right (`StudyVoter::ADMIN`) is required. Otherwise 404 / 403.

JSON endpoints (`ImportFieldDefinitionController`), for the import UI:

| Route | Purpose |
|---|---|
| `GET /studies/{studyId}/imports/{importId}/field-proposals` | proposals, default sections, existing forms, CSRF token. Reads the archived file again through `ImportFileProvider` (409 when missing). |
| `POST /studies/{studyId}/imports/{importId}/fields` | creates the chosen fields (`formId` or `newFormTitle`, `reason`, `fields[]`); CSRF token in the `X-CSRF-Token` header. |

## Import screen (four sub-steps)

`StudyImportController` (`/studies/{studyId}/imports`) serves the wizard Import step and Patients › Import with the same Twig panels (`templates/import/`), swapped by `assets/js/import-flow.js` (JSON, CSRF token in `X-CSRF-Token`). The rules live in `App\Import\Flow\ImportSessionService`: the
session is editable only as a draft and while the worker is not reading it, a sub-step is refused (409) while the report blocks it, validation = non-blocking report + certification + password + meaning (`ImportSignatureMeaning`), through `DataImport::certify()` and the `ready` status. The file is
moved straight into `private_uploads/imp/` (`SecureFileUploadService::storeImport`), never copied elsewhere. In the wizard, `ImportStep::validate()` refuses Continue while an import is open (draft or being read). The data are applied by the worker, see below.

- **Exit always in view**: once a file is deposited (draft or validated import), a bar above the sub-steps offers "Annuler l'import" (confirmation through the application modal, `window.confirmModal`) and, in the wizard (draft study), "Continuer sans cet import": it cancels the import and moves to the next step.
- **Preview**: the file value as is; a normalised date (`yyyy-mm-dd`) is shown as `dd/mm/yyyy` only when it is a valid calendar date (`2027-13-40` stays as is, and the checks flag it: `invalid_date`).
- **Reading settings** are folded when the reading is plausible (rows found, patient id column recognised), open otherwise; the summary (separator, header, date format) stays visible.
- **Field choice**: searchable dropdown (the wizard's, `data-area-combobox`), options grouped by form; the form is added to the label when two targets would read the same.
- **CSV template** (`ImportTemplateWriter`): short headers (the field label), the form title in brackets only when the same name exists in several forms; two columns `<name>_od` / `<name>_os` per per-eye field and `study_eyes` (same names as the wide eCRF export: an export reads back). Under the header, an **empty line then notice lines** (formats, per-eye columns): the reader
  takes them for annotation rows, never patients.
  No example data row is written in the template (deleting the empty line would import it); the sample file stays a development tool.

## Applying a validated import (`App\Import\Apply`)

A signed (`ready`) import is applied to the study by the Messenger worker (`ApplyImport`: ids only, no value in the queue). It starts at the signature when the study is already launched (Configuration or Active), and when the study is launched for the imports validated in the wizard (`StudyWizardLauncher`, after the launch transaction commits). A draft, completed,
archived or frozen study refuses the application. `ImportApplyScheduler` queues the import; `ApplyImportHandler` reloads the import **in the workspace of the message** (never by id alone) and runs everything inside `RowLevelSecurity::inWorkspace()`.

- **In batches, a batch = one transaction** (`ImportApplier`, `IMPORT_APPLY_BATCH` rows, 50 by default): the patients, visits, forms, values, audit entries and queries of the batch are saved together with the cursor (`apply_cursor`, last file row) and the counters of the import. A failure rolls the batch back: nothing is half applied; the resume (redelivery,
  `messenger:failed:retry`, or "Resume the application" on screen) continues after the last committed batch. The application is **idempotent**: a patient is found by its id in the study (workspace-scoped), an identical value is skipped, a query already raised is not raised again.
- **Patients**: created in the workspace of the import, **real** (`is_test = false`, never UAT data: the go-live purge does not touch them), subject id = patient id of the file (64 characters at most), site = the default site chosen at the confirmation (automatic when the study has a single open site, else `site_required` before the signature; the choice is covered by
  the signature), or the row's own site when a column is mapped to the "Site" system target (code or name, case and accent insensitive; unknown value = replaceable `unrecognised_value` error). A site of another study or workspace is refused, inclusion date = first visit. The inclusion guard (`StudyInclusionGuard`,
  `$validatedImport` option) admits the validated import in Configuration and Active without waiting for the site to open enrolment; a manual real inclusion stays refused in Configuration. **No identifying value is stored** under the default policy; only under "keep" (encrypted patient fields: last name, birth name, first name, birth date; `ImportIdentityWriter`), an option the
  regulatory basis of the study must allow (see below).
  **IPP and sex** (`ImportApplier::completePatient()`): an existing patient is always found by its subject id in the study (never by IPP); the IPP of the `patient_ipp` column (encrypted `externalId` field, searchable by its hash) and the sex are written **only when empty** on the record, never over an existing value.
  An IPP already carried by another real patient of the workspace (`ImportPatientIpp`, every query bound to the study's workspace, UAT patients ignored) or different from the patient's own is not written: `ippConflicts` counter and `ipp_conflict` warning in the controls; `ippWritten` and `sexWritten` counters.
  The IPP is identifying data: it is read and written only under the **"keep"** policy (`IdentifyingPolicy::KEEP`, regulatory basis required). Under any other policy the target is not offered in step 2, a column that still targets it (saved draft, direct call) is never read (`ImportPlanner`) and the controls show the `ipp_ignored` warning;
  the application never writes `externalId`. The sex, clinical data, is written under every policy. The IPP is masked in the preview and **absent from the redacted archived copy** (`RedactedCopyWriter`); it is not pseudonymised. The column is not part of the downloadable file template.
- **Keeping identifying data** (`ImportIdentityPolicy::decide()`): the decision comes from the regulatory record of the study (`StudyRegulatoryRecordService`) and the rules engine, with no per-country logic in the code. The packs carry the rule: an `info` requirement whose options are `{"rule": "keepIdentified", "requires": "code1,code2"}` (and `accept:<code>` to restrict the
  accepted values of a
  requirement), applicable through its own condition. The study may keep when at least one rule applies and every applicable rule has its requirements at status "ok" (no open error). Seed data (draft packs, to be validated by regulatory affairs): retrospective, anonymisation level "Identified" and ethics basis + reference (`core.retro.keep-identified`), in France MR-004 or a
  CNIL
  authorisation with a patient
  information notice (`fr.retro.keep-identified`); prospective, RIPH 1 or 2 with the consent document (`fr.prospective.keep-identified`). RIPH 3 and countries without a rule are refused. The reason, in French, is shown on screen ("Base réglementaire manquante : …") with a link to the regulatory step of the wizard or the configuration checklist.
  **Checked three times**: when the policy is chosen (a forged POST is refused, `keep_not_allowed`), at the signature (refused when the basis changed since) and at the application (refused before anything is written). A draft whose basis disappeared goes back to "Do not import".
  **Audit**: the `import.validated` entry and the signed summary carry the policy, the basis that allowed it (rules,
  requirements, pack versions) and the categories kept (`identifyingKept`: stored in the encrypted fields, or only in the encrypted original); never a value.
- **Visits**: the protocol visit of the column slot (suffix, chosen visit or schedule of the form; planned, then set to "Done" with its date), else created from the date ("Visite du dd/mm/yyyy"); with neither, the values go to a free form record. **Forms**: one record per form and visit, with field snapshots as when entered by hand.
- **Per-eye values**: a value of a per-eye field is read and written with its eye (`getValueForFieldAndEye()`, `ecrf_value.laterality`); "never overwritten", identical skipped and conflict apply eye by eye, and the conflict query carries the eye (`EcrfQuery::$laterality`). Counters `studyEyesWritten`, `studyEyeConflicts`.
- **Values**: never overwritten. Missing: written with a chained `EcrfValueAudit` entry (`source = import`, reason `import #id (ligne n)`, plus "cellule corrigée (avant : …)" or "converti depuis …"). Identical: skipped. Different: an `import_conflict` query on the value, counted in the summary. Every accepted warning gives an `import_warning` query.
- **Archive** (`ImportArchiver`): the uploaded file (identifying columns included) is deleted and replaced by an **encrypted** copy (`FileEncryptionService`, libsodium secretstream, key `APP_FILE_ENCRYPTION_KEY`, `private_uploads/arc/…`, never served). By default it is the redacted copy (`RedactedCopyWriter`: no identifying or ignored column, no annotation row, same
  row numbers); the SHA-256 of the original file is kept (`original_sha256`) with the copy's (`archive_sha256`, checked at every read). Under "keep" the original is encrypted as is. `ArchivedImportFileProvider` decrypts into a temporary file removed at the end of the request or message (`reset()`).
- **Audit trail**: an `import.applied` activity log entry (counters, excluded rows, SHA-256, seal; never a value) and the signed summary of the import (`summary`, `summary_hash`): certification (signer, meaning, hash), SHA-256 of the original and of the archive, counters, excluded rows with their rule, corrections (before → after), accepted warnings.
  `EcrfAuditWriter::verifyChain()` stays valid for every record, and so does `app:verify-audit-chain`.
- **Forms created by the import**: "Define these columns as fields" with a new form creates it as a draft and records its id (`DataImport::$createdFormIds`). Once the batches are applied, those that received values are **activated** (`EcrfFormActivator::activate()`, as the "Activate" button: same transition, `ecrf.form.activated` entry, version unchanged since it is the first
  publication; the records already carry the snapshot of their fields). The imported values therefore show in the visit book and on the patient's eCRF, in Configuration and when active. It is also **planned** (optional, at the end of the visit) at the protocol visits where the import wrote its values (`ecrf.form.planned_from_import` entry): the visit book does not show it "out
  of plan". A form without values stays a draft; the signed summary lists `formsActivated`. The Confirmation screen says so before the signature, with the visits that will plan the form.
- **Status**: `applied`, or `partial` when columns are still pending (they will be imported later from the archive, overwriting nothing). An import being applied or applied can no longer be cancelled.
- **Temporary files**: the upload stays in `private_uploads/imp/` (not encrypted, outside the webroot) until the application; the encrypted archive is then the only copy.
