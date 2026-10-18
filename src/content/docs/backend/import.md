---
title: "Service d'import de données"
description: "Le service d'import côté serveur de l'assistant d'étude : lecture d'un fichier au format large, mapping vers les champs eCRF, conversion d'unités, règles de validation, décisions, données identifiantes et reprise."
---

> 🌐 Version française · [English version](/en/backend/import/)

Référence développeur de `App\Import` (pas d'interface, aucune donnée d'étude écrite : l'application d'un import est une étape distincte).

---

## Contrat

- Chaque méthode prend un **chemin lisible** et ne le copie jamais. L'appelant possède le fichier téléversé (stockage temporaire chiffré) et le supprime en cas de succès, d'échec ou d'annulation.
- L'étude cible appartient à l'espace de travail actif de l'appelant : la façade travaille sur une session `DataImport` (cloisonnée par le dépôt) et un `FieldCatalog` construit depuis cette étude.
- Rien d'identifiant n'est journalisé ni levé : les messages d'`ImportException` sont génériques et portent un code `reason`. Les colonnes identifiantes exclues ne sont **pas lues en mémoire** (retirées au parsing) et n'atteignent ni la session, ni le rapport, ni un fichier temporaire.
- Le rapport est recalculé à chaque appel depuis le fichier, le mapping et les décisions. `ImportReport::isBlocked()` / `ImportAnalyzer::assertReady()` sont la règle serveur derrière « Continuer ».

## Façade : `ImportAnalyzer`

| Méthode | Rôle |
|---|---|
| `start($import, $path, $catalog, $visits, ?$settings, $discardDecisions, $options)` | Première lecture ou re-parse : résout feuille, séparateur et ligne d'en-tête, propose le mapping et la table suffixe → visite, les stocke (avec le SHA-256) dans la session et renvoie le rapport. Re-parse : voir ci-dessous. |
| `analyze(...)` | Passe en flux : convertit et valide chaque ligne, met à jour `DataImport::$statistics`, renvoie l'`ImportReport`. |
| `results(...)` | Générateur de `RowResult` (enregistrement + problèmes) pour les lignes à appliquer : lignes en erreur et exclues ignorées. |
| `mapColumn`, `ignoreColumn`, `leavePending`, `setSourceUnit`, `setVisitForSuffix`, `setIdentifyingPolicy` | Décisions de mapping sur la session. Une colonne de base porte ses colonnes suffixées. Une colonne identifiante ne peut être ni mappée, ni ignorée, ni corrigée. |
| `decisions` / `saveDecisions`, `correctCell` | `ImportDecisions` (remplacer une valeur, accepter un groupe d'avertissements, exclure des lignes, corriger une cellule). `correctCell` lit la valeur « avant » dans le fichier. |
| `pendingHeaders` | Colonnes mappées qu'aucune passe n'a encore importées (reprise). |
| `assertReady($report)` | Lève une exception si le rapport a des motifs de blocage. |

Un re-parse qui change la feuille, le séparateur ou la ligne d'en-tête alors que des décisions existent lève `REPARSE_NEEDS_CONFIRMATION` sauf si `$discardDecisions` vaut vrai (les décisions sont alors effacées).

`ImportReport` : `settings`, `sheets`, `headers`, `preview` (cellules identifiantes masquées), `columns` (`ColumnMapping`, une par colonne), `groups` (une par colonne de base), `suffixMap`, `unmappedRequired`, `mappingConflicts`, `problems` (`ProblemGroup`, par champ et règle), `errorRows`,
`rowsToFix`, `counters` (total, prêtes, avertissements, erreurs, exclues), `summary` (patients, lignes, valeurs, formulaires, exclusions, corrections, requêtes, colonnes identifiantes, SHA-256), `inferred` (proposition par colonne non mappée), `resume`, `lastDataRow`, `annotationRows`,
`columnNotes`, `columnGroups`.

## Lecture (`FileReader`)

`.xlsx`, `.xls`, `.csv` (50 Mo). Le CSV est lu en flux (BOM, guillemets et guillemets doublés, cellules multilignes, séparateur parmi `;` `,` tabulation `|` par échantillonnage, Windows-1252 converti). Un classeur ne charge que la feuille choisie (par défaut celle qui a le plus de lignes). Ligne d'en-tête de 1 à 5.

- **Bloc de données** : la ligne d'en-tête et les lignes contiguës en dessous, jusqu'à la première ligne vide. Toute ligne non vide après ce trou est une **ligne d'annotation** : pas un patient, non comptée, non contrôlée. Les réglages `lastDataRow` et `ignoredRows` la remplacent (fichiers sans ligne vide de séparation).
- **Notes de colonne** (`columnNotes`) : en-tête vers texte de la note, une plage fusionnée s'appliquant à chaque colonne couverte. `NoteParser` suggère des options depuis les lignes `code: libellé` / `code = libellé` (séparées par un retour à la ligne ou ` / `) ; une note qui ne se lit pas reste
  une note simple. Ce sont des **suggestions uniquement** (les légendes sont souvent décalées ou incomplètes) : jamais des règles de validation.
- **Groupes de colonnes** (`columnGroups`) : cellules d'en-tête consécutives de même couleur de fond (classeurs uniquement).
- Une cellule de classeur n'est une date que si son format numérique est un format de date ; un nombre simple n'est jamais deviné comme une date.

## Mapping

- **Cibles** (`FieldCatalog`) : `patient_id` et `visit_date` (système), puis chaque champ eCRF importable de l'étude (type, `required`, `validationMin` / `validationMax`, `unit`, `options`, variable SDTM lus depuis le champ). Blocs statiques, fichiers, matrices et champs calculés ne sont pas des cibles. Clé : l'id du champ en chaîne.
- **Synonymes** : `config/import/synonyms.yaml` (FR / EN / CDISC). Un concept s'attache à un champ par sa variable SDTM ou par un nom / libellé égal à un terme ; le champ répond alors à tous ses termes. Par champ : règle de validation `{"type": "import_synonyms", "params": {"terms": [...]}}`. Le même fichier contient les catégories identifiantes et les cibles système.
- **`AutoMapper`** : insensible aux accents, à la casse et à la ponctuation. Score 1,00 (nom, libellé ou variable SDTM), 0,95 (synonyme), 0,60 à 0,90 (mot entier d'un terme de 4 lettres ou plus). À partir de 0,85 le mapping est appliqué (`auto`), de 0,50 à 0,85 c'est une suggestion `review` (état `pending`). Une colonne par champ, meilleur score d'abord.
- **Suffixes de visite** (`ColumnAnalyzer`) : `_n` ou `.n`. Une colonne n'est une colonne de visite que si sa **colonne de base existe** (`WEIGHT_1` exige `WEIGHT`) ; `1ere_cs`, `rcTNM_infiltrant1`, `contrôle_regional` sont des colonnes simples. Sans aucune paire de suffixes, toute la ligne est une
  seule visite (la première). La colonne de base est la visite 0 ; la table suffixe → visite suit l'ordre du protocole par défaut (modifiable) ; sans calendrier, les visites sont créées d'après leurs dates (`visitId` nul).
- **Colonnes identifiantes** (dictionnaire) : nom, nom de naissance, prénom, date de naissance, NIR, adresse, téléphone, e-mail (snake case français inclus). Politiques : `exclude` (défaut : colonnes retirées au parsing), `pseudonymise` (HMAC-SHA256 par étude, `Pseudonymiser::forStudy()`), `keep`
  (seulement si l'appelant l'autorise ; les valeurs restent en mémoire dans `PatientRecord::$identifying`).

## Unités (`UnitConverter`)

`converti = brut * facteur + décalage`, vers l'unité protocole du champ, valeur brute conservée dans `ConvertedValue::$raw`. Définies dans `config/import/units.yaml` : paires génériques (lb vers kg 0,4536, m vers cm 100, mm, in, g, F vers C) et paires par analyte (`analytes` : glucose mg/dL vers
mmol/L 0,0555 et g/L vers mmol/L 5,55, cholestérol, créatinine). Un champ peut porter son propre facteur : `{"type": "unit_conversion", "params": {"from": "mg/dL", "factor": 0.0555, "offset": 0}}` (prioritaire sur le fichier). L'unité source est détectée dans l'en-tête (`(kg)`, `[mg/dL]`, `kg`
final) et modifiable par colonne. Aucune conversion définie : erreur `unit_not_convertible`.

## Règles (`RowValidator`)

Groupées par champ et règle (`ProblemGroup`).

| Règle | Gravité |
|---|---|
| `missing_patient_id`, `duplicate_patient_id` (occurrences suivantes) | erreur |
| `required_missing` (visites existantes, champ obligatoire) | erreur |
| `invalid_date`, `future_date` | erreur |
| `not_numeric` (texte avec chiffres), `unrecognised_value` (valeur de liste, booléen, jeton sans chiffre dans une colonne numérique : remplaçable) | erreur |
| `unit_not_convertible` | erreur |
| `visit_values_without_date`, `visit_dates_out_of_order` | erreur |
| `out_of_range` (après conversion), `non_standard_icd10` (SDTM `MHDECOD` / `AEDECOD` ou règle `icd10`), `ambiguous_date` (format auto, jour et mois tous deux inférieurs ou égaux à 12) | avertissement |

Les nombres acceptent la virgule ou le point décimal, les séparateurs de milliers et la notation scientifique (`1E-3`). Dates : ISO toujours, `dmy` / `mdy` / `auto`, calendrier strict, années à deux chiffres. Une visite dont la date est vide est absente. Les erreurs bloquent (`blockingReasons()`) ;
les avertissements non, et un groupe accepté crée une requête par ligne (`summary.queries`).

## Décisions (`DataImport::$decisions`)

`replacements` (cible, valeur brute, remplacement ; un remplacement vide laisse la cellule vide), `acceptedWarnings` (`cible|règle`), `excludedRows`, `corrections` (`row`, `column`, `before`, `after`). Les numéros de ligne sont ceux du fichier.

## Reprise

`AnalysisOptions::$activeHeaders` (par défaut `pendingHeaders()` dès qu'une passe existe) limite une passe aux colonnes nouvellement mappées. `AnalysisOptions::$existing` (id patient, puis id de visite protocole ou date `Y-m-d`, puis clé du champ, puis valeur) permet au rapport de signaler par
patient : nouveau ou existant ; par valeur : ajout, identique ou conflit (jamais écrasé, une requête chacun).

## Colonnes non mappées

`TypeInferer` propose un champ par colonne de base non mappée : booléen (oui / non), petit jeu de codes entiers de 0 à 20 (liste de valeurs), nombre (virgule, point, scientifique), date, liste (peu de valeurs répétées), texte (les chaînes TNM restent du texte). La proposition porte l'unité de l'en-tête et la plage observée.

## Définir des champs depuis les colonnes (`App\Import\FieldDefinition`)

Une colonne de base non mappée peut devenir un champ eCRF, puis être mappée dessus pour être importée par une passe suivante (la reprise n'écrase rien).

- **Propositions** (`FieldProposer`, depuis l'`ImportReport`, jamais depuis le client) : une par colonne de base non mappée, dans l'ordre du fichier. Libellé = en-tête sans unité ni suffixe, nom technique unique dans l'étude (minuscules, sans accent, `_`), type de `TypeInferer`, unité de l'en-tête, plage observée pour un nombre.
  Une **liste de valeurs** reprend les options de la note de colonne (`code`, `label`) puis ajoute, à libeller, les valeurs présentes dans les données mais absentes de la note : une valeur n'est jamais écartée. Une note qui ne se lit pas comme des codes devient le texte d'aide.
  Les colonnes suffixées (`X_1`) nourrissent le même champ (`visitSuffixes`).
- **Catégorie** : un formulaire existant de l'étude (brouillon ou actif) ou un nouveau, et une section par groupe de couleur d'en-tête (« Groupe 1 », « Groupe 2 »… dans l'ordre d'apparition, modifiable) ;
  les colonnes sans couleur vont dans la section « Champs importés ». Une section existante du formulaire peut être choisie (`sectionId`).
- **Création** (`FieldCreator`, une transaction) : le formulaire brouillon reçoit les champs ; un formulaire **actif** reçoit un **amendement** : `EcrfForm::amend()` incrémente `version` (les enregistrements déjà saisis gardent la leur, les champs existants ne changent pas) et le journal d'activité reçoit `ecrf.form.amended` (ancienne et nouvelle version, champs, motif obligatoire).
  Brouillon : `ecrf.fields.created_from_import` ; nouveau formulaire : `ecrf.form.created_from_import`.
  Un formulaire fermé ou archivé, une étude gelée ou un import terminé sont refusés. Le champ porte les règles de l'import : type, plage, unité, options (le code que contiennent les cellules ; le libellé de la note est conservé dans l'aide du champ) et un synonyme de l'en-tête. Ensuite chaque colonne est mappée au nouveau champ (`ImportAnalyzer::mapColumn`).
- **Cloisonnement** : le formulaire et la section sont cherchés parmi ceux de l'étude de l'import (jamais par identifiant seul) ; l'import est lu avec son espace de travail et son étude ; le droit d'administrateur de l'étude (`StudyVoter::ADMIN`) est requis. Sinon 404 / 403.

Points d'accès JSON (`ImportFieldDefinitionController`), pour l'interface d'import :

| Route | Rôle |
|---|---|
| `GET /studies/{studyId}/imports/{importId}/field-proposals` | propositions, sections par défaut, formulaires existants, jeton CSRF. Relit le fichier archivé via `ImportFileProvider` (409 si absent). |
| `POST /studies/{studyId}/imports/{importId}/fields` | crée les champs choisis (`formId` ou `newFormTitle`, `reason`, `fields[]`) ; jeton CSRF dans l'en-tête `X-CSRF-Token`. |
