// Content of the home page (French at the root, English under /en/).
// Links starting with "/" are prefixed with the locale by Home.astro.

export type Link = { href: string; title: string; text: string; cta: string };

export interface HomeContent {
  eyebrow: { version: string; text: string; href: string };
  title: [string, string, string];
  lede: [string, string];
  chips: string[];
  actions: { start: { label: string; href: string }; local: { label: string; href: string } };
  shot: { alt: string; tag: string; href: string };
  cycle: { heading: string; sub: string; steps: { title: string; text: string }[] };
  why: { heading: string; items: { icon: string; title: string; text: string }[] };
  roles: {
    heading: string;
    sub: string;
    items: { icon: string; title: string; sub: string; links: [string, string][] }[];
  };
  path: {
    heading: string;
    progress: { start: string; run: string };
    stages: { n: string; title: string; text: string; links: Link[] }[];
  };
  reference: { heading: string; items: { title: string; text: string; href: string }[] };
  contribute: { title: string; text: string; guide: string; discord: string };
}

const fr: HomeContent = {
  eyebrow: { version: '', text: 'Journal des modifications →', href: '/changelog/' },
  title: ['La documentation de ', 'Synapse', ', la solution EDC de bout en bout.'],
  lede: [
    'Données cliniques. Précision scientifique.',
    ' Concevoir, lancer, conduire et clôturer vos études cliniques : eCRF, randomisation, monitoring, data management, import et exports CDISC, sur une seule plateforme conforme.',
  ],
  chips: ['eCRF', 'Randomisation', 'Monitoring RBQM', 'Requêtes', 'Import Excel', 'Export CDISC ODM', 'e-signature'],
  actions: {
    start: { label: 'Prendre en main Synapse', href: '/guides/premiers-pas/' },
    local: { label: 'Installer en local', href: '/backend/getting-started/' },
  },
  shot: {
    alt: "Récapitulatif de l'assistant de création d'étude",
    tag: 'Assistant « Nouvelle étude » · Récapitulatif',
    href: '/guides/creer-etude/',
  },
  cycle: {
    heading: "Une plateforme, tout le cycle de l'étude",
    sub: 'Chaque module est documenté',
    steps: [
      { title: 'Concevoir', text: "Assistant d'étude, cadre réglementaire, concepteur eCRF, calendrier des visites" },
      { title: 'Lancer', text: 'Recette, double e-signature, passage en production, invitations' },
      { title: 'Collecter', text: 'Saisie eCRF, randomisation, import de données, formulaires log (EI, traitements)' },
      { title: 'Surveiller', text: 'Monitoring RBQM, SDV, requêtes, tableaux de bord' },
      { title: 'Clôturer', text: 'Gel et verrouillage, exports CDISC ODM, archivage' },
    ],
  },
  why: {
    heading: 'Pourquoi Synapse ?',
    items: [
      { icon: 'shield', title: 'Conforme par conception', text: 'Audit trail, e-signature 21 CFR Part 11, hébergement HDS et RGPD intégrés à chaque écran.' },
      { icon: 'layers', title: 'Réglementaire déduit', text: 'Quatre questions suffisent : Synapse en déduit la catégorie (RIPH, CTR, MDR) et les exigences par pays.' },
      { icon: 'file', title: 'Import maîtrisé', text: 'Vos fichiers Excel deviennent un eCRF : rapprochement des colonnes, contrôles, puis import signé.' },
      { icon: 'code', title: 'Ouvert et bilingue', text: 'Code source ouvert, interface et documentation en français et en anglais.' },
    ],
  },
  roles: {
    heading: 'Je suis…',
    sub: 'Les guides utiles à votre rôle',
    items: [
      { icon: 'edit', title: 'Investigateur', sub: 'Inclure, saisir, signer', links: [['/guides/premiers-pas/', 'Premiers pas'], ['/guides/saisir-ecrf/', 'Saisir des données'], ['/guides/requetes-monitoring/', 'Répondre aux requêtes'], ['/guides/randomisation/', 'Randomiser un patient']] },
      { icon: 'check', title: 'ARC moniteur', sub: 'Vérifier et questionner', links: [['/guides/premiers-pas/', 'Premiers pas'], ['/guides/requetes-monitoring/', 'Requêtes et monitoring'], ['/guides/saisir-ecrf/', 'Saisie côté site'], ['/resources/glossary/', 'Glossaire']] },
      { icon: 'layers', title: 'Data manager', sub: 'Concevoir et clôturer', links: [['/guides/creer-etude/', 'Créer une étude'], ['/guides/importer/', 'Importer des données'], ['/guides/gel-verrouillage/', 'Gel et verrouillage'], ['/guides/exports/', 'Exporter les données']] },
      { icon: 'shield', title: 'Promoteur', sub: 'Piloter et garantir la conformité', links: [['/guides/lancer/', "Lancer l'étude"], ['/resources/compliance-faq/', 'FAQ conformité'], ['/guides/gel-verrouillage/', 'Verrouiller la base'], ['/recette/kit/', 'Kit de recette']] },
    ],
  },
  path: {
    heading: 'Votre parcours',
    progress: { start: 'Prise en main', run: 'Conduire' },
    stages: [
      { n: '01', title: 'Commencer', text: 'Se connecter et créer sa première étude.', links: [
        { href: '/guides/premiers-pas/', title: 'Premiers pas', text: 'Compte, double authentification, enregistrement automatique et complétude.', cta: 'Premiers pas →' },
        { href: '/guides/creer-etude/', title: 'Créer une étude', text: 'Type, informations et cadre réglementaire : les trois premières étapes.', cta: 'Créer une étude →' },
        { href: '/guides/lancer/', title: "Lancer l'étude", text: 'Relire le récapitulatif, lancer, puis vérifier ce qui a été créé.', cta: 'Lancer →' },
      ] },
      { n: '02', title: 'Configurer', text: "Décrire l'essai, ses formulaires et son équipe.", links: [
        { href: '/guides/design-population-sites/', title: 'Design, population, sites', text: "Structure de l'essai, éligibilité et établissements participants.", cta: 'Configurer le design →' },
        { href: '/guides/reglementaire-ecrf-equipe/', title: 'Réglementaire, eCRF, équipe', text: 'Exigences par pays, formulaires, calendrier des visites, membres.', cta: "Configurer l'eCRF →" },
        { href: '/guides/importer/', title: 'Importer des données', text: 'Excel ou CSV : colonnes, contrôles, validation signée.', cta: 'Importer →' },
      ] },
      { n: '03', title: 'Conduire', text: 'Collecter, surveiller, clôturer.', links: [
        { href: '/guides/saisir-ecrf/', title: 'Saisir des données', text: 'Inclure un patient, ouvrir ses visites, remplir et signer les formulaires.', cta: 'Saisir →' },
        { href: '/guides/requetes-monitoring/', title: 'Requêtes et monitoring', text: 'Questionner une donnée, y répondre, vérifier les données source.', cta: 'Monitorer →' },
        { href: '/guides/randomisation/', title: 'Randomisation', text: "Attribuer un bras, gérer l'aveugle et sa levée d'urgence.", cta: 'Randomiser →' },
        { href: '/guides/gel-verrouillage/', title: 'Gel, verrouillage, exports', text: 'Figer les données, verrouiller la base, exporter en CDISC ODM.', cta: 'Clôturer →' },
      ] },
      { n: '04', title: 'Valider', text: 'Recetter avant la mise en production.', links: [
        { href: '/recette/creation-etude/', title: "REC-01 · Création d'étude", text: 'Scénarios de recette liés aux exigences, à exécuter à chaque release.', cta: 'Cahier REC-01 →' },
        { href: '/audit/checklist/', title: 'Conformité & audits', text: 'HDS, CNIL, ANSSI, 21 CFR Part 11 et registre RGPD.', cta: 'Conformité →' },
      ] },
      { n: '05', title: 'Développer & exploiter', text: 'Pour les équipes techniques.', links: [
        { href: '/backend/getting-started/', title: 'Guide de démarrage', text: 'Installer Synapse en local avec Docker et charger les données de démo.', cta: 'Installer en local →' },
        { href: '/architecture/overview/', title: 'Architecture', text: "Vue d'ensemble technique, modèle de données, décisions (ADR).", cta: 'Architecture →' },
        { href: '/deployment/production/', title: 'Déploiement', text: 'Production, Debian + Docker, sauvegardes, processus de release.', cta: 'Déployer →' },
        { href: '/security/best-practices/', title: 'Sécurité', text: 'Règles de codage sécurisé et modèle de permissions.', cta: 'Sécurité →' },
      ] },
    ],
  },
  reference: {
    heading: 'Référence',
    items: [
      { title: 'API', text: 'Endpoints, Swagger, conventions OpenAPI', href: '/api/readme/' },
      { title: 'Glossaire', text: 'RIPH, SDV, RBQM, CPP… définis', href: '/resources/glossary/' },
      { title: 'FAQ conformité', text: '21 CFR Part 11, HDS, RGPD, validation', href: '/resources/compliance-faq/' },
      { title: 'Journal des modifications', text: 'Toutes les versions de Synapse', href: '/changelog/' },
    ],
  },
  contribute: {
    title: 'Contribuer à Synapse',
    text: 'Workflow Git, conventions et mise en place. Les échanges se font sur Discord.',
    guide: 'Guide de contribution',
    discord: 'Discord',
  },
};

const en: HomeContent = {
  eyebrow: { version: '', text: 'Changelog →', href: '/changelog/' },
  title: ['The documentation of ', 'Synapse', ', the end-to-end EDC solution.'],
  lede: [
    'Clinical data. Scientific precision.',
    ' Design, launch, run and close your clinical studies: eCRF, randomization, monitoring, data management, import and CDISC exports, on one compliant platform.',
  ],
  chips: ['eCRF', 'Randomization', 'RBQM monitoring', 'Queries', 'Excel import', 'CDISC ODM export', 'e-signature'],
  actions: {
    start: { label: 'Get started with Synapse', href: '/guides/premiers-pas/' },
    local: { label: 'Install locally', href: '/backend/getting-started/' },
  },
  shot: {
    alt: 'Summary step of the new study wizard',
    tag: '"New study" wizard · Summary',
    href: '/guides/creer-etude/',
  },
  cycle: {
    heading: 'One platform, the whole study cycle',
    sub: 'Every module is documented',
    steps: [
      { title: 'Design', text: 'Study wizard, regulatory framework, eCRF designer, visit schedule' },
      { title: 'Launch', text: 'Acceptance tests, double e-signature, go-live, invitations' },
      { title: 'Collect', text: 'eCRF entry, randomization, data import, log forms (AEs, treatments)' },
      { title: 'Monitor', text: 'RBQM monitoring, SDV, queries, dashboards' },
      { title: 'Close', text: 'Freeze and lock, CDISC ODM exports, archiving' },
    ],
  },
  why: {
    heading: 'Why Synapse?',
    items: [
      { icon: 'shield', title: 'Compliant by design', text: 'Audit trail, 21 CFR Part 11 e-signature, HDS hosting and GDPR built into every screen.' },
      { icon: 'layers', title: 'Regulatory framework deduced', text: 'Four questions are enough: Synapse deduces the category (RIPH, CTR, MDR) and the requirements per country.' },
      { icon: 'file', title: 'Controlled import', text: 'Your Excel files become an eCRF: column matching, checks, then a signed import.' },
      { icon: 'code', title: 'Open and bilingual', text: 'Open source code, interface and documentation in French and English.' },
    ],
  },
  roles: {
    heading: 'I am…',
    sub: 'The guides for your role',
    items: [
      { icon: 'edit', title: 'Investigator', sub: 'Enroll, enter, sign', links: [['/guides/premiers-pas/', 'First steps'], ['/guides/saisir-ecrf/', 'Enter data'], ['/guides/requetes-monitoring/', 'Answer queries'], ['/guides/randomisation/', 'Randomize a patient']] },
      { icon: 'check', title: 'Monitor (CRA)', sub: 'Verify and query', links: [['/guides/premiers-pas/', 'First steps'], ['/guides/requetes-monitoring/', 'Queries and monitoring'], ['/guides/saisir-ecrf/', 'Site-side entry'], ['/resources/glossary/', 'Glossary']] },
      { icon: 'layers', title: 'Data manager', sub: 'Design and close', links: [['/guides/creer-etude/', 'Create a study'], ['/guides/importer/', 'Import data'], ['/guides/gel-verrouillage/', 'Freeze and lock'], ['/guides/exports/', 'Export data']] },
      { icon: 'shield', title: 'Sponsor', sub: 'Steer and guarantee compliance', links: [['/guides/lancer/', 'Launch the study'], ['/resources/compliance-faq/', 'Compliance FAQ'], ['/guides/gel-verrouillage/', 'Lock the database'], ['/recette/kit/', 'Acceptance test kit']] },
    ],
  },
  path: {
    heading: 'Your path',
    progress: { start: 'Getting started', run: 'Run' },
    stages: [
      { n: '01', title: 'Start', text: 'Sign in and create your first study.', links: [
        { href: '/guides/premiers-pas/', title: 'First steps', text: 'Account, two-factor authentication, autosave and completeness.', cta: 'First steps →' },
        { href: '/guides/creer-etude/', title: 'Create a study', text: 'Type, information and regulatory framework: the first three steps.', cta: 'Create a study →' },
        { href: '/guides/lancer/', title: 'Launch the study', text: 'Review the summary, launch, then check what was created.', cta: 'Launch →' },
      ] },
      { n: '02', title: 'Configure', text: 'Describe the trial, its forms and its team.', links: [
        { href: '/guides/design-population-sites/', title: 'Design, population, sites', text: 'Trial structure, eligibility and participating sites.', cta: 'Configure the design →' },
        { href: '/guides/reglementaire-ecrf-equipe/', title: 'Regulatory, eCRF, team', text: 'Requirements per country, forms, visit schedule, members.', cta: 'Configure the eCRF →' },
        { href: '/guides/importer/', title: 'Import data', text: 'Excel or CSV: columns, checks, signed validation.', cta: 'Import →' },
      ] },
      { n: '03', title: 'Run', text: 'Collect, monitor, close.', links: [
        { href: '/guides/saisir-ecrf/', title: 'Enter data', text: "Enroll a patient, open their visits, fill in and sign forms.", cta: 'Enter →' },
        { href: '/guides/requetes-monitoring/', title: 'Queries and monitoring', text: 'Question a value, answer, verify source data.', cta: 'Monitor →' },
        { href: '/guides/randomisation/', title: 'Randomization', text: 'Assign an arm, manage blinding and emergency unblinding.', cta: 'Randomize →' },
        { href: '/guides/gel-verrouillage/', title: 'Freeze, lock, exports', text: 'Freeze the data, lock the database, export to CDISC ODM.', cta: 'Close →' },
      ] },
      { n: '04', title: 'Validate', text: 'Run acceptance tests before go-live.', links: [
        { href: '/recette/creation-etude/', title: 'REC-01 · Study creation', text: 'Test scenarios linked to the requirements, to run at every release.', cta: 'REC-01 book →' },
        { href: '/audit/checklist/', title: 'Compliance & audits', text: 'HDS, CNIL, ANSSI, 21 CFR Part 11 and GDPR register.', cta: 'Compliance →' },
      ] },
      { n: '05', title: 'Develop & operate', text: 'For technical teams.', links: [
        { href: '/backend/getting-started/', title: 'Getting started', text: 'Install Synapse locally with Docker and load the demo data.', cta: 'Install locally →' },
        { href: '/architecture/overview/', title: 'Architecture', text: 'Technical overview, data model, decisions (ADR).', cta: 'Architecture →' },
        { href: '/deployment/production/', title: 'Deployment', text: 'Production, Debian + Docker, backups, release process.', cta: 'Deploy →' },
        { href: '/security/best-practices/', title: 'Security', text: 'Secure coding rules and permission model.', cta: 'Security →' },
      ] },
    ],
  },
  reference: {
    heading: 'Reference',
    items: [
      { title: 'API', text: 'Endpoints, Swagger, OpenAPI conventions', href: '/api/readme/' },
      { title: 'Glossary', text: 'RIPH, SDV, RBQM, CPP… defined', href: '/resources/glossary/' },
      { title: 'Compliance FAQ', text: '21 CFR Part 11, HDS, GDPR, validation', href: '/resources/compliance-faq/' },
      { title: 'Changelog', text: 'Every Synapse version', href: '/changelog/' },
    ],
  },
  contribute: {
    title: 'Contribute to Synapse',
    text: 'Git workflow, conventions and setup. Discussions happen on Discord.',
    guide: 'Contribution guide',
    discord: 'Discord',
  },
};

export const homeContent = { fr, en };
