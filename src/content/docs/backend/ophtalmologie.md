---
title: "Ophtalmologie : latéralité et mesures par œil"
description: "Réglages de latéralité d'une étude d'ophtalmologie, œil de l'étude à l'inclusion, champs eCRF par œil, valeurs stockées avec leur œil, modèles d'eCRF, exports long et large."
---

> 🌐 Version française · [English version](/en/backend/ophthalmology/)

Les ophtalmologues travaillent œil par œil : un patient peut être inclus pour un œil ou pour les deux, et la plupart des mesures (acuité visuelle, pression intraoculaire, OCT) sont relevées pour chaque œil. La latéralité est un attribut explicite de la valeur stockée, pas deux champs sans lien.

---

## Réglages de l'étude

Affichés à l'étape Design de l'assistant (et à l'étape Étude du mode Essentiel) quand le domaine thérapeutique est l'ophtalmologie (`Study::usesLaterality()`), stockés sur la ligne de l'étude (`App\Entity\Embeddable\LateralitySettings`, colonnes `laterality_*`) :

| Réglage | Valeurs | Rôle |
|---------|---------|------|
| `unit` | `patient`, `eye` | Unité d'analyse : le patient ou l'œil |
| `eyes` | `one`, `both`, `either` | Un œil (choisi à l'inclusion), les deux yeux, ou un œil ou les deux |
| `rule` | `worse`, `better`, `investigator` | Règle quand les deux yeux sont éligibles (étude d'un seul œil) : le plus atteint, le moins atteint, choix de l'investigateur |

## Œil de l'étude à l'inclusion

`StudyPatient::$studyEyes` (`App\Enum\Laterality` : `OD` œil droit, `OS` œil gauche, `OU` les deux, null si non renseigné).

Le formulaire d'inclusion et la page de modification l'exigent pour une étude d'ophtalmologie, dans les valeurs que permettent les réglages (`App\Laterality\StudyEyePolicy` : un œil → OD ou OS, deux yeux → OU, un œil ou les deux → OD, OS ou OU). Un changement est tracé dans le journal d'activité (`study_eye:OD->OS`).

## Champs par œil

- `EcrfField::$perEye` / `EcrfTemplateField::$perEye` (interrupteur « Une valeur par œil (OD / OS) » dans les propriétés du champ du constructeur).
- Réservé aux champs simples (`EcrfFieldType::supportsPerEye()` : texte, zone de texte, nombre, date, booléen, liste, radio, cases à cocher) d'une section de premier niveau non répétable ; ailleurs le drapeau est ignoré.
- La saisie affiche OD et OS côte à côte ; l'œil de l'étude est signalé. Les champs sont nommés `field_{id}_OD` et `field_{id}_OS`.
- Stockage : `EcrfValue::$laterality` (`OD`, `OS`, vide pour toute autre valeur). La colonne n'est pas nullable (`''` par défaut) pour que l'index unique `UNIQ_ECRF_VALUE` (qui inclut `laterality`) continue de refuser un doublon. Les données existantes ne changent pas. Un œil laissé vide n'a pas de ligne.
- Seul l'œil de l'étude peut être obligatoire ; l'œil adelphe reste facultatif. Sans œil de l'étude renseigné, aucun œil n'est obligatoire. L'intervalle (minimum, maximum) et les règles s'appliquent à chaque œil (`EcrfRuleEngine::validateFields`, messages « BCVA (OD) »).
- L'enregistrement automatique envoie `laterality` (`OD` ou `OS`) ; un champ par œil sans œil, ou un autre champ avec un œil, est refusé (422).
- Limite : une condition de visibilité qui cite un champ par œil ne voit pas sa valeur.

## Piste d'audit, discordances, signature

- `EcrfValueAudit::$laterality` ; l'œil entre dans l'empreinte HMAC seulement quand il existe (`lat:OD`), donc les empreintes déjà écrites restent valides. Les entrées d'une même soumission sont chaînées entre elles (`EcrfAuditWriter::createChained`). Le fil d'audit d'un champ et l'export d'audit (colonne `eye`) montrent l'œil.
- `EcrfQuery::$laterality` : une discordance sur un champ par œil désigne l'œil concerné.
- Le contenu signé d'un enregistrement (`EcrfSignatureService`) inclut l'œil (`champ:répétition:parent:OD`), sans changer le contenu déjà signé.

## Unités et modèles

Conversion de l'acuité affichée pendant la saisie (`App\Laterality\BcvaConversion`, `assets/js/eye-measures.js`) : logMAR = (85 − lettres ETDRS) / 50, décimale = 10^−logMAR, Snellen 20/x avec x = 20 × 10^logMAR. L'échelle se déduit de l'unité du champ (`lettres ETDRS`, `logMAR`, `Snellen décimal`).

Trois modèles (`App\Laterality\OphthalmologyTemplates`, références `ECRF-OPH-001` à `003`). Un workspace les reçoit à sa création (`EcrfTemplateLoader::loadLibrary()`, dans la même transaction ; un modèle que le workspace supprime ne revient pas). Pour les workspaces existantes, ils sont chargés, publiés, dans tous les workspaces ou dans une seule, par `app:ecrf-templates:seed`
(idempotent, autorisé en production, voir [Commandes](/commands/#appecrf-templatesseed) et
[Déploiement en production](/deployment/production/)). `app:create-fake-ecrf-templates` (donc `app:seed`) charge les
mêmes définitions par le même chargeur (`App\Service\EcrfTemplateLoader`) et ne copie pas un modèle déjà présent
dans le workspace :

- « Ophtalmologie : visite initiale » (antécédents, statut du cristallin, BCVA, PIO et méthode, réfraction, lampe à fente, fond d'œil, OCT) ;
- « Ophtalmologie : visite de suivi » (BCVA, PIO, OCT, événements indésirables par œil) ;
- « Ophtalmologie : événements indésirables oculaires » (section répétable avec l'œil concerné).

Visites proposées par l'assistant (colonne `ecrf_template.visit_plan`, `App\Enum\TemplateVisitPlan`) : la visite initiale de la première visite jusqu'à la visite d'inclusion comprise, donc à la sélection et à l'inclusion (`first`), la visite de suivi aux visites après l'inclusion (`after_first`), les événements indésirables à toutes (aucune règle). Les valeurs stockées gardent leur nom.
La visite d'inclusion est la première visite à J0 (à défaut, la première visite : sans visite de sélection, la visite initiale n'est qu'à l'inclusion). Sans visite après l'inclusion, le suivi est planifié à la dernière visite. C'est un point de départ : la matrice reste modifiable. La migration pose la règle sur les modèles déjà chargés (référence et titre d'origine) ; un autre modèle n'a pas de règle.

Valeurs par défaut : BCVA 0 à 100 lettres ETDRS (logMAR −0,3 à 3,0), PIO 0 à 80 mmHg (Goldmann, rebond, non-contact), CST en µm, volume maculaire en mm³, liquide intrarétinien et sous-rétinien.

Le logMAR d'un formulaire qui a aussi les lettres ETDRS par œil est **calculé** (`App\Laterality\DerivedLogMar`) : lecture seule à l'écran, jamais demandé, écrit avec les lettres du même œil (saisie, autosauvegarde), avec sa propre entrée d'audit (source `computed`, motif généré en cas de recalcul). Une valeur qui n'est pas la conversion des lettres (saisie avant la règle, importée) n'est jamais écrasée.

## Exports

`StudyEcrfExportService` (`GET /studies/{id}/export/ecrf/csv` et `/xlsx`).
Le CSV est un **ZIP d'un fichier CSV par formulaire** (`01_<formulaire>.csv`, tableau à une ligne d'en-tête), l'Excel une feuille par formulaire.
Une colonne vide sur toutes les lignes est retirée, les dates sont au format ISO (`2026-10-31`), les heures sont à l'heure affichée à l'écran (Europe/Paris par défaut, rappelée dans l'en-tête `Dernière mise à jour (Europe/Paris)`) et les statuts sont ceux de l'écran :

- **Large** (défaut) : une ligne par enregistrement, deux colonnes `<champ>_od` et `<champ>_os` par champ par œil (noms techniques, relisibles par l'import).
- **Long** (`?layout=long`) : une ligne par enregistrement et par œil, colonnes `eye` (OD / OS) et `study_eye` (`Y` si l'œil est un œil de l'étude, `N` sinon) ; les champs qui ne sont pas par œil sont répétés sur chaque ligne.
- Une étude d'ophtalmologie ajoute `study_eyes` (OD, OS ou OU, œil de l'étude de l'inclusion).
- **Visites** : une ligne par patient (par patient et par œil en long) ; les colonnes de chaque visite se suivent avec le code de la visite en minuscules pour suffixe, après le nom du champ et l'œil : `bcva_od_v0`, `bcva_os_v0`, `bcva_od_v1`, `BCVA_v1` (champ qui n'est pas par œil). Code vide : nom
  de la visite ; sinon `v<position>` ; caractères autres que lettres et chiffres remplacés par `_` ; suffixe déjà pris : `_2`, `_3` (visites dans l'ordre du calendrier). Colonnes classées par position de visite puis ordre des champs. Un formulaire a des colonnes à une visite s'il y est planifié dans
  la matrice (`study_visit_form`) ou si un enregistrement y existe (aucune valeur saisie n'est perdue) ; une seconde occurrence de la même visite pour un patient ajoute `_r2`, `_r3`. Les enregistrements sans visite (eCRF libre, imports) gardent leurs colonnes sans suffixe, en premier. Sections
  répétables : une ligne par instance, le plus grand nombre de répétitions du patient (toutes visites) décide ; une visite qui en compte moins laisse ses cellules répétables vides, les champs non répétables sont répétés sur chaque ligne. Un formulaire reste une feuille (XLSX) ou un fichier du ZIP (CSV).
- **Données de test** : `GET /studies/{id}/export/test/{patients|ecrf}/{csv|xlsx}` (`?layout=long`), seulement en Configuration (403 sinon), mêmes droits et filtrage par site que les exports normaux, patients de test uniquement ; fichier nommé `*_TEST_*` et dernière colonne « Donnée de test »
  (`TEST` sur chaque ligne) ; entrée `study.test_exported` au journal. Les exports normaux n'ont jamais de patient de test.

L'export CDISC ODM n'existe pas encore dans l'application : le qualificatif de latéralité s'y ajoutera avec lui.

## Import

L'import lit les colonnes par œil au format large (`_od` / `_os`, `_og`, `OD` / `OG`, `droit` / `gauche`, en français ou en anglais) et la colonne `study_eyes` (OD, OS, OG ou OU, validée d'après les réglages de latéralité de l'étude) : les mêmes noms que l'export large, un export se relit. Chaque valeur est stockée avec son œil, jamais écrasée. Un en-tête sans œil (`BCVA`) est
signalé et laissé à l'utilisateur.
Le format long de l'export n'est pas lu. Voir [Service d'import](/backend/import/).
