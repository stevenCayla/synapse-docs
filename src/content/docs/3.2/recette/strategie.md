---
title: Stratégie de recette
description: "Comment la recette de Synapse est organisée : périmètre, cahiers,
  criticité, statuts et critères d'acceptation."
pagefind: false
slug: 3.2/recette/strategie
---

La recette vérifie, sur un environnement dédié, que chaque version de Synapse se comporte comme la documentation le décrit avant sa mise en production. Cette page fixe les règles communes à tous les cahiers.

## Cahiers de recette

| Cahier | Périmètre | État |
|--------|-----------|------|
| [REC-01 · Création d'étude](/3.2/recette/creation-etude/) | Assistant « Nouvelle étude », cadre réglementaire, passage en production | Brouillon : 14 cas |
| [REC-02 · Saisie eCRF](/3.2/recette/saisie-ecrf/) | Saisie des données dans les formulaires | En cours de rédaction |
| [REC-03 · Import de données](/3.2/recette/import-donnees/) | Import Excel et CSV | En cours de rédaction |
| [REC-04 · Audit trail et e-signature](/3.2/recette/audit-trail-esignature/) | Traçabilité et signature électronique | En cours de rédaction |

Le [kit de recette](/3.2/recette/kit/) fournit le fichier de test et le modèle de signalement communs à tous les cahiers.

## Niveaux de criticité

| Niveau | Signification |
|--------|---------------|
| <span class="crit h">Haute</span> | Le cas couvre une exigence réglementaire ou GxP : il doit être conforme pour approuver la version. |
| <span class="crit m">Moyenne</span> | Le cas couvre une règle fonctionnelle importante ; un écart est analysé et tracé. |
| <span class="crit l">Basse</span> | Le cas couvre le confort ou la présentation ; un écart ne bloque pas la version. |

## Statuts d'exécution

Chaque cas reçoit un statut à la fin de son exécution.

| Statut | Signification |
|--------|---------------|
| Non exécuté | Le cas n'a pas encore été joué. |
| Conforme | Chaque étape donne le résultat attendu. |
| Non conforme | Au moins une étape donne un résultat différent : une anomalie est ouverte. |
| Bloqué | Le cas ne peut pas être joué (prérequis manquant, autre anomalie). |

## Déroulement d'une campagne

1. Préparer l'environnement

   Environnement de recette dédié, release à valider déployée, comptes de test et pack réglementaire publiés, comme indiqués dans les prérequis de chaque cahier.

2. Exécuter les cas

   Dans chaque cahier, cochez les étapes et choisissez le statut du cas. La saisie reste dans votre navigateur et prépare le procès-verbal.

3. Signaler les écarts

   Chaque résultat différent de l'attendu est signalé avec le modèle du kit de recette, en vérifiant d'abord les problèmes connus.

4. Établir le procès-verbal

   Le bouton « Préparer le PV » d'un cahier produit le récapitulatif des statuts, à consigner dans le système qualité avec l'identifiant de campagne.

## Critères d'acceptation

* 100 % des cas <span class="crit h">Haute</span> conformes.
* Aucune anomalie bloquante ouverte ; anomalies mineures tracées avec un plan d'action.
* Procès-verbal signé par le Data Manager et l'Assurance Qualité.

:::caution[Document de référence, pas preuve d'exécution]
Les cahiers décrivent les tests et leurs résultats attendus. Les résultats signés (procès-verbaux, captures, écarts) sont consignés dans le système qualité, référencés par l'identifiant de campagne.
:::
