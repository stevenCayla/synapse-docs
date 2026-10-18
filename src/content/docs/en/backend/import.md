---
title: "Data import service"
description: "The server-side import service of the study wizard: reading a wide-format file, mapping to the eCRF fields, unit conversion, validation rules, decisions, identifying data and resumed passes."
---

> 🌐 [Version française](/backend/import/) · English version

Developer reference of `App\Import` (no UI, no study data written: the application of an import is a separate step).

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

- **Targets** (`FieldCatalog`): `patient_id` and `visit_date` (system), then every importable eCRF field of the study (type, `required`, `validationMin` / `validationMax`, `unit`, `options`, SDTM variable are read from the field). Static blocks, files, matrices and calculated fields are not targets. Key: field id as a string.
- **Synonyms**: `config/import/synonyms.yaml` (FR / EN / CDISC). A concept attaches to a field by SDTM variable or by name / label equal to a term; the field then answers to all its terms. Per field: validation rule `{"type": "import_synonyms", "params": {"terms": [...]}}`. The same file holds the identifying categories and the system targets.
- **`AutoMapper`**: accent / case / punctuation insensitive. Score 1.00 (name, label or SDTM variable), 0.95 (synonym), 0.60 to 0.90 (whole-word match of a term of 4 letters or more). From 0.85 the mapping is applied (`auto`), from 0.50 it is a suggestion `review` (state `pending`). One column per field, best score first.
- **Visit suffixes** (`ColumnAnalyzer`): `_n` or `.n`. A column is a visit column only when its **base column exists** (`WEIGHT_1` needs `WEIGHT`); `1ere_cs`, `rcTNM_infiltrant1`, `contrôle_regional` are plain columns. Without any suffix pair the whole row is one (first) visit. The base column is
  visit 0; the suffix to visit map follows the protocol order by default (editable); without a schedule visits are created from their dates (`visitId` null).
- **Identifying columns** (dictionary): last name, birth name, first name, birth date, NIR, address, phone, e-mail (French snake case included). Policies: `exclude` (default: columns dropped at parse time), `pseudonymise` (keyed HMAC-SHA256 per study, `Pseudonymiser::forStudy()`), `keep` (only when the caller allows it; values stay in memory in `PatientRecord::$identifying`).

## Units (`UnitConverter`)

`converted = raw * factor + offset`, to the field's protocol unit, raw value kept in `ConvertedValue::$raw`. Defined in `config/import/units.yaml`: generic pairs (lb to kg 0.4536, m to cm 100, mm, in, g, F to C) and analyte-specific ones (`analytes`: glucose mg/dL to mmol/L 0.0555 and g/L to mmol/L
5.55, cholesterol, creatinine). A field can carry its own factor: `{"type": "unit_conversion", "params": {"from": "mg/dL", "factor": 0.0555, "offset": 0}}` (wins over the file). The source unit is detected from the header (`(kg)`, `[mg/dL]`, trailing `kg`) and editable per column. No conversion
defined: error `unit_not_convertible`.

## Rules (`RowValidator`)

Grouped by field and rule (`ProblemGroup`).

| Rule | Severity |
|---|---|
| `missing_patient_id`, `duplicate_patient_id` (later occurrences) | error |
| `required_missing` (existing visits, field flagged required) | error |
| `invalid_date`, `future_date` | error |
| `not_numeric` (text with digits), `unrecognised_value` (list value, boolean, token without digit in a numeric column: replaceable) | error |
| `unit_not_convertible` | error |
| `visit_values_without_date`, `visit_dates_out_of_order` | error |
| `out_of_range` (after conversion), `non_standard_icd10` (SDTM `MHDECOD` / `AEDECOD` or rule `icd10`), `ambiguous_date` (auto format, day and month both 12 or less) | warning |

Numbers accept the decimal comma or dot, thousand separators and scientific notation (`1E-3`). Dates: ISO always, `dmy` / `mdy` / `auto`, strict calendar, two-digit years. A visit whose date cell is empty is absent. Errors block (`blockingReasons()`); warnings do not, and an accepted group creates a query per row (`summary.queries`).

## Decisions (`DataImport::$decisions`)

`replacements` (`target`, raw value, replacement; empty replacement leaves the cell empty), `acceptedWarnings` (`target|rule`), `excludedRows`, `corrections` (`row`, `column`, `before`, `after`). Row numbers are the file's.

## Resume

`AnalysisOptions::$activeHeaders` (default: `pendingHeaders()` once a pass exists) restricts a pass to the newly mapped columns. `AnalysisOptions::$existing` (patient id, then protocol visit id or `Y-m-d` date, then field key, then value) makes the report flag per patient: new or existing; per value: addition, same, or conflict (never overwritten, one query each).

## Unmapped columns

`TypeInferer` proposes a field per unmapped base column: boolean (oui / non), small integer code set 0 to 20 (list of values), number (comma, dot, scientific), date, list (few repeating values), text (TNM strings stay text). The proposal carries the unit from the header and the observed range.

## Defining fields from the columns (`App\Import\FieldDefinition`)

An unmapped base column can become an eCRF field, then be mapped to it so that a later pass imports it (resume never overwrites).

- **Proposals** (`FieldProposer`, from the `ImportReport`, never from the client): one per unmapped base column, in file order. Label = header without unit or suffix, technical name unique in the study (lower case, no accent, `_`), type from `TypeInferer`, unit from the header, observed range for a number.
  A **list of values** takes the options of the column note (`code`, `label`), then adds, to be labelled, the values found in the data but missing from the note: a value is never dropped. A note that does not read as codes becomes the help text.
  Suffixed columns (`X_1`) feed the same field (`visitSuffixes`).
- **Category**: an existing form of the study (draft or active) or a new one, and one section per header colour group ("Groupe 1", "Groupe 2"… in order of appearance, editable); columns without colour go to the "Champs importés" section. An existing section of the form can be chosen (`sectionId`).
- **Creation** (`FieldCreator`, one transaction): a draft form just gets the fields; an **active** form is **amended**: `EcrfForm::amend()` raises `version` (records already entered keep theirs, existing fields do not change) and the activity log gets `ecrf.form.amended` (previous and new version, fields, mandatory reason). Draft: `ecrf.fields.created_from_import`; new form: `ecrf.form.created_from_import`.
  A closed or archived form, a frozen study or a finished import is refused. The field carries the import rules: type, range, unit, options (the code the cells hold; the label of the note is kept in the field help) and a synonym of the header. Each column is then mapped to the new field (`ImportAnalyzer::mapColumn`).
- **Isolation**: the form and the section are looked up among those of the import's study (never by id alone); the import is read with its workspace and study; the study admin right (`StudyVoter::ADMIN`) is required. Otherwise 404 / 403.

JSON endpoints (`ImportFieldDefinitionController`), for the import UI:

| Route | Purpose |
|---|---|
| `GET /studies/{studyId}/imports/{importId}/field-proposals` | proposals, default sections, existing forms, CSRF token. Reads the archived file again through `ImportFileProvider` (409 when missing). |
| `POST /studies/{studyId}/imports/{importId}/fields` | creates the chosen fields (`formId` or `newFormTitle`, `reason`, `fields[]`); CSRF token in the `X-CSRF-Token` header. |
