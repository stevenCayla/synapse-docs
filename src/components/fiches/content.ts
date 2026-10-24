// Printable sheets (A4): a one-page summary of a guide. The guide stays the
// reference; a sheet only repeats its key points (see Sheet.astro).

export interface Sheet {
  title: string;
  sub: string;
  time: string;
  before: { title: string; text: string };
  steps: { title: string; items: string[] }[];
  keep: { title: string; items: string[] };
  guide: string; // path of the full guide
}

export interface SheetText {
  kicker: string;
  reviewed: string;
  fullGuide: string;
  print: string;
  back: string;
  stepWord: string;
}

export const ui: Record<'fr' | 'en', SheetText> = {
  fr: {
    kicker: 'Fiche pratique',
    reviewed: 'Relue pour',
    fullGuide: 'Guide complet',
    print: 'Imprimer / Enregistrer en PDF',
    back: '← Revenir au guide',
    stepWord: 'Étape',
  },
  en: {
    kicker: 'Quick reference',
    reviewed: 'Reviewed for',
    fullGuide: 'Full guide',
    print: 'Print / Save as PDF',
    back: '← Back to the guide',
    stepWord: 'Step',
  },
};

export const sheets: Record<string, Record<'fr' | 'en', Sheet>> = {
  importer: {
    fr: {
      title: 'Importer des données',
      sub: 'Reprendre un fichier Excel ou CSV : rapprochement des colonnes, contrôles, validation signée.',
      time: '12 min',
      before: {
        title: 'Préparer le fichier',
        text: "Une ligne par patient, l'en-tête en ligne 1, des dates au format date. Colorez les en-têtes : Synapse crée une section eCRF par couleur. Une ligne de légende du type « 0: non 1: oui » devient les options des listes.",
      },
      steps: [
        {
          title: 'Fichier',
          items: [
            'Déposez le fichier par glisser-déposer et vérifiez la lecture.',
            "L'empreinte SHA-256 prouve plus tard quel fichier a été importé.",
            "Feuille et ligne d'en-tête : à changer seulement si le classeur a plusieurs feuilles ou un titre au-dessus.",
            'Données identifiantes : Ne pas importer (recommandé), Pseudonymiser, ou Conserver chiffré si la base réglementaire l’autorise.',
          ],
        },
        {
          title: 'Colonnes',
          items: [
            "Rapprochez chaque colonne d'un champ de l'étude, ou créez les champs manquants.",
            "L'identifiant patient est rapproché automatiquement quand le nom est reconnu.",
            'Les colonnes identifiantes n’ont pas de champ eCRF : elles suivent la politique choisie.',
            'Définir comme champs : crée un formulaire et ses champs (libellé, type, unité, section).',
          ],
        },
        {
          title: 'Contrôles',
          items: [
            'Les valeurs sont confrontées aux champs : erreurs bloquantes et avertissements.',
            "Corriger : remplace une valeur, l'originale reste dans l'audit trail.",
            'Accepter et créer une requête : garde la valeur et ouvre une question au site.',
            'Exclure les lignes : retire les patients concernés de l’import.',
          ],
        },
        {
          title: 'Confirmation et signature',
          items: [
            'Relisez le résumé de l’import.',
            'Certification : vous attestez que les données et le rapprochement sont justes.',
            'Signification : le sens juridique de la signature, enregistré avec elle (21 CFR Part 11).',
            'Mot de passe : ré-authentification exigée pour toute signature électronique.',
          ],
        },
      ],
      keep: {
        title: 'À retenir',
        items: [
          "L'étape Import est facultative : importez plus tard depuis Patients › Importer.",
          'Une session signée est enregistrée tout de suite ; les patients sont créés au lancement de l’étude.',
          'Aucune valeur modifiée ne disparaît : l’audit trail garde la valeur d’origine.',
        ],
      },
      guide: '/guides/importer/',
    },
    en: {
      title: 'Import data',
      sub: 'Bring in an Excel or CSV file: column mapping, checks, signed confirmation.',
      time: '12 min',
      before: {
        title: 'Prepare the file',
        text: 'One row per patient, the header in row 1, dates formatted as dates. Color the headers: Synapse creates one eCRF section per color. A legend row such as “0: no 1: yes” becomes the options of the lists.',
      },
      steps: [
        {
          title: 'File',
          items: [
            'Drop the file and check how it was read.',
            'The SHA-256 fingerprint proves later which file was imported.',
            'Sheet and header row: change only if the workbook has several sheets or a title above the header.',
            'Identifying data: Do not import (recommended), Pseudonymize, or Keep encrypted if the regulatory database allows it.',
          ],
        },
        {
          title: 'Columns',
          items: [
            'Map each column to a study field, or create the missing fields.',
            'The patient identifier is mapped automatically when the name is recognized.',
            'Identifying columns have no eCRF field: they follow the chosen policy.',
            'Define as fields: creates a form and its fields (label, type, unit, section).',
          ],
        },
        {
          title: 'Checks',
          items: [
            'Values are checked against the fields: blocking errors and warnings.',
            'Correct: replaces a value, the original stays in the audit trail.',
            'Accept and create a query: keeps the value and opens a question to the site.',
            'Exclude rows: removes the affected patients from the import.',
          ],
        },
        {
          title: 'Confirmation and signature',
          items: [
            'Review the import summary.',
            'Certification: you attest that the data and the mapping are correct.',
            'Meaning: the legal meaning of the signature, recorded with it (21 CFR Part 11).',
            'Password: re-authentication required for any electronic signature.',
          ],
        },
      ],
      keep: {
        title: 'Keep in mind',
        items: [
          'The Import step is optional: import later from Patients › Import.',
          'A signed session is saved at once; patients are created when the study is launched.',
          'No changed value disappears: the audit trail keeps the original value.',
        ],
      },
      guide: '/en/guides/importer/',
    },
  },
};
