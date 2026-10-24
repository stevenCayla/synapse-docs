import type { Sheet } from './content';

export const fr: Sheet = {
  title: "Lancer l'étude",
  sub: 'Relire le récapitulatif, lancer, puis vérifier ce qui a été créé.',
  time: '4 min',
  before: {
    title: 'Avant de lancer',
    text: "Le panneau Complétude doit afficher 0 bloquant : le bouton « Lancer l'étude » est alors actif. « Modifier » ramène à l'étape concernée.",
  },
  steps: [
    {
      title: '12. Récapitulatif',
      items: [
        'Relisez chaque bloc ; « Modifier » ramène à l’étape concernée.',
        'La fiche d’étude (PDF) résume l’ensemble.',
        "« Lancer l'étude » ouvre l'étude sur sa page Configuration.",
      ],
    },
    {
      title: 'Après le lancement',
      items: [
        'L’étude démarre au statut Configuration.',
        'Patients : les patients importés sont présents et rattachés à leur site (quelques secondes de traitement).',
        'Membres : l’investigateur coordinateur et les investigateurs de site sont membres.',
      ],
    },
    {
      title: 'Vérifier',
      items: [
        'eCRF : les formulaires créés s’ouvrent dans le concepteur.',
        'Activité : la création et l’import sont journalisés.',
      ],
    },
    {
      title: 'Passage en production',
      items: [
        'La checklist Configuration guide les dernières étapes.',
        'Exigences par pays, puis recette (UAT).',
        'Enfin, double signature du Data Manager et du promoteur.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      '0 bloquant dans Complétude pour pouvoir lancer.',
      "L'étude démarre au statut Configuration, pas en production.",
      'Vérifiez Patients, Membres, eCRF et Activité après le lancement.',
    ],
  },
  guide: '/guides/lancer/',
};

export const en: Sheet = {
  title: 'Launch the study',
  sub: 'Review the summary, launch, then check what was created.',
  time: '4 min',
  before: {
    title: 'Before launching',
    text: 'The Completeness panel must show 0 blockers: the “Launch the study” button is then active. “Edit” takes you back to the relevant step.',
  },
  steps: [
    {
      title: '12. Summary',
      items: [
        'Review each block; “Edit” takes you back to the relevant step.',
        'The study sheet (PDF) summarizes everything.',
        '“Launch the study” opens the study on its Configuration page.',
      ],
    },
    {
      title: 'After launch',
      items: [
        'The study starts with the Configuration status.',
        'Patients: the imported patients are present and linked to their site (a few seconds of processing).',
        'Members: the coordinating investigator and the site investigators are members.',
      ],
    },
    {
      title: 'Check',
      items: [
        'eCRF: the forms created open in the designer.',
        'Activity: the creation and the import are logged.',
      ],
    },
    {
      title: 'Moving to production',
      items: [
        'The Configuration checklist guides the final steps.',
        'Country requirements, then user acceptance testing (UAT).',
        'Finally, dual signature by the Data Manager and the sponsor.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      '0 blockers in Completeness to be able to launch.',
      'The study starts with the Configuration status, not in production.',
      'Check Patients, Members, eCRF and Activity after launch.',
    ],
  },
  guide: '/en/guides/lancer/',
};
