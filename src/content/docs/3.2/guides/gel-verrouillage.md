---
title: Gel et verrouillage
description: Figer les données d'un patient, puis verrouiller la base pour l'analyse.
time: 5 min
sheet: true
slug: 3.2/guides/gel-verrouillage
---

## 1. Geler

Par formulaire, visite ou patient : **Actions** → **Geler**.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Effet** | — | La saisie est bloquée ; les requêtes restent possibles. Dégeler exige un motif. |

**Ce que vous devez voir** : un cadenas ouvert s'affiche sur les éléments gelés.

## 2. Vérifier les prérequis

**Étude** → **Clôture** affiche la liste de contrôle.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Requêtes ouvertes** \* | `0` | Toutes les requêtes doivent être closes. |
| **SDV** \* | `100 % des champs prévus` | Selon la stratégie de monitoring. |
| **Signatures PI** \* | tous les patients | Chaque patient doit être signé par son investigateur. |

## 3. Verrouiller la base

Double signature : data manager puis promoteur.

**Ce que vous devez voir**

* L'étude passe au statut « Verrouillée » ; plus aucune modification n'est possible.
* Un instantané horodaté est créé pour les exports.

:::note[Déverrouillage exceptionnel]
Possible par un administrateur avec motif et double signature ; tracé dans l'audit trail.
:::
