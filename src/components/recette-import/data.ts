// REC-01b · Prospective study with import: content of the acceptance test book
// (French and English). The page is rendered by RecImport.astro and made
// interactive by public/recette-import.js.
export type Lang = 'fr' | 'en';

export type Shot = { file: string; alt: string; caption: string; old?: boolean };
export type Step = {
  title: string;
  where: string;
  head?: string[];
  rows?: string[][];
  shots?: Shot[];
  known?: [string, string][];
  fixed?: [string, string];
  checks: string[];
};

// Test file (the same as the kit page).
export const HEADERS = ['id', 'nom_usuel', 'nom_naissance', 'prenom', 'date_naissance', 'sexe', 'date_diagnostic', 'diagnostic', 'stade_ajcc', 'breslow_mm', 'chirurgie', 'date_chirurgie', 'traitement_adjuvant', 'date_dernieres_nouvelles', 'recidive', 'deces', 'date_deces'];
export const GROUPS = [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 3];
export const ROWS = [
  ['REC-001', 'Martin', 'Martin', 'Lucie', '14/03/1961', '1', '02/02/2023', '2', 'IIA', '1,8', '1', '20/02/2023', '0', '15/09/2026', '0', '0', ''],
  ['REC-002', 'Bernard', 'Petit', 'Claire', '27/11/1958', '1', '15/06/2022', '1', 'IIIB', '', '1', '30/06/2022', '1', '02/10/2026', '1', '0', ''],
  ['REC-003', 'Dubois', 'Dubois', 'Marc', '05/07/1949', '0', '21/01/2021', '2', 'IV', '4,2', '0', '', '2', '10/12/2024', '1', '1', '10/12/2024'],
  ['REC-004', 'Moreau', 'Leroy', 'Anne', '19/09/1972', '1', '08/10/2024', '2', 'IB', 'NE', '1', '25/10/2024', '0', '01/10/2026', '0', '0', ''],
  ['REC-005', 'Laurent', 'Laurent', 'Paul', '30/01/1966', '0', '13/04/2023', '1', 'IIB', '', '1', '28/04/2023', '1', '22/08/2026', '0', '0', ''],
  ['REC-006', 'Simon', 'Simon', 'Julie', '08/12/1980', '1', '17/05/2025', '2', 'IA', '0,6', '1', '03/06/2025', '0', '12/10/2026', '0', '0', ''],
];
export const LEGEND = ['', '', '', '', '', '0: homme 1: femme', '', '1: carcinome 2: mélanome', 'stade AJCC 8e éd.', 'en mm, NE = non évaluable', '0: non 1: oui', '', '0: aucun 1: radiothérapie 2: chimiothérapie', '', '0: non 1: oui', '0: non 1: oui', ''];

export const COMMIT = 'c8b9516';
export const VERSION = '3.2.0';

export const SHOTS_DIR = '/recette-shots/';

export function content(lang: Lang) {
  const fr = lang === 'fr';
  const t = (a: string, b: string) => (fr ? a : b);
  const v = (x: string) => `<span class="val">${x}</span>`;
  const o = (x: string) => `<span class="opt">${x}</span>`;
  const req = o(t('obligatoire', 'required'));
  const H = t('Champ', 'Field');
  const hChoose: string[] = [H, t('À choisir', 'To choose'), t('Explication', 'Explanation')];
  const hEnter: string[] = [H, t('À saisir', 'To enter'), t('Explication', 'Explanation')];
  const hDo: string[] = [t('Élément', 'Item'), t('À faire', 'To do'), t('Explication', 'Explanation')];
  const nothing = t('ne rien cocher', 'tick nothing');

  const steps: Step[] = [
    {
      title: t("Type d'étude", 'Study type'),
      where: t(
        "Menu <b>Études</b> → <b>Nouvelle étude</b>. Dans l'en-tête de la fenêtre, choisir le mode <b>Avancé</b>.",
        'Menu <b>Studies</b> → <b>New study</b>. In the header of the window, choose the <b>Advanced</b> mode.',
      ),
      head: hChoose,
      rows: [
        [t('Mode', 'Mode'), v(t('Avancé', 'Advanced')), t("Essentiel regroupe les étapes et reporte réglementaire, eCRF et calendrier après création. Avancé affiche les 12 étapes ; obligatoire ici pour déposer le consentement.", 'Essential groups the steps and defers regulatory, eCRF and schedule until after creation. Advanced shows the 12 steps; required here to upload the consent.')],
        [t('Type', 'Type'), v(t('Étude prospective', 'Prospective study')), t("Patients inclus au fil de l'eau. Le type est <b>définitif</b> après « Continuer ».", 'Patients enrolled as they come. The type is <b>final</b> after “Continue”.')],
        [t('Brouillon non terminé', 'Unfinished draft'), t('ne pas toucher', 'leave alone'), t('Cliquer sur son nom le reprend, la croix le supprime.', 'Clicking its name resumes it, the cross deletes it.')],
      ],
      shots: [{ file: '01-type.webp', alt: t('Étape 1 : choix prospective ou rétrospective', 'Step 1: prospective or retrospective choice'), caption: t('« Continuer » grisé tant qu\'aucun type n\'est choisi.', '“Continue” stays greyed out until a type is chosen.') }],
      checks: [t("Après « Continuer », l'étape 1 est cochée en vert et le type n'est plus modifiable.", 'After “Continue”, step 1 is ticked green and the type can no longer be changed.')],
    },
    {
      title: t('Informations', 'Information'),
      where: t("Identification de l'étude, reprise dans les rapports et les exports.", 'Identification of the study, reused in reports and exports.'),
      head: hEnter,
      rows: [
        ['Sponsor ' + req, v('CHU Recette (données de test)'), t("Le promoteur, organisme responsable de l'étude.", 'The sponsor, the body responsible for the study.')],
        ['Study ID ' + req, v('RECETTE-SC') + o(t('remplacez SC par vos initiales', 'replace SC with your initials')), t('Code court et unique : lettres, chiffres, tirets. Les minuscules passent en majuscules.', 'Short unique code: letters, digits, hyphens. Lowercase becomes uppercase.')],
        [t('Titre court', 'Short title') + ' ' + req, v('Recette wizard import complet'), t('Nom lisible dans les listes.', 'Readable name in the lists.')],
        [t('Domaine thérapeutique', 'Therapeutic area'), v(t('Oncologie', 'Oncology')), t('Classement des études.', 'Classification of the studies.')],
        [t('Indication', 'Indication'), v('Mélanome (test)'), t('La maladie étudiée.', 'The disease studied.')],
        [t('Numéro de protocole', 'Protocol number'), v('REC-2026-001'), t('Référence interne chez le promoteur, distincte du Study ID.', "Sponsor's internal reference, distinct from the Study ID.")],
      ],
      shots: [{ file: '02-informations.webp', alt: t('Étape 2 remplie', 'Step 2 filled in'), caption: t('Étape 2 remplie.', 'Step 2 filled in.') }],
      known: [['#184', t('La complétude se met à jour au « Continuer », pas pendant la saisie.', 'Completeness is updated on “Continue”, not while typing.')]],
      checks: [t('« Brouillon enregistré » apparaît en bas quelques secondes après la saisie.', '“Draft saved” appears at the bottom a few seconds after typing.'), t('Après « Continuer », les trois bloquants « Informations » disparaissent.', 'After “Continue”, the three “Information” blockers disappear.')],
    },
    {
      title: t('Cadre réglementaire', 'Regulatory framework'),
      where: t('Quatre questions dont Synapse déduit la catégorie par pays.', 'Four questions from which Synapse deduces the category per country.'),
      head: [t('Question', 'Question'), t('À choisir', 'To choose'), t('Explication', 'Explanation')],
      rows: [
        [t('Produit de santé étudié', 'Health product studied'), v(t('Dispositif médical', 'Medical device')), t("Médicament et DIV relèvent d'autres règlements (CTR, IVDR).", 'Medicinal products and IVDs fall under other regulations (CTR, IVDR).')],
        [t('Intervention ajoutée', 'Added intervention'), v(t('Minime', 'Minimal')), t('Minime → RIPH 2 ; Non minime → RIPH 1 ; Aucune → RIPH 3 (interdit de conserver les données identifiantes).', 'Minimal → RIPH 2; Non-minimal → RIPH 1; None → RIPH 3 (identifying data may not be kept).')],
        [t('Données nouvelles ?', 'New data?'), v(t('Nouvelles données', 'New data')), t('« Déjà existantes » mène vers une recherche sur données (hors loi Jardé).', '“Already existing” leads to research on data (outside the Jardé law).')],
        [t("Promoteur établi dans l'UE ?", 'Sponsor established in the EU?'), v(t('Oui', 'Yes')), t("Sinon, un représentant légal dans l'UE est requis.", 'Otherwise a legal representative in the EU is required.')],
      ],
      shots: [{ file: '03-cadre.webp', alt: t('Étape 3 : quatre réponses', 'Step 3: four answers'), caption: t('« Catégorie déduite » reste vide tant qu\'on n\'a pas continué.', '“Deduced category” stays empty until you continue.') }],
      known: [['#187', t("Revenu sur l'étape, l'encadré affiche « France : Non concerné » : les pays ne sont choisis qu'à l'étape 6.", 'Back on the step, the box shows “France: Not concerned”: countries are only chosen at step 6.')]],
      checks: [t('« Continuer » passe à Design ; « Réglementaire : protocole signé, version, date » apparaît en « avant production ».', '“Continue” moves to Design; “Regulatory: signed protocol, version, date” appears under “before production”.')],
    },
    {
      title: 'Design',
      where: t("Structure de l'essai.", 'Structure of the trial.'),
      head: hEnter,
      rows: [
        ['Phase ' + req, v(t('Investigation pivot', 'Pivotal investigation')), t("Pour un dispositif médical, l'application propose : Investigation pilote, Investigation pivot, Suivi post-commercialisation, Sans objet.", 'For a medical device, the application offers: Pilot investigation, Pivotal investigation, Post-market follow-up, Not applicable.')],
        ['Design ' + req, v(t('Bras unique', 'Single arm')), t('Un seul groupe, sans comparateur ni tirage au sort.', 'One group, no comparator and no randomisation.')],
        [t('Randomisation', 'Randomisation'), t('laisser vide', 'leave empty'), t('Sans objet pour un bras unique.', 'Not applicable for a single arm.')],
        [t('Aveugle', 'Blinding') + ' ' + req, v(t('Ouvert', 'Open')), ''],
        [t('Type de contrôle', 'Control type') + ' ' + req, v(t('Aucun', 'None')), ''],
        [t('Inclusion / Suivi', 'Enrolment / Follow-up'), v('12') + ' ' + t('et', 'and') + ' ' + v('12') + ' ' + t('mois', 'months'), t('Recrutement, puis suivi de chaque patient.', 'Recruitment, then follow-up of each patient.')],
        [t('Durée totale', 'Total duration') + ' ' + req, v('24') + ' ' + t('(calculée)', '(calculated)'), t('Somme automatique, modifiable.', 'Automatic sum, editable.')],
      ],
      shots: [{ file: '04-design.webp', alt: t('Étape 4 remplie', 'Step 4 filled in'), caption: t('Durée totale calculée seule.', 'Total duration calculated on its own.') }],
      known: [['#188', t('Phase obligatoire même pour un dispositif (la randomisation est bien masquée en bras unique).', 'Phase is required even for a device (randomisation is correctly hidden for a single arm).')]],
      checks: [t('La durée totale se remplit seule avec 24.', 'The total duration fills itself in with 24.')],
    },
    {
      title: 'Population',
      where: t("Qui peut être inclus et combien.", 'Who can be included and how many.'),
      head: hEnter,
      rows: [
        [t('Effectif cible', 'Target size') + ' ' + req, v('50'), t('Référence des objectifs par site.', 'Reference for the targets per site.')],
        [t('Statut de performance', 'Performance status'), v(t('Indifférent', 'Any')), 'ECOG / Karnofsky.'],
        [t('Âge min / max', 'Min / max age'), v('18') + ' ' + t('et', 'and') + ' ' + v('99'), t("Tester d'abord 80 et 18 : « Continuer » doit refuser.", 'First try 80 and 18: “Continue” must refuse.')],
        [t('Sexe', 'Sex'), v(t('Tous', 'All')), ''],
        [t("Critères d'inclusion", 'Inclusion criteria'), v('Patient majeur (test)') + ' + ' + t('Entrée', 'Enter'), t('Une étiquette par critère.', 'One tag per criterion.')],
        [t("Critères d'exclusion", 'Exclusion criteria'), v('Refus de participer (test)') + ' + ' + t('Entrée', 'Enter'), ''],
      ],
      shots: [
        { file: '05b-ages.webp', alt: t('Âges incohérents refusés', 'Inconsistent ages refused'), caption: t('Âges 80 / 18 refusés.', 'Ages 80 / 18 refused.') },
        { file: '05-population.webp', alt: t('Étape 5 remplie', 'Step 5 filled in'), caption: t('Étape remplie.', 'Step filled in.') },
      ],
      checks: [t('Âges 80 / 18 refusés au « Continuer », avec le message sous le champ.', 'Ages 80 / 18 refused on “Continue”, with the message under the field.'), t('Âges 18 / 99 acceptés.', 'Ages 18 / 99 accepted.')],
    },
    {
      title: 'Sites',
      where: t("Pays de l'étude, puis établissements participants.", 'Countries of the study, then participating sites.'),
      head: hEnter,
      rows: [
        [t('Pays', 'Countries') + ' ' + req, v('France'), t('Rend la catégorie RIPH 2 effective.', 'Makes the RIPH 2 category effective.')],
        [t('Référentiel', 'Directory'), v('LARIB-01 — Hôpital Lariboisière'), t("Sites existants de l'organisation ; optionnels.", 'Existing sites of the organisation; optional.')],
        [t('Investigateur principal', 'Principal investigator'), t('un utilisateur proposé', 'a suggested user'), t('Deviendra membre, restreint aux patients de son site.', 'Becomes a member, restricted to the patients of their site.')],
        [t('Objectif', 'Target'), v('50'), t("Somme comparée à l'effectif cible.", 'Sum compared with the study target.')],
        [t('Activation prévue', 'Planned activation'), v('01/12/2026'), t('Format selon la langue du navigateur.', 'Format depends on the browser language.')],
      ],
      shots: [
        { file: '06a-sites-vide.webp', alt: t('Sites vide', 'Empty sites'), caption: t('Sans site.', 'Without a site.') },
        { file: '06-sites.webp', alt: t('Sites rempli', 'Sites filled in'), caption: t('Somme des objectifs = cible.', 'Sum of targets = target.') },
      ],
      known: [['#189', t("Avec un site sans objectif saisi, « Σ objectifs sites » affiche « -50 vs cible » en orange.", 'With a site that has no target entered, “Σ site targets” shows “-50 vs target” in orange.')]],
      checks: [t('Un site sans investigateur principal bloque l\'étape.', 'A site without a principal investigator blocks the step.'), t('Avec un objectif de 50, « Σ objectifs sites » affiche « cible de l\'étude : 50 ».', 'With a target of 50, “Σ site targets” shows “study target: 50”.')],
    },
    {
      title: t('Réglementaire', 'Regulatory'),
      where: t('Exigences déduites du cadre RIPH 2 et de la France, par pack.', 'Requirements deduced from the RIPH 2 framework and France, per pack.'),
      head: [t('Exigence', 'Requirement'), t('À faire', 'To do'), t('Explication', 'Explanation')],
      rows: [
        [t('Consentement (exprès)', 'Consent (express)'), t('<b>Téléverser</b> un PDF fictif', '<b>Upload</b> a dummy PDF'), t('Son dépôt autorise « Conserver » à l\'import. Une page « TEST » suffit.', 'Uploading it allows “Keep” at import. A “TEST” page is enough.')],
        ['ID-RCB', t('tester ', 'try ') + v('2026-A1234') + t(', puis vider', ', then empty'), t('Format attendu <code>2026-A00000-00</code> ; un format faux doit être signalé.', 'Expected format <code>2026-A00000-00</code>; a wrong format must be flagged.')],
        [t('Avis du CPP', 'CPP opinion'), t('laisser « En attente »', 'leave “Pending”'), t("Obligatoire avant d'inclure.", 'Required before enrolling.')],
        [t('Hébergement des données', 'Data hosting'), t('laisser vide', 'leave empty'), t('HDS obligatoire en production.', 'HDS required in production.')],
        [t('Autres exigences', 'Other requirements'), t('laisser vides', 'leave empty'), t('Points « avant production », non bloquants.', '“Before production” points, not blocking.')],
      ],
      shots: [{ file: '07-reglementaire.webp', alt: t('Matrice France 4/15', 'France matrix 4/15'), caption: t('« cadre RIPH 2 », France 4/15.', '“RIPH 2 framework”, France 4/15.') }],
      fixed: [t('Corrigé le 23/10 (#177)', 'Fixed on 23/10 (#177)'), t('Le premier dépôt pouvait être refusé (« document non attendu »). Tout refus est désormais à signaler.', 'The first upload could be refused (“unexpected document”). Any refusal must now be reported.')],
      checks: [t("L'en-tête indique « Exigences déduites du cadre RIPH 2 ».", 'The header reads “Requirements deduced from the RIPH 2 framework”.'), t('« Conservation des données identifiantes » est déjà « Conforme » avant le dépôt ; le consentement passe à « Conforme » après le dépôt.', '“Retention of identifying data” is already “Compliant” before the upload; consent turns “Compliant” after the upload.'), t('Un ID-RCB au mauvais format est signalé.', 'A badly formatted ID-RCB is flagged.')],
    },
    {
      title: 'eCRF',
      where: t('Les formulaires de saisie.', 'The data entry forms.'),
      head: hChoose,
      rows: [
        [t('Modèle', 'Template'), v(t('Partir de zéro', 'Start from scratch')), t("Les champs seront créés à l'Import ; un modèle créerait des doublons.", 'Fields will be created at Import; a template would create duplicates.')],
        [t('Formulaires propres', 'Own forms'), t('laisser vide', 'leave empty'), ''],
      ],
      shots: [{ file: '08-ecrf.webp', alt: t('eCRF : partir de zéro', 'eCRF: start from scratch'), caption: t('Choix par défaut.', 'Default choice.') }],
      checks: [],
    },
    {
      title: t('Calendrier', 'Schedule'),
      where: t('Visites et formulaires remplis à chacune.', 'Visits and forms completed at each.'),
      head: [H, t('À faire', 'To do'), t('Explication', 'Explanation')],
      rows: [
        [t('Modèle', 'Template'), t('aucun', 'none'), t('J0 = inclusion.', 'D0 = enrolment.')],
        [t('Test des doublons', 'Duplicates test'), v('V0') + ' · Inclusion · J0 ' + t('puis', 'then') + ' ' + v('V0') + ' · Doublon · J30', t("Enregistrer chaque visite avant d'en ajouter une autre.", 'Save each visit before adding another.')],
        [t('Nettoyage', 'Clean-up'), t('<b>supprimer les deux visites</b>', '<b>delete both visits</b>'), t("Sur ce parcours, les formulaires n'existent pas encore : une visite sans formulaire reste un point « avant production ».", 'On this path, the forms do not exist yet: a visit without a form only remains a “before production” item.')],
      ],
      shots: [{ file: '09b-doublon.webp', alt: t('Deux visites V0', 'Two V0 visits'), caption: t('« Code déjà utilisé » sous le champ, puis suppression.', '“Code already used” under the field, then deletion.') }],
      known: [['#179', t("Ajouter une visite pendant une saisie la vide (une visite sans formulaire n'est plus qu'un point « avant production »).", 'Adding a visit during an entry empties it (a visit without a form is now only a “before production” item).')]],
      checks: [t('Deux visites au même code sont refusées sous le champ (« Code déjà utilisé »).', 'Two visits with the same code are refused under the field (“Code already used”).'), t('Sans visite, « Continuer » passe à Équipe.', 'With no visit, “Continue” moves to Team.')],
    },
    {
      title: t('Équipe', 'Team'),
      where: t('Responsables, monitoring et membres.', 'Leads, monitoring and members.'),
      head: hEnter,
      rows: [
        [t('PI coordinateur', 'Coordinating PI') + ' ' + req, t('le PI du site', 'the site PI'), t("Gestionnaire de toute l'étude au lancement.", 'Manager of the whole study at launch.')],
        ['Sponsor lead ' + req, v('Sponsor Recette (test)'), t('Texte libre.', 'Free text.')],
        ['Monitoring ' + req, v(t('Basée sur le risque (RBQM)', 'Risk-based (RBQM)')), ''],
        [t('Membres et droits', 'Members and rights'), nothing, t('PI inclus d\'office. « GCP manquant » : simple avertissement.', 'PI included by default. “GCP missing”: a mere warning.')],
        ['Invitations', t('aucune', 'none'), t('Envoyées au lancement : aucune adresse réelle sur le dev.', 'Sent at launch: no real address on the dev server.')],
      ],
      shots: [{ file: '10-equipe.webp', alt: t('Étape Équipe', 'Team step'), caption: t("Avant #176 : les PI apparaissent désormais en tête, « Inclus d'office ».", 'Before #176: PIs now appear first, “Included by default”.'), old: true }],
      checks: [t("Le PI coordinateur apparaît « Inclus d'office (investigateur principal de site) · rôle Gestionnaire · restreint à <site> ».", 'The coordinating PI appears “Included by default (site principal investigator) · role Manager · restricted to <site>”.'), t('Champs obligatoires remplis : plus de bloquant.', 'Required fields filled in: no more blocker.')],
    },
    {
      title: t('Import · 1. Fichier', 'Import · 1. File'),
      where: t('Déposer le <a href="#pi-fichier">fichier de test</a>.', 'Drop the <a href="#pi-fichier">test file</a>.'),
      head: [t('Champ', 'Field'), t('À vérifier', 'To check'), t('Explication', 'Explanation')],
      rows: [
        [t('Empreinte SHA-256', 'SHA-256 fingerprint'), t('affichée', 'displayed'), t("Prouve quel fichier a été importé.", 'Proves which file was imported.')],
        [t('Lignes / colonnes', 'Rows / columns'), v('6') + ' ' + t('lignes', 'rows') + ', ' + v('17') + ' ' + t('colonnes', 'columns'), t("Hors en-tête, ligne vide et légende.", 'Excluding header, empty row and legend.')],
        [t('Feuille, en-tête', 'Sheet, header'), t('par défaut', 'default'), t('« Relire » efface les décisions prises.', '“Re-read” clears the decisions made.')],
        [t('Format des dates', 'Date format'), v(t('Automatique', 'Automatic')), ''],
        [t('Colonnes identifiantes', 'Identifying columns'), v(t('Conserver', 'Keep')), t("Proposé seulement si la base réglementaire l'autorise.", 'Only offered if the regulatory basis allows it.')],
      ],
      shots: [{ file: '11a-fichier.webp', alt: t('Import · Fichier', 'Import · File'), caption: t('Colonnes identifiantes masquées.', 'Identifying columns hidden.') }],
      checks: [t('4 colonnes identifiantes détectées ; « Conserver » sélectionnable.', '4 identifying columns detected; “Keep” selectable.'), t("Les dates s'affichent en JJ/MM/AAAA.", 'Dates are shown as DD/MM/YYYY.')],
    },
    {
      title: t('Import · 2. Colonnes', 'Import · 2. Columns'),
      where: t('Rapprocher les colonnes puis <b>Définir ces colonnes comme champs</b>.', 'Match the columns then <b>Define these columns as fields</b>.'),
      head: hDo,
      rows: [
        [t('Plage détectée', 'Detected range'), t('« Lignes 2–7 lues comme patients »', '“Rows 2–7 read as patients”'), t('Ligne vide et légende ignorées.', 'Empty row and legend ignored.')],
        ['<code>id</code>', '→ ' + v(t('Identifiant patient', 'Patient identifier')), t('Rapproché automatiquement.', 'Matched automatically.')],
        [t('Formulaire', 'Form'), t('Nouveau formulaire… · ', 'New form… · ') + v('Données importées (test)'), ''],
        ['Type', t('vérifier', 'check'), t('Listes : <code>sexe</code>, <code>diagnostic</code>, <code>chirurgie</code>, <code>traitement_adjuvant</code>, <code>recidive</code>, <code>deces</code> ; Date : <code>date_*</code> ; Texte : <code>stade_ajcc</code> ; Nombre : <code>breslow_mm</code> (unité ', 'Lists: <code>sexe</code>, <code>diagnostic</code>, <code>chirurgie</code>, <code>traitement_adjuvant</code>, <code>recidive</code>, <code>deces</code>; Date: <code>date_*</code>; Text: <code>stade_ajcc</code>; Number: <code>breslow_mm</code> (unit ') + v('mm') + ').'],
        ['Section', t('renommer en ', 'rename to ') + v('Diagnostic') + ', ' + v('Traitement') + ', ' + v('Suivi'), t("Une section par couleur d'en-tête.", 'One section per header colour.')],
      ],
      shots: [
        { file: '11b-colonnes.webp', alt: t('Import · Colonnes', 'Import · Columns'), caption: t('Groupées par couleur.', 'Grouped by colour.') },
        { file: '11c-definir.webp', alt: t('Panneau de définition', 'Definition panel'), caption: t('Autre fichier.', 'Another file.') },
        { file: '11d-champs-crees.webp', alt: t('Champs créés', 'Fields created'), caption: t('Colonnes rapprochées.', 'Columns matched.') },
      ],
      known: [['#193', t('Libellés sans accents et sections « Groupe 1 à 3 » à renommer (reproduit).', 'Labels without accents and “Group 1 to 3” sections to rename (reproduced).')], ['#198', t('Listes réduites aux valeurs présentes dans le fichier.', 'Lists reduced to the values present in the file.')]],
      fixed: [t('Corrigé le 23/10 (#175)', 'Fixed on 23/10 (#175)'), t("« Créer les champs sélectionnés et les mapper » ne faisait rien. Si rien ne se passe, c'est une régression.", '“Create the selected fields and map them” did nothing. If nothing happens, it is a regression.')],
      checks: [t('Plus aucune colonne sans champ.', 'No column left without a field.'), t('Les options des listes reprennent les codes de la légende (diagnostic : 1, 2) ; les libellés (carcinome, mélanome) restent en texte d\'aide.', 'The list options reuse the codes of the legend (diagnostic: 1, 2); the labels (carcinoma, melanoma) stay as help text.'), t("Les colonnes de même couleur sont dans la même section.", 'Columns of the same colour are in the same section.')],
    },
    {
      title: t('Import · 3. Contrôles', 'Import · 3. Controls'),
      where: t('Erreurs bloquantes et avertissements.', 'Blocking errors and warnings.'),
      head: [t('Problème', 'Problem'), t('Action', 'Action'), t('Explication', 'Explanation')],
      rows: [
        [t('<code>NE</code> dans <code>breslow_mm</code>', '<code>NE</code> in <code>breslow_mm</code>'), t('<b>Remplacer</b> avec une valeur vide, dans le bloc « Problèmes par règle »', '<b>Replace</b> with an empty value, in the “Problems by rule” block'), t("« Corriger » avec une cellule vide est refusé (« Saisissez la nouvelle valeur de la cellule »). Valeur d'origine conservée dans l'audit trail ; le résumé affiche « corrections 0 » (écart de l'application signalé).", '“Fix” with an empty cell is refused (“Enter the new value of the cell”). Original value kept in the audit trail; the summary shows “corrections 0” (application gap reported).')],
        [t('« Hors plage »', '“Out of range”'), t('ne rien faire', 'do nothing'), ''],
        [t('« Accepter et créer une requête »', '“Accept and create a query”'), t('tester sur un avertissement', 'test on a warning'), t("Requête créée après application de l'import.", 'Query created after the import is applied.')],
        [t('« Exclure les lignes »', '“Exclude the rows”'), t('non', 'no'), ''],
      ],
      shots: [{ file: '11e-controles.webp', alt: t('Import · Contrôles', 'Import · Controls'), caption: t('Autre fichier.', 'Another file.') }],
      known: [['#178', t("Bornes tirées du fichier : la valeur extrême est parfois signalée « hors plage » à tort.", 'Bounds drawn from the file: the extreme value is sometimes wrongly flagged “out of range”.')]],
      checks: [t('<code>NE</code> est signalé et remplaçable.', '<code>NE</code> is flagged and can be replaced.'), t('« Aucune erreur » une fois corrigé.', '“No errors” once fixed.')],
    },
    {
      title: t('Import · 4. Confirmation et signature', 'Import · 4. Confirmation and signature'),
      where: t("Résumé, puis e-signature de l'import.", 'Summary, then e-signature of the import.'),
      head: hEnter,
      rows: [
        [t('Résumé', 'Summary'), v('6') + ' ' + t('patients, « 4 · conservées »', 'patients, “4 · kept”'), ''],
        ['Certification', t('cocher', 'tick'), ''],
        [t('Signification', 'Meaning'), t('Conformité aux documents source', 'Conformity with the source documents'), t('Sens juridique enregistré (21 CFR Part 11).', 'Legal meaning recorded (21 CFR Part 11).')],
        [t('Mot de passe', 'Password'), t('votre mot de passe', 'your password'), t("Tester d'abord un mauvais mot de passe.", 'First try a wrong password.')],
      ],
      shots: [{ file: '11f-confirmation.webp', alt: t('Import · Confirmation', 'Import · Confirmation'), caption: t('Données appliquées au lancement.', 'Data applied at launch.') }],
      checks: [t('Un mauvais mot de passe est refusé.', 'A wrong password is refused.'), t("Le bon valide l'import ; passage au Récapitulatif.", 'The right one validates the import; moves to the Summary.')],
    },
    {
      title: t('Récapitulatif et lancement', 'Summary and launch'),
      where: t("Relire, ouvrir la fiche PDF, puis <b>Lancer l'étude</b>.", 'Review, open the PDF sheet, then <b>Launch the study</b>.'),
      shots: [{ file: '12-recap.webp', alt: t('Récapitulatif', 'Summary'), caption: t("0 bloquant, « Lancer l'étude » actif.", '0 blockers, “Launch the study” active.') }],
      checks: [t('0 bloquant ; Study ID en majuscules ; bloc Import « Signé » avec votre nom.', '0 blockers; Study ID in capitals; Import block “Signed” with your name.'), t("« Lancer l'étude » ouvre la page Configuration.", '“Launch the study” opens the Configuration page.')],
    },
    {
      title: t('Après le lancement', 'After launch'),
      where: t("L'import s'applique en arrière-plan, quelques secondes après le lancement.", 'The import is applied in the background, a few seconds after launch.'),
      checks: [
        t('<b>Patients</b> : REC-001 à REC-006 présents, rattachés au site.', '<b>Patients</b>: REC-001 to REC-006 present, linked to the site.'),
        t('La fiche patient montre nom, prénom et date de naissance (chiffrés).', 'The patient record shows last name, first name and date of birth (encrypted).'),
        t('« Données importées (test) » contient les valeurs, avec la correction sur REC-004.', '“Données importées (test)” holds the values, with the correction on REC-004.'),
        t('<b>Membres</b> : PI coordinateur et PI du site sont gestionnaires ; connecté en PI, les patients sont visibles.', '<b>Members</b>: coordinating PI and site PI are managers; signed in as PI, the patients are visible.'),
        t("<b>Activité</b> : l'import appliqué est journalisé.", '<b>Activity</b>: the applied import is logged.'),
        t("<b>eCRF</b> : le formulaire s'ouvre dans le concepteur avec ses sections.", '<b>eCRF</b>: the form opens in the designer with its sections.'),
      ],
    },
  ];

  const known: [string, string, string, number][] = [
    [t('Partout', 'Everywhere'), t("Complétude et pastilles mises à jour seulement au « Continuer ».", 'Completeness and badges only updated on “Continue”.'), '#184', 2],
    [t("Reprise d'un brouillon", 'Resuming a draft'), t("Ouverture à la première étape incomplète ; étapes jamais ouvertes cochées.", 'Opens on the first incomplete step; steps never opened are ticked.'), '#185', 0],
    [t('Cadre réglementaire', 'Regulatory framework'), t('Catégorie connue seulement après le choix des pays.', 'Category only known after the countries are chosen.'), '#187', 3],
    ['Design', t('Phase obligatoire pour un dispositif.', 'Phase required for a device.'), '#188', 4],
    ['Sites', t("« Σ objectifs sites » en orange avec un site sans objectif saisi.", '“Σ site targets” in orange with a site that has no target entered.'), '#189', 6],
    [t('Calendrier', 'Schedule'), t("Ajouter une visite pendant une saisie la vide.", 'Adding a visit during an entry empties it.'), '#179', 9],
    ['Import', t('Libellés sans accents, sections « Groupe 1 à 3 », « hors plage » à tort, listes réduites aux valeurs du fichier.', 'Labels without accents, “Group 1 to 3” sections, wrongly “out of range”, lists reduced to the values of the file.'), '#193, #178, #198', 12],
    ['Session', t('Le wizard ne prolonge pas la session (expiration après 15 min).', 'The wizard does not extend the session (expires after 15 min).'), '#181', 0],
  ];

  const ui = {
    title: t('REC-01b · Étude prospective avec import', 'REC-01b · Prospective study with import'),
    description: t(
      "Créer une étude prospective RIPH 2 en mode Avancé, importer un fichier Excel en conservant les données identifiantes, et construire l'eCRF à partir des colonnes du fichier.",
      'Create a RIPH 2 prospective study in Advanced mode, import an Excel file keeping the identifying data, and build the eCRF from the columns of the file.',
    ),
    status: t('Prêt à exécuter', 'Ready to run'),
    updated: t('Mis à jour le 25 oct. 2026', 'Updated on 25 Oct 2026'),
    release: t('release v', 'release v'),
    read: t('Lire le parcours', 'Read the path'),
    exec: t('Exécuter la recette', 'Run the test'),
    modeLabel: t('Mode', 'Mode'),
    kSteps: t('étapes', 'steps'),
    kChecks: t('vérifications', 'checks'),
    kPatients: t('patients fictifs', 'fictitious patients'),
    kTime: t('durée', 'duration'),
    cautionTitle: t('Données fictives uniquement', 'Fictitious data only'),
    caution: t(
      "Le serveur de recette <code>uat.synapse-medical.fr</code> n'est pas un hébergement de santé certifié. N'importez jamais de vrais patients : utilisez le fichier de test ci-dessous.",
      'The acceptance server <code>uat.synapse-medical.fr</code> is not a certified health data host. Never import real patients: use the test file below.',
    ),
    tipTitle: t('Vous lancez une session ?', 'Starting a session?'),
    tip: t(
      'Passez en <b>Exécuter la recette</b> : chaque vérification reçoit un statut OK, KO ou Bloqué, les écarts sont décrits sur place et le PV se génère en fin de parcours.',
      'Switch to <b>Run the test</b>: each check gets an OK, KO or Blocked status, deviations are described on the spot and the report is generated at the end.',
    ),
    hBefore: t('Avant de commencer', 'Before you start'),
    before: [
      t("<b>Compte</b> : un compte administrateur par testeur. À la première connexion : double authentification, codes de secours, nouveau mot de passe. Gardez-le : il sert à <b>signer l'import</b>.", '<b>Account</b>: one administrator account per tester. At first sign-in: two-factor authentication, backup codes, new password. Keep it: it is used to <b>sign the import</b>.'),
      t("<b>Enregistrement automatique</b> : chaque champ est enregistré dans le brouillon quelques secondes après la saisie.", '<b>Auto-save</b>: each field is saved to the draft a few seconds after typing.'),
      t("<b>Continuer</b> valide l'étape côté serveur ; une étape refusée affiche le message sous le champ en cause.", '<b>Continue</b> validates the step on the server; a refused step shows the message under the offending field.'),
      t('<b>Complétude</b> : <b>bloquants</b> empêchent le lancement ; <b>avant production</b> ne bloquent pas la création ; <b>avertissements</b> sont informatifs.', '<b>Completeness</b>: <b>blockers</b> prevent launch; <b>before production</b> items do not block creation; <b>warnings</b> are informational.'),
      t('Fermer la fenêtre ne perd rien : <b>Nouvelle étude</b> propose de reprendre le brouillon.', 'Closing the window loses nothing: <b>New study</b> offers to resume the draft.'),
    ],
    hFile: t('Fichier de test', 'Test file'),
    fileIntro: t(
      "6 patients fictifs, en-têtes déjà colorés : le wizard crée <b>une section eCRF par couleur</b>. Les dates sont de vraies cellules date.",
      '6 fictitious patients, headers already coloured: the wizard creates <b>one eCRF section per colour</b>. Dates are real date cells.',
    ),
    dl: t('Télécharger le fichier .xlsx', 'Download the .xlsx file'),
    copy: t('Copier le tableau', 'Copy the table'),
    legendLabel: t('Légende', 'Légende'),
    key: [t('Sans couleur : identifiant et identité', 'No colour: identifier and identity'), t('Bleu : diagnostic', 'Blue: diagnosis'), t('Vert : traitement', 'Green: treatment'), t('Orange : suivi', 'Orange: follow-up')],
    fileNotes: [
      t('<b>4 colonnes identifiantes</b> (<code>nom_usuel</code>, <code>nom_naissance</code>, <code>prenom</code>, <code>date_naissance</code>) : reconnues par leur nom, masquées, traitées selon la politique choisie.', '<b>4 identifying columns</b> (<code>nom_usuel</code>, <code>nom_naissance</code>, <code>prenom</code>, <code>date_naissance</code>): recognised by name, hidden, handled according to the chosen policy.'),
      t('<b>Ligne vide puis légende</b> : ignorées comme patients ; <code>0: non 1: oui</code> devient les options des listes.', '<b>Empty row then legend</b>: ignored as patients; <code>0: non 1: oui</code> becomes the list options.'),
      t('<b><code>NE</code> dans <code>breslow_mm</code></b> (REC-004) : valeur non numérique que les Contrôles doivent signaler.', '<b><code>NE</code> in <code>breslow_mm</code></b> (REC-004): non-numeric value that the Controls must flag.'),
      t("<b>Cellules vides</b> : aucune valeur créée, pas d'erreur.", '<b>Empty cells</b>: no value created, no error.'),
      t('<b>Jours &gt; 12</b> (14/03, 27/11…) : vérifient la détection JJ/MM/AAAA.', '<b>Days &gt; 12</b> (14/03, 27/11…): check the DD/MM/YYYY detection.'),
    ],
    hWhy: t('Pourquoi ce chemin', 'Why this path'),
    why: t(
      "Conserver noms et dates de naissance n'est permis qu'avec une base réglementaire qui l'autorise : en France, <b>RIPH 1 ou 2</b> et <b>consentement déposé</b> (pas en RIPH 3). Le plan crée donc une RIPH 2 en mode <b>Avancé</b>, seul mode qui affiche l'étape Réglementaire. La catégorie dépend aussi des <b>pays des sites</b> (étape 6).",
      'Keeping names and birth dates is only allowed with a regulatory basis that permits it: in France, <b>RIPH 1 or 2</b> and <b>consent uploaded</b> (not RIPH 3). The plan therefore creates a RIPH 2 in <b>Advanced</b> mode, the only mode that shows the Regulatory step. The category also depends on the <b>countries of the sites</b> (step 6).',
    ),
    hSteps: t('Pas à pas', 'Step by step'),
    session: [t('Testeur', 'Tester'), t('Environnement', 'Environment'), t('Commit / version', 'Commit / version'), t('Navigateur', 'Browser')],
    testerPh: t('Prénom Nom', 'First name Last name'),
    goTo: t("Aller à l'étape", 'Go to step'),
    resume: t("Reprendre où j'en étais", 'Resume where I left off'),
    reset: t('Réinitialiser', 'Reset'),
    copyReport: t('Copier le rapport', 'Copy the report'),
    pv: t('PV (PDF)', 'Report (PDF)'),
    checksTitle: t('À vérifier', 'To check'),
    hKnown: t('Problèmes connus', 'Known issues'),
    knownIntro: t(
      "Relevés le 23/10/2026 et revérifiés le 25/10/2026 sur la v3.2.0, suivis dans le jalon « Study wizard — UX polish ». Ils sont aussi rappelés dans l'étape concernée.",
      'Recorded on 23/10/2026 and rechecked on 25/10/2026 on v3.2.0, tracked in the “Study wizard — UX polish” milestone. They are also repeated in the relevant step.',
    ),
    knownCols: [t('Où', 'Where'), t('Ce que vous verrez', 'What you will see'), t('Suivi', 'Tracking')],
    knownStep: t('Déjà connu, inutile de signaler', 'Already known, no need to report'),
    hReport: t('Signaler un problème', 'Reporting an issue'),
    reportIntro: t(
      'En mode Exécuter, marquez la vérification <b>KO</b> : le modèle s\'ouvre prérempli sous la ligne. Pour un problème hors vérification, joindre une capture et ces informations :',
      'In Run mode, mark the check <b>KO</b>: the template opens pre-filled under the line. For a problem outside a check, attach a screenshot and this information:',
    ),
    template: t(
      "Étape du plan : (numéro et titre)\nAdresse de la page : https://uat.synapse-medical.fr/…\nCe que j'ai fait : (valeurs saisies)\nCe que j'attendais :\nCe qui s'est passé : (message exact, capture)\nNavigateur et heure :",
      'Plan step: (number and title)\nPage address: https://uat.synapse-medical.fr/…\nWhat I did: (values entered)\nWhat I expected:\nWhat happened: (exact message, screenshot)\nBrowser and time:',
    ),
    shotsTitle: t('Captures', 'Screenshots'),
    shotsNote: t(
      "Prises le 23/10/2026, avant les correctifs #175, #176 et #177 : l'écran actuel peut différer légèrement.",
      'Taken on 23/10/2026, before the fixes #175, #176 and #177: the current screen may differ slightly.',
    ),
    old: t('avant correctif', 'before fix'),
    tabInstr: t('Instructions', 'Instructions'),
    tabScreen: t('Écran attendu', 'Expected screen'),
    headings: [
      ['pi-avant', t('Avant de commencer', 'Before you start')],
      ['pi-fichier', t('Fichier de test', 'Test file')],
      ['pi-pourquoi', t('Pourquoi ce chemin', 'Why this path')],
      ['pi-pas', t('Pas à pas', 'Step by step')],
      ['pi-connus', t('Problèmes connus', 'Known issues')],
      ['pi-signaler', t('Signaler un problème', 'Reporting an issue')],
    ] as [string, string][],
  };

  return { steps, known, ui };
}
