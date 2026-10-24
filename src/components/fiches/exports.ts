import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Exporter les données',
  sub: "Extraire les données pour l'analyse statistique ou la soumission réglementaire.",
  time: '4 min',
  before: {
    title: 'Choisir le bon format',
    text: 'Excel / CSV pour l’analyse. CDISC ODM pour l’échange et l’archivage, avec le mapping SDTM défini dans le concepteur.',
  },
  steps: [
    {
      title: 'Choisir le format',
      items: [
        'Étude → Exports → Nouvel export.',
        'Format : Excel / CSV ou CDISC ODM.',
        'Périmètre : sites, formulaires, période.',
      ],
    },
    {
      title: 'Régler les options',
      items: [
        'Données identifiantes : exclues par défaut ; pseudonymisées sur demande.',
        'Audit trail : joint l’historique complet des modifications.',
      ],
    },
    {
      title: 'Télécharger',
      items: [
        'L’export est préparé en arrière-plan.',
        'Une notification signale qu’il est prêt.',
        'Chaque export a une empreinte SHA-256 et apparaît dans le journal d’activité.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      'Les données identifiantes sont exclues par défaut.',
      'Après verrouillage, les exports portent sur l’instantané figé.',
      'Deux exports successifs d’une base verrouillée sont identiques.',
    ],
  },
  guide: '/guides/exports/',
};

export const en: Sheet = {
  title: 'Export data',
  sub: 'Extract the data for statistical analysis or regulatory submission.',
  time: '4 min',
  before: {
    title: 'Choose the right format',
    text: 'Excel / CSV for analysis. CDISC ODM for exchange and archiving, with the SDTM mapping defined in the designer.',
  },
  steps: [
    {
      title: 'Choose the format',
      items: [
        'Study → Exports → New export.',
        'Format: Excel / CSV or CDISC ODM.',
        'Scope: sites, forms, period.',
      ],
    },
    {
      title: 'Set the options',
      items: [
        'Identifying data: excluded by default; pseudonymized on request.',
        'Audit trail: attaches the full history of changes.',
      ],
    },
    {
      title: 'Download',
      items: [
        'The export is prepared in the background.',
        'A notification signals that it is ready.',
        'Each export has a SHA-256 fingerprint and appears in the activity log.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'Identifying data is excluded by default.',
      'After lock, exports are based on the frozen snapshot.',
      'Two successive exports of a locked database are identical.',
    ],
  },
  guide: '/en/guides/exports/',
};
