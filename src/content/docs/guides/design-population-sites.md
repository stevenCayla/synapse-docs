---
title: Design, population et sites
description: Décrire l'essai, qui peut être inclus, et dans quels établissements.
time: "8 min"
introduced: "3.2.0"
sheet: true
---

## 4. Design

La structure de l'essai.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Phase** \* | `Phase III` | Le stade de développement. Pour un dispositif, choisissez la phase la plus proche. |
| **Design de l'essai** \* | `Bras unique` | Un seul groupe, sans comparateur ni tirage au sort. Les designs randomisés activent la randomisation. |
| **Randomisation** | `1:1` | Le ratio d'attribution entre bras. Sans objet pour un bras unique. |
| **Aveugle** \* | `Ouvert` | Qui connaît le traitement reçu : simple ou double aveugle. |
| **Type de contrôle** \* | `Aucun` | Placebo, comparateur actif, soins standard ou aucun. |
| **Inclusion / Suivi** | `12 et 12 mois` | Durée du recrutement, puis du suivi de chaque patient. |
| **Durée totale** \* | `24 mois` | Calculée automatiquement (inclusion + suivi), modifiable. |

## 5. Population

Qui peut être inclus, et combien.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Effectif cible** \* | `50` | Nombre de patients à inclure ; sert de référence aux objectifs par site. |
| **Statut de performance** | `Indifférent` | État général minimal exigé : ECOG ou indice de Karnofsky. |
| **Âge minimum / maximum** | `18 et 99 ans` | L'âge maximum doit être supérieur à l'âge minimum. |
| **Sexe** | `Tous` | |
| **Critères d'inclusion / d'exclusion** | `Patient majeur ↵` | Tapez un critère puis Entrée : il devient une étiquette ; la croix l'enlève. |

## 6. Sites

Les pays de l'étude, puis les établissements participants.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Pays** \* | `France` | Détermine les exigences réglementaires appliquées (France, UE…). |
| **Site** | `Hôpital Lariboisière` | Choisi dans le référentiel de l'organisation, ou créé avec « Créer un nouveau site ». Optionnel à ce stade. |
| **Investigateur principal** | `Dr A. Payet` | Le médecin responsable sur ce site. Il voit uniquement les patients de son site. |
| **Objectif** | `50` | Patients attendus sur ce site. La somme est comparée à l'effectif cible. |
| **Activation prévue** | `01/12/2026` | Date d'ouverture du site aux inclusions. |

:::tip[Ajouter des sites plus tard]
Les sites sont optionnels : vous pourrez en ajouter depuis la page Configuration de l'étude.
:::

