import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Réglementaire, eCRF, calendrier et équipe',
  sub: 'Les exigences par pays, les formulaires de saisie, les visites et les personnes impliquées.',
  time: '10 min',
  before: {
    title: 'Vous importez un fichier ?',
    text: "Choisissez « Partir de zéro » pour le modèle d'eCRF : les champs seront créés à l'étape Import à partir des colonnes du fichier.",
  },
  steps: [
    {
      title: '7. Réglementaire',
      items: [
        'Formulaire de consentement : son dépôt autorise la conservation des données identifiantes à l’import.',
        'ID-RCB (ex. 2026-A01234-56) : un format incorrect est signalé.',
        'Avis du CPP : obligatoire avant la première inclusion.',
        'Autres exigences laissées vides : points « avant production », sans blocage.',
      ],
    },
    {
      title: '8. eCRF',
      items: [
        "Modèle d'eCRF : « Partir de zéro » ou un modèle de la bibliothèque.",
        "Le modèle d'origine n'est jamais modifié.",
        'Formulaires propres à l’étude : crée des formulaires vides, à construire après la création.',
      ],
    },
    {
      title: '9. Calendrier',
      items: [
        "J0 = jour d'inclusion.",
        'Modèle de calendrier : préremplit des visites types ; « Vierge » pour partir de zéro.',
        "Visite : code unique, nom et jour par rapport à l'inclusion, avec une fenêtre de tolérance.",
        'Matrice visites × formulaires : une visite sans formulaire est bloquante.',
      ],
    },
    {
      title: '10. Équipe',
      items: [
        'Investigateur coordinateur et responsable promoteur : champs obligatoires.',
        'Stratégie de monitoring : SDV à 100 %, ciblée selon le risque, ou surveillance centralisée.',
        'Les investigateurs sont inclus d’office dans les membres.',
        '« GCP manquant » signale un certificat BPC absent : simple avertissement.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      "L'avis du CPP est obligatoire avant la première inclusion.",
      'Une visite sans formulaire est bloquante.',
      'Les e-mails d’invitation ne partent qu’au lancement de l’étude, jamais avant.',
    ],
  },
  guide: '/guides/reglementaire-ecrf-equipe/',
};

export const en: Sheet = {
  title: 'Regulatory, eCRF, visit schedule and team',
  sub: 'Requirements by country, data entry forms, visits and the people involved.',
  time: '10 min',
  before: {
    title: 'Importing a file?',
    text: 'Choose “Start from scratch” for the eCRF template: the fields will be created in the Import step from the columns of the file.',
  },
  steps: [
    {
      title: '7. Regulatory',
      items: [
        'Consent form: uploading it allows identifying data to be kept at import.',
        'ID-RCB (e.g. 2026-A01234-56): an incorrect format is flagged.',
        'CPP opinion: mandatory before the first enrolment.',
        'Other requirements left empty: “before production” items, not blocking.',
      ],
    },
    {
      title: '8. eCRF',
      items: [
        'eCRF template: “Start from scratch” or a template from the library.',
        'The original template is never modified.',
        'Study-specific forms: creates empty forms, to be built after creation.',
      ],
    },
    {
      title: '9. Visit schedule',
      items: [
        'D0 = enrolment day.',
        'Visit schedule template: pre-fills typical visits; “Blank” to start from scratch.',
        'Visit: unique code, name and day relative to enrolment, with a tolerance window.',
        'Visits × forms matrix: a visit without a form is blocking.',
      ],
    },
    {
      title: '10. Team',
      items: [
        'Coordinating investigator and sponsor lead: required fields.',
        'Monitoring strategy: 100% SDV, targeted according to risk, or centralised monitoring.',
        'Investigators are included by default among the members.',
        '“GCP missing” flags an absent GCP certificate: warning only.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'The CPP opinion is mandatory before the first enrolment.',
      'A visit without a form is blocking.',
      'Invitation emails are only sent when the study is launched, never before.',
    ],
  },
  guide: '/en/guides/reglementaire-ecrf-equipe/',
};
