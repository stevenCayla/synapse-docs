---
title: "Service d'import de données"
description: "Le service d'import côté serveur de l'assistant d'étude : lecture d'un fichier au format large, mapping vers les champs eCRF, conversion d'unités, règles de validation, décisions, données identifiantes et reprise."
---

> 🌐 Version française · [English version](/en/backend/import/)

Référence développeur de `App\Import` (la lecture et la validation n'écrivent rien dans l'étude ; l'application d'un import validé est décrite en fin de page).

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

- **Cibles** (`FieldCatalog`) : `patient_id` (numéro de sujet de l'étude, `StudyPatient::subjectId`), `patient_ipp` (« IPP du patient », `Patient::externalId`, distinct du numéro de sujet ;
  une seule colonne), `site` et `visit_date` (système), puis chaque champ eCRF importable de l'étude (type, `required`, `validationMin` / `validationMax`, `unit`, `options`, variable SDTM lus depuis le champ). Blocs statiques, fichiers, matrices et champs calculés ne sont pas des cibles. Clé : l'id du champ en chaîne.
  `AutoMapper` propose `patient_ipp` pour `IPP`, `NIP`, `N° IPP`... **uniquement sous la politique « conserver »** (`IdentifyingPolicy::KEEP` ; passer à « conserver » relance la suggestion sur une colonne encore en attente), sans jamais prendre la colonne du numéro de sujet (`id`, `N° patient` restent `patient_id`) ;
  un fichier dont le seul identifiant est une colonne `IPP` l'utilise comme numéro de sujet (comportement historique, aussi hors « conserver »).
  Un champ eCRF texte, liste ou choix unique reconnu comme **sexe** (variable SDTM `SEX`, ou nom / libellé du concept `sex` du dictionnaire) alimente aussi `Patient::gender` (`TargetField::$patientSex`, `SexNormalizer` : M / H / homme / masculin, F / femme / féminin, autre, U / inconnu ; les codes numériques ne sont pas devinés).
- **Synonymes** : `config/import/synonyms.yaml` (FR / EN / CDISC). Un concept s'attache à un champ par sa variable SDTM ou par un nom / libellé égal à un terme ; le champ répond alors à tous ses termes. Par champ : règle de validation `{"type": "import_synonyms", "params": {"terms": [...]}}`. Le même fichier contient les catégories identifiantes et les cibles système.
- **`AutoMapper`** : insensible aux accents, à la casse et à la ponctuation. Score 1,00 (nom, libellé ou variable SDTM), 0,95 (synonyme), 0,60 à 0,90 (mot entier d'un terme de 4 lettres ou plus). À partir de 0,85 le mapping est appliqué (`auto`), de 0,50 à 0,85 c'est une suggestion `review` (état `pending`). Une colonne par champ, meilleur score d'abord.
- **Suffixes de visite** (`ColumnAnalyzer`) : `_n` ou `.n`. Une colonne n'est une colonne de visite que si sa **colonne de base existe** (`WEIGHT_1` exige `WEIGHT`) ; `1ere_cs`, `rcTNM_infiltrant1`, `contrôle_regional` sont des colonnes simples. Sans aucune paire de suffixes, toute la ligne est une
  seule visite (la première). La colonne de base est la visite 0 ; la table suffixe → visite suit l'ordre du protocole par défaut (modifiable) ; sans calendrier, les visites sont créées d'après leurs dates (`visitId` nul).
- **Colonnes identifiantes** (dictionnaire) : nom, nom de naissance, prénom, date de naissance, NIR, adresse, téléphone, e-mail (snake case français inclus). Politiques : `exclude` (défaut : colonnes retirées au parsing), `pseudonymise` (HMAC-SHA256 par étude, `Pseudonymiser::forStudy()`), `keep`
  (seulement si la base réglementaire de l'étude l'autorise ; les valeurs restent en mémoire dans `PatientRecord::$identifying`).

## Unités (`UnitConverter`)

`converti = brut * facteur + décalage`, vers l'unité protocole du champ, valeur brute conservée dans `ConvertedValue::$raw`. Définies dans `config/import/units.yaml` : paires génériques (lb vers kg 0,4536, m vers cm 100, mm, in, g, F vers C) et paires par analyte (`analytes` : glucose mg/dL vers
mmol/L 0,0555 et g/L vers mmol/L 5,55, cholestérol, créatinine). Un champ peut porter son propre facteur : `{"type": "unit_conversion", "params": {"from": "mg/dL", "factor": 0.0555, "offset": 0}}` (prioritaire sur le fichier). L'unité source est détectée dans l'en-tête (`(kg)`, `[mg/dL]`, `kg`
final) et modifiable par colonne. Aucune conversion définie : erreur `unit_not_convertible`.

## Règles (`RowValidator`)

Groupées par champ et règle (`ProblemGroup`).

| Règle | Gravité |
|---|---|
| `missing_patient_id`, `duplicate_patient_id` (occurrences suivantes), `duplicate_ipp` (le même IPP sur deux patients différents du fichier, ligne suivante) | erreur |
| `required_missing` (visites existantes, champ obligatoire) | erreur |
| `invalid_date`, `future_date` | erreur |
| `not_numeric` (texte avec chiffres), `unrecognised_value` (valeur de liste, booléen, jeton sans chiffre dans une colonne numérique : remplaçable) | erreur |
| `unit_not_convertible` | erreur |
| `visit_values_without_date`, `visit_dates_out_of_order` | erreur |
| `out_of_range` (après conversion), `non_standard_icd10` (SDTM `MHDECOD` / `AEDECOD` ou règle `icd10`), `ambiguous_date` (format auto, jour et mois tous deux inférieurs ou égaux à 12) | avertissement |
| `ipp_conflict` (l'IPP appartient à un autre patient du workspace, ou le patient du numéro de sujet en a déjà un autre : l'IPP du fichier n'est pas écrit) | avertissement |
| `ipp_ignored` (une colonne est mappée à l'IPP mais la politique n'est pas « conserver » : colonne jamais lue, un seul avertissement pour le fichier) | avertissement |
| `unrecognised_sex` (valeur de la colonne sexe que la fiche patient ne sait pas porter : valeur eCRF conservée, sexe du patient laissé vide ; remplaçable) | avertissement |

Un IPP de plus de 100 caractères est une `unrecognised_value` sur la cible `patient_ipp`. L'IPP n'apparaît jamais dans un problème, l'aperçu (`•••`) ni les exemples du mapping.

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

## Écran d'import (quatre sous-étapes)

`StudyImportController` (`/studies/{studyId}/imports`) sert l'étape Import de l'assistant et Patients › Importer avec les mêmes panneaux Twig (`templates/import/`), échangés par `assets/js/import-flow.js` (JSON, jeton CSRF dans `X-CSRF-Token`). Les règles sont dans
`App\Import\Flow\ImportSessionService` : session modifiable seulement en brouillon et hors lecture par le worker, sous-étape refusée (409) tant que le rapport la bloque, validation = rapport non bloquant + certification + mot de passe + signification (`ImportSignatureMeaning`), avec
`DataImport::certify()` et le statut `ready`. Le fichier est déplacé directement dans `private_uploads/imp/` (`SecureFileUploadService::storeImport`), jamais copié ailleurs. Dans l'assistant, `ImportStep::validate()` refuse « Continuer » tant qu'un import est ouvert (brouillon ou en lecture).
Les données sont appliquées par le worker, voir ci-dessous.

## Application d'un import validé (`App\Import\Apply`)

Un import signé (`ready`) est appliqué à l'étude par le worker Messenger (`ApplyImport` : identifiants seulement, aucune valeur dans la file). Il part dès la signature si l'étude est déjà lancée (Configuration ou En cours), et au lancement de l'étude pour les imports validés dans l'assistant (`StudyWizardLauncher`, après la validation de la transaction du lancement).
Un brouillon, une étude terminée, archivée ou gelée refuse l'application. `ImportApplyScheduler` met l'import en file ; `ApplyImportHandler` recharge l'import **dans le workspace du message** (jamais par identifiant seul) et exécute tout dans `RowLevelSecurity::inWorkspace()`.

- **Par lots, un lot = une transaction** (`ImportApplier`, `IMPORT_APPLY_BATCH` lignes, 50 par défaut) : les patients, visites, formulaires, valeurs, audits et requêtes du lot sont enregistrés avec le curseur (`apply_cursor`, dernière ligne du fichier) et les compteurs de l'import. Un échec annule le lot : rien n'est à moitié appliqué ; la reprise (nouvelle livraison,
  `messenger:failed:retry`, ou « Reprendre l'application » à l'écran) repart après le dernier lot validé. L'application est **idempotente** : un patient est retrouvé par son identifiant dans l'étude (cloisonné par workspace), une valeur identique est ignorée, une requête déjà levée n'est pas relevée.
- **Patients** : créés dans le workspace de l'import, **réels** (`is_test = false`, jamais des données de recette : la purge de mise en production ne les touche pas), numéro de sujet = identifiant patient du fichier (64 caractères au plus), site = le site par défaut choisi à la confirmation (automatique si l'étude n'a qu'un site ouvert, sinon `site_required` avant la
  signature ; le choix est couvert par la signature), ou le site propre à la ligne si une colonne est mappée à la cible système « Site » (code ou nom, sans casse ni accent ; valeur inconnue = erreur `unrecognised_value` remplaçable). Un site d'une autre étude ou d'un autre workspace est refusé, date d'inclusion = première visite.
  La garde d'inclusion (`StudyInclusionGuard`, option `$validatedImport`) admet l'import validé en Configuration et En cours sans attendre l'ouverture des inclusions du site ; l'inclusion manuelle d'un patient réel reste refusée en Configuration. **Aucune valeur identifiante n'est enregistrée** avec la politique par défaut ; elle ne l'est que sous « conserver »
  (champs chiffrés du patient : nom, nom de naissance, prénom, date de naissance ; `ImportIdentityWriter`), option que la base réglementaire de l'étude doit autoriser (voir ci-dessous).
  **IPP et sexe** (`ImportApplier::completePatient()`) : un patient existant est toujours retrouvé par son numéro de sujet dans l'étude (jamais par l'IPP) ; l'IPP de la colonne `patient_ipp` (champ chiffré `externalId`, recherchable par son hash) et le sexe ne sont écrits **que s'ils sont vides** sur la fiche, jamais par-dessus une valeur existante.
  Un IPP déjà porté par un autre patient réel du workspace (`ImportPatientIpp`, requêtes toujours bornées au workspace de l'étude, patients de recette ignorés) ou différent de celui du patient n'est pas écrit : compteur `ippConflicts` et avertissement `ipp_conflict` aux contrôles ; compteurs `ippWritten` et `sexWritten`.
  L'IPP est une donnée identifiante : il n'est lu et écrit que sous la politique **« conserver »** (`IdentifyingPolicy::KEEP`, base réglementaire exigée).
  Sous toute autre politique, la cible n'est pas proposée à l'étape 2, une colonne qui la vise encore (brouillon enregistré, appel direct) n'est jamais lue (`ImportPlanner`) et les contrôles affichent l'avertissement `ipp_ignored` ; l'application n'écrit jamais `externalId`. Le sexe, donnée clinique, est écrit sous toutes les politiques.
  L'IPP est masqué dans l'aperçu et **absent de la copie expurgée archivée** (`RedactedCopyWriter`) ; il n'est pas pseudonymisé. La colonne n'est pas dans le modèle de fichier téléchargeable.
  La colonne n'est pas dans le modèle de fichier téléchargeable.
  Une fois écrit, l'IPP suit les mêmes règles d'accès que partout (#269) : en clair seulement pour les investigateurs du centre de l'inclusion, les administrateurs de l'étude et ceux du workspace actif (`IppVoter`), masqué (« •••••• », libellé accessible « IPP masqué ») pour les autres.
  La saisie manuelle suit la même politique « conserver » que l'import (champ désactivé sinon, valeur soumise ignorée côté serveur) ; la recherche par IPP est une égalité exacte sur le hash HMAC, limitée aux inclusions dont l'utilisateur voit l'IPP.
- **Conserver les données identifiantes** (`ImportIdentityPolicy::decide()`) : la décision vient du dossier réglementaire de l'étude (`StudyRegulatoryRecordService`) et du moteur de règles, sans logique par pays dans le code. Les packs portent la règle : une exigence `info` dont les options sont `{"rule": "keepIdentified", "requires": "code1,code2"}` (et `accept:<code>` pour restreindre les
  valeurs
  admises d'une exigence), applicable par sa propre condition. L'étude peut conserver si au moins une règle s'applique et si toutes les règles applicables ont leurs exigences au statut « ok » (aucune erreur ouverte). Graines (packs en brouillon, à valider par les affaires réglementaires) : rétrospectif, niveau d'anonymisation « Identifiées » et base éthique + référence
  (`core.retro.keep-identified`),
  en France MR-004 ou autorisation CNIL avec note d'information (`fr.retro.keep-identified`) ; prospectif, RIPH 1 ou 2 avec le document de consentement (`fr.prospective.keep-identified`). La RIPH 3 et les pays sans règle sont refusés. La raison, en français, s'affiche à l'écran (« Base réglementaire manquante : … ») avec un lien vers l'étape réglementaire de l'assistant ou la checklist de
  configuration.
  **Contrôlée trois fois** : au choix de la politique (un POST forgé est refusé, `keep_not_allowed`), à la signature (refusée si la base a changé depuis) et à l'application (refusée avant toute écriture). Un brouillon dont la base a disparu revient à « Ne pas importer ». **Traçabilité** : l'entrée `import.validated` et le résumé signé portent la politique, la base qui l'a autorisée (règles,
  exigences, versions des packs)
  et les catégories conservées (`identifyingKept` : stockées dans les champs chiffrés, ou seulement dans l'original chiffré) ; jamais une valeur.
- **Visites** : visite du protocole du suffixe (planifiée puis passée à « Réalisée » avec sa date), sinon créée depuis la date (« Visite du jj/mm/aaaa ») ; sans date ni visite, valeurs dans un formulaire libre. **Formulaires** : un enregistrement par formulaire et visite, avec les instantanés des champs comme à la saisie.
- **Valeurs** : jamais écrasées. Absente : écrite avec une entrée `EcrfValueAudit` chaînée (`source = import`, motif `import #id (ligne n)`, plus « cellule corrigée (avant : … ) » ou « converti depuis … »). Identique : ignorée. Différente : requête `import_conflict` sur la valeur, comptée dans le résumé. Chaque avertissement accepté donne une requête `import_warning`.
- **Archive** (`ImportArchiver`) : le fichier téléversé (colonnes identifiantes comprises) est supprimé et remplacé par une copie **chiffrée** (`FileEncryptionService`, libsodium secretstream, clé `APP_FILE_ENCRYPTION_KEY`, `private_uploads/arc/…`, jamais servie). Par défaut c'est la copie expurgée (`RedactedCopyWriter` : sans colonne identifiante ni ignorée, sans
  ligne d'annotation, mêmes numéros de ligne) ; le SHA-256 du fichier d'origine est conservé (`original_sha256`) avec celui de la copie (`archive_sha256`, vérifié à chaque relecture). Sous « conserver », l'original est chiffré tel quel. `ArchivedImportFileProvider` déchiffre vers un fichier temporaire supprimé à la fin de la requête ou du message (`reset()`).
- **Traçabilité** : une entrée `import.applied` du journal d'activité (compteurs, lignes exclues, SHA-256, sceau ; jamais une valeur) et le résumé signé de l'import (`summary`, `summary_hash`) : certification (signataire, signification, empreinte), SHA-256 de l'original et de l'archive, compteurs, lignes exclues avec leur règle, corrections (avant → après),
  avertissements acceptés. `EcrfAuditWriter::verifyChain()` reste valide pour chaque enregistrement, `app:verify-audit-chain` aussi.
- **Statut** : `applied`, ou `partial` si des colonnes restent en attente (elles seront importées plus tard depuis l'archive, sans rien écraser). Un import en cours d'application ou appliqué ne peut plus être annulé.
- **Sans fichier temporaire** : le téléversement reste dans `private_uploads/imp/` (non chiffré, hors webroot) jusqu'à l'application ; l'archive chiffrée est ensuite la seule copie.
