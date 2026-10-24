---
title: Réglementaire, eCRF, calendrier et équipe
description: Les exigences par pays, les formulaires de saisie, les visites et les personnes impliquées.
time: "10 min"
introduced: "3.2.0"
---

## 7. Réglementaire

Les exigences déduites du cadre et des pays, regroupées par pack : socle international, Union européenne, France.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Formulaire de consentement** | Téléverser un PDF | Le document signé par le patient. Son dépôt autorise la conservation des données identifiantes à l'import. |
| **ID-RCB** | `2026-A01234-56` | Numéro d'enregistrement ANSM. Un format incorrect est signalé. |
| **Avis du CPP** | `En attente` | Avis du comité de protection des personnes, obligatoire avant la première inclusion. |
| **Autres exigences** | — | Laissées vides, elles deviennent des points « avant production » et ne bloquent pas la création. |

![La matrice par pays et les exigences de chaque pack.](../../../assets/guides/07-reglementaire.webp)

## 8. eCRF

Les formulaires de saisie (cahier d'observation électronique).

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Modèle d'eCRF** | `Partir de zéro` | Ou un modèle de la bibliothèque. Le modèle d'origine n'est jamais modifié. |
| **Formulaires propres à l'étude** | `Bilan initial ↵` | Crée des formulaires vides, à construire après la création. |

:::note[Vous importez un fichier ?]
Choisissez « Partir de zéro » : les champs seront créés à l'étape Import à partir des colonnes du fichier.
:::

## 9. Calendrier

Les visites de l'étude et les formulaires remplis à chacune. J0 = jour d'inclusion.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Modèle de calendrier** | `Interventionnel` | Préremplit des visites types ; « Vierge » pour partir de zéro. |
| **Visite** | `V1 · Inclusion · J0` | Code unique, nom et jour par rapport à l'inclusion, avec une fenêtre de tolérance. |
| **Matrice visites × formulaires** | — | Cochez les formulaires à remplir à chaque visite. Une visite sans formulaire est bloquante. |

<!-- Capture à fournir : deux visites avec le même code (l'erreur est signalée). -->

## 10. Équipe

Les responsables, la stratégie de monitoring et les membres.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Investigateur coordinateur** \* | `Dr A. Payet` | Coordonne l'étude sur tous les sites ; gestionnaire de toute l'étude au lancement. |
| **Responsable promoteur** \* | `M. Durand` | Contact chez le promoteur ; pas forcément un utilisateur de Synapse. |
| **Stratégie de monitoring** \* | `Basée sur le risque (RBQM)` | SDV à 100 %, ciblée selon le risque, ou surveillance centralisée. |
| **Membres et droits** | — | Les investigateurs sont inclus d'office. « GCP manquant » signale un certificat BPC absent : simple avertissement. |

:::note[Invitations]
Les e-mails d'invitation ne partent qu'au lancement de l'étude, jamais avant.
:::

