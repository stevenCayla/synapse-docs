---
title: Saisir des données
description: Inclure un patient, ouvrir ses visites et remplir les formulaires eCRF.
time: "8 min"
---

Ce guide s'adresse aux **investigateurs** et aux **attachés de recherche clinique** de site. Vous ne voyez que les patients de vos sites.

## 1. Inclure un patient

**Patients** → **Inclure un patient**.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Site** \* | `Hôpital Lariboisière` | Proposé automatiquement si vous n'êtes rattaché qu'à un site. |
| **Numéro patient** \* | `LARIB-01-003` | Généré par Synapse : code du site + numéro d'ordre. Il n'est jamais réutilisé. |
| **Date de consentement** \* | `14/11/2026` | Doit précéder toute saisie de données. |
| **Critères d'éligibilité** \* | cocher chaque critère | La liste reprend les critères d'inclusion et d'exclusion de l'étude. Un critère non rempli empêche l'inclusion. |

**Ce que vous devez voir**

- Le patient apparaît dans la liste avec le statut « Inclus ».
- Son calendrier de visites est calculé à partir de J0.

## 2. Ouvrir une visite

Fiche patient → onglet **Visites**. Chaque visite affiche sa date cible et sa fenêtre de tolérance.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Date de visite** \* | `14/12/2026` | Une date hors fenêtre est acceptée mais signalée « hors fenêtre » et tracée. |
| **Visite non programmée** | `+ Visite non programmée` | Pour une consultation imprévue : choisissez les formulaires à remplir. |
| **Formulaires log** | `Événements indésirables` | EI et traitements concomitants : accessibles à tout moment, hors calendrier. |

## 3. Remplir un formulaire

Cliquez sur un formulaire de la visite.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Enregistrer** | `Ctrl + S` | Enregistre le brouillon. Les champs obligatoires vides sont signalés sans bloquer. |
| **Contrôles en ligne** | — | Une valeur hors bornes ou incohérente s'affiche en orange avec le message de la règle. |
| **Champs calculés** | `IMC, âge` | Calculés automatiquement, non modifiables. |
| **Modifier une valeur** | motif obligatoire | Après le premier enregistrement, toute modification exige un motif, conservé dans l'audit trail. |

:::note[Statuts d'un formulaire]
Vide → En cours → Complet → Vérifié (SDV) → Signé → Gelé. La pastille de couleur indique le statut dans le calendrier.
:::

## 4. Signer

L'investigateur principal signe les formulaires complets, par visite ou par patient.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Signification** \* | `Je certifie l'exactitude des données` | Le sens de la signature, enregistré avec elle. |
| **Mot de passe** \* | votre mot de passe | Ré-authentification exigée pour chaque signature électronique. |

**Ce que vous devez voir** : les formulaires signés affichent le nom du signataire et l'horodatage.

