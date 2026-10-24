import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Gel et verrouillage',
  sub: "Figer les données d'un patient, puis verrouiller la base pour l'analyse.",
  time: '5 min',
  before: {
    title: 'Deux niveaux',
    text: 'Le gel fige un formulaire, une visite ou un patient. Le verrouillage fige toute la base : il exige une double signature, data manager puis promoteur.',
  },
  steps: [
    {
      title: 'Geler',
      items: [
        'Par formulaire, visite ou patient : Actions → Geler.',
        'La saisie est bloquée ; les requêtes restent possibles.',
        'Un cadenas ouvert s’affiche sur les éléments gelés.',
        'Dégeler exige un motif.',
      ],
    },
    {
      title: 'Vérifier les prérequis',
      items: [
        'Étude → Clôture affiche la liste de contrôle.',
        'Requêtes ouvertes : toutes doivent être closes.',
        'SDV : selon la stratégie de monitoring.',
        'Signatures PI : chaque patient doit être signé par son investigateur.',
      ],
    },
    {
      title: 'Verrouiller la base',
      items: [
        'Double signature : data manager puis promoteur.',
        'L’étude passe au statut « Verrouillée » ; plus aucune modification possible.',
        'Un instantané horodaté est créé pour les exports.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      'Verrouiller exige zéro requête ouverte, la SDV et les signatures PI.',
      'Le verrouillage est signé deux fois : data manager puis promoteur.',
      'Déverrouillage exceptionnel : administrateur, motif et double signature, tracé dans l’audit trail.',
    ],
  },
  guide: '/guides/gel-verrouillage/',
};

export const en: Sheet = {
  title: 'Freeze and lock',
  sub: "Freeze a patient's data, then lock the database for analysis.",
  time: '5 min',
  before: {
    title: 'Two levels',
    text: 'Freezing locks a form, a visit or a patient. Locking freezes the whole database: it requires a dual signature, Data Manager then sponsor.',
  },
  steps: [
    {
      title: 'Freeze',
      items: [
        'Per form, visit or patient: Actions → Freeze.',
        'Data entry is blocked; queries remain possible.',
        'An open padlock is displayed on frozen items.',
        'Unfreezing requires a reason.',
      ],
    },
    {
      title: 'Check the prerequisites',
      items: [
        'Study → Close-out displays the checklist.',
        'Open queries: all queries must be closed.',
        'SDV: according to the monitoring strategy.',
        'PI signatures: each patient must be signed by their investigator.',
      ],
    },
    {
      title: 'Lock the database',
      items: [
        'Dual signature: Data Manager, then sponsor.',
        'The study moves to the “Locked” status; no further changes are possible.',
        'A timestamped snapshot is created for exports.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'Locking requires zero open queries, SDV and PI signatures.',
      'The lock is signed twice: Data Manager then sponsor.',
      'Exceptional unlock: administrator, with a reason and dual signature, tracked in the audit trail.',
    ],
  },
  guide: '/en/guides/gel-verrouillage/',
};
