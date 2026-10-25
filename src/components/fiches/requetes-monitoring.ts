import type { Sheet } from './content';

export const fr: Sheet = {
  title: 'Requêtes et monitoring',
  sub: 'Poser une question sur une donnée, y répondre, et vérifier les données source.',
  time: '7 min',
  before: {
    title: 'Qui peut ouvrir une requête',
    text: "L'ouverture d'une requête est réservée aux ARC moniteurs et data managers. L'investigateur la reçoit dans Mes tâches et sur le champ concerné.",
  },
  steps: [
    {
      title: 'Ouvrir une requête',
      items: [
        'Sur un champ, cliquez sur l’icône bulle → Nouvelle requête.',
        'Type : manquante, incohérente, hors bornes, autre.',
        'Question : adressée au site, visible par les investigateurs du site.',
      ],
    },
    {
      title: 'Répondre à une requête',
      items: [
        'Réponse : corrigez la donnée (avec motif) ou expliquez pourquoi elle est juste.',
        'Les avertissements acceptés lors d’un import créent une requête par ligne, traitée de la même façon.',
      ],
    },
    {
      title: 'Clore la requête',
      items: [
        'L’auteur relit la réponse et clôt, ou relance.',
        'Une requête close reste consultable dans l’historique du champ.',
        'Le compteur de requêtes ouvertes du site diminue.',
      ],
    },
    {
      title: 'Vérifier les données source (SDV)',
      items: [
        'Selon la stratégie de monitoring : 100 %, ciblée selon le risque (RBQM) ou centralisée.',
        'Champs à vérifier : en RBQM, seuls les champs critiques et les sites à risque sont proposés.',
        'Marquer comme vérifié : par champ ou par formulaire.',
      ],
    },
  ],
  keep: {
    title: 'À retenir',
    items: [
      'Seuls les ARC moniteurs et data managers ouvrent une requête.',
      'Une réponse corrigeant une donnée exige un motif.',
      'Une modification ultérieure annule la vérification SDV.',
    ],
  },
  guide: '/guides/requetes-monitoring/',
};

export const en: Sheet = {
  title: 'Queries and monitoring',
  sub: 'Ask a question about a data point, answer it, and verify source data.',
  time: '7 min',
  before: {
    title: 'Who can open a query',
    text: 'Opening a query is restricted to monitors (CRAs) and Data Managers. The investigator receives it in My tasks and on the field concerned.',
  },
  steps: [
    {
      title: 'Open a query',
      items: [
        'On a field, click the bubble icon → New query.',
        'Type: missing, inconsistent, out of range, other.',
        'Question: addressed to the site, visible to the site’s investigators.',
      ],
    },
    {
      title: 'Answer a query',
      items: [
        'Answer: correct the data (with a reason) or explain why it is correct.',
        'Warnings accepted during an import create one query per row, handled the same way.',
      ],
    },
    {
      title: 'Close the query',
      items: [
        'The author reviews the answer and closes the query, or reissues it.',
        'A closed query remains viewable in the field’s history.',
        'The site’s open query counter goes down.',
      ],
    },
    {
      title: 'Verify source data (SDV)',
      items: [
        'According to the monitoring strategy: 100%, risk-based (RBQM) or centralized.',
        'Fields to verify: with RBQM, only critical fields and at-risk sites are offered.',
        'Mark as verified: per field or per form.',
      ],
    },
  ],
  keep: {
    title: 'Keep in mind',
    items: [
      'Only monitors (CRAs) and Data Managers open a query.',
      'An answer that corrects data requires a reason.',
      'A later change cancels the SDV verification.',
    ],
  },
  guide: '/en/guides/requetes-monitoring/',
};
