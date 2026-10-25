---
title: Importer des données
description: Reprendre un fichier Excel ou CSV, avec rapprochement des colonnes, contrôles puis validation signée.
time: "12 min"
introduced: "3.2.0"
sheet: true
---

L'étape Import est **facultative** : vous pouvez aussi importer plus tard depuis **Patients › Importer**. Elle se déroule en quatre temps.

:::note[Préparer le fichier]
Une ligne par patient, l'en-tête en ligne 1, des dates au format date. Colorez les en-têtes : Synapse crée **une section eCRF par couleur**. Une ligne de légende du type `0: non 1: oui` devient les options des listes.
:::

## 11.1 Fichier

Déposez le fichier par glisser-déposer, puis vérifiez la lecture.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Empreinte SHA-256** | affichée | Prouve plus tard quel fichier a été importé. |
| **Feuille, ligne d'en-tête** | par défaut | À changer seulement si le classeur a plusieurs feuilles ou un titre au-dessus de l'en-tête. |
| **Format des dates** | `Automatique` | Pour des dates saisies en texte : JJ/MM/AAAA ou MM/JJ/AAAA. |
| **Données identifiantes** \* | `Ne pas importer` | **Ne pas importer** (recommandé), **Pseudonymiser**, ou **Conserver** chiffré, seulement si la base réglementaire l'autorise. |

<!-- Capture à fournir : la politique des données identifiantes et l'aperçu masqué. -->

## 11.2 Colonnes

Rapprochez chaque colonne d'un champ de l'étude, ou créez les champs manquants.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Identifiant patient** \* | `id → Identifiant patient` | Rapproché automatiquement quand le nom est reconnu. |
| **Colonnes identifiantes** | — | Pas de champ eCRF : elles suivent la politique choisie à l'étape Fichier. |
| **Définir comme champs** | `Nouveau formulaire…` | Crée un formulaire et ses champs : libellé, type, unité et section pour chaque colonne. |

<!-- Captures à fournir : le rapprochement groupé par couleur d'en-tête ; le panneau « Définir ces colonnes comme champs » ; chaque colonne rapprochée de son nouveau champ. -->

:::tip[Libellés lisibles]
Les libellés reprennent le nom brut de la colonne. Renommez-les ici (« Date du diagnostic ») ou plus tard dans le concepteur.
:::

## 11.3 Contrôles

Les valeurs du fichier sont confrontées aux champs : erreurs bloquantes et avertissements.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Corriger** | — | Remplace une valeur ; la valeur d'origine reste dans l'audit trail. |
| **Accepter et créer une requête** | — | Garde la valeur et ouvre une question au site, créée à l'application de l'import. |
| **Exclure les lignes** | — | Retire les patients concernés de l'import. |

<!-- Capture à fournir : des avertissements « hors plage » et des lignes à vérifier. -->

## 11.4 Confirmation et signature

Relisez le résumé, puis signez l'import.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Certification** \* | cocher | Vous attestez que les données et le rapprochement sont justes. |
| **Signification** \* | `Conformité aux documents source` | Le sens juridique de la signature, enregistré avec elle (21 CFR Part 11). |
| **Mot de passe** \* | votre mot de passe | Ré-authentification exigée pour toute signature électronique. |

<!-- Capture à fournir : le résumé de l'import et le bloc de signature. -->

:::note[Quand les données sont-elles appliquées ?]
La session d'import signée est enregistrée maintenant ; les patients sont créés au lancement de l'étude.
:::

