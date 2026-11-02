---
title: FAQ conformité
description: Les questions que posent les promoteurs, les DPO et les auditeurs,
  avec les documents de preuve.
slug: 3.2/resources/compliance-faq
---

Les questions que posent les promoteurs, les DPO et les auditeurs, avec les documents de preuve.

## 21 CFR Part 11 et signature électronique

<details>
  <summary>Les signatures électroniques sont-elles conformes au 21 CFR Part 11 ?</summary>

  Chaque signature exige une ré-authentification, enregistre la signification choisie, le nom du signataire et l'horodatage, et reste liée de façon indissociable à l'enregistrement signé.
</details>

<details>
  <summary>L'audit trail peut-il être modifié ou désactivé ?</summary>

  Non. Il est en ajout seul, horodaté en UTC, et conserve l'ancienne valeur, la nouvelle, l'utilisateur et le motif. Aucun rôle, y compris administrateur, ne peut le modifier.
</details>

<details>
  <summary>Comment les accès sont-ils contrôlés ?</summary>

  Double authentification obligatoire, rôles par étude et par site, expiration de session après inactivité et revue périodique des droits.

  Preuve : [Modèle de permissions](/3.2/security/permissions/)
</details>

## Hébergement et sécurité

<details>
  <summary>Où sont hébergées les données ?</summary>

  En France, chez un hébergeur certifié HDS. Les données identifiantes sont chiffrées au repos.

  Preuve : [Politique de sauvegarde](/3.2/deployment/backup/)
</details>

<details>
  <summary>Comment les sauvegardes sont-elles testées ?</summary>

  Les restaurations sont testées périodiquement conformément à la politique de sauvegarde (HDS v1.1 §8.4, ISO 27001 A.12.3).

  Preuve : [Politique de sauvegarde](/3.2/deployment/backup/)
</details>

## RGPD et données patients

<details>
  <summary>Quelle base légale pour conserver des données identifiantes ?</summary>

  Elle dépend du cadre de l'étude : en France, une RIPH 1 ou 2 avec consentement déposé. Synapse ne propose « Conserver » à l'import que si la base réglementaire l'autorise.

  Preuve : [Registre des traitements](/3.2/rgpd/registre-traitements/)
</details>

<details>
  <summary>Comment exercer les droits d'un patient (accès, opposition) ?</summary>

  Le data manager peut exporter ou retirer les données d'un patient ; l'opération est tracée et motivée.
</details>

## Validation du système

<details>
  <summary>Synapse est-il validé (CSV / GAMP 5) ?</summary>

  Chaque release suit une stratégie de recette fondée sur les risques, avec des cahiers liés aux exigences et un PV signé.
</details>

<details>
  <summary>Comment recetter Synapse chez nous ?</summary>

  Utilisez le kit de recette : fichier de test, cahiers et modèle de signalement.

  [Ouvrir le kit de recette](/3.2/recette/kit/)
</details>
