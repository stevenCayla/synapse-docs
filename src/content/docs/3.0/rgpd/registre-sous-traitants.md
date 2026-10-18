---
title: Registre des sous-traitants — RGPD Art. 28 / HDS
description: L'article 28 du RGPD impose que tout responsable de traitement
  ayant recours à un sous-traitant veille à ce que ce dernier présente des
  garanties suffisantes…
slug: 3.0/rgpd/registre-sous-traitants
---

**Application** : SYNAPSE MEDICAL (EDC)\
**Responsable du traitement** : \[À compléter]\
**DPO** : \[À compléter]\
**Version** : 1.0 — 2026-04-17\
**Révision** : à chaque nouveau sous-traitant ou renouvellement de DPA

***

## Cadre légal

L'article 28 du RGPD impose que tout responsable de traitement ayant recours à un sous-traitant veille à ce que ce dernier présente des garanties suffisantes et formalisées par un contrat (DPA — Data Processing Agreement).

Pour un hébergeur de données de santé (HDS), les exigences sont renforcées : tout sous-traitant accédant aux données de santé doit lui-même être certifié HDS ou signer un contrat spécifique encadrant strictement son accès.

***

## Tableau des sous-traitants

| # | Sous-traitant | Rôle | Données traitées | Base UE | Cert. HDS | DPA signé | Révision |
|---|--------------|------|-----------------|---------|-----------|-----------|----------|
| 1 | **Hébergeur infrastructure** (ex. OVHcloud HDS / Scaleway HDS) | Hébergement PostgreSQL, stockage objet (sauvegardes), serveurs applicatifs | Toutes les données de l'application (santé, utilisateurs, journaux) | Oui | ⚠️ À confirmer | ⚠️ À signer | Annuelle |
| 2 | **Service e-mail transactionnel** (ex. Brevo / Mailjet) | Envoi d'e-mails (invitation utilisateur, alertes) | Adresse e-mail professionnelle, nom d'usage | Oui | Non applicable | ⚠️ À signer | Annuelle |
| 3 | **Service de monitoring / APM** (ex. Sentry, Datadog) | Surveillance des erreurs applicatives, métriques de performance | Stack traces (peut contenir des IDs utilisateur), métriques | À préciser | Non applicable | ⚠️ À signer | Annuelle |
| 4 | **Éditeur du logiciel** (équipe de développement interne ou prestataire) | Maintenance corrective et évolutive, accès au code et aux données en staging | Données de staging (anonymisées idéalement) | Oui | Non applicable | Contrat de prestation | Annuelle |

***

## Points d'attention HDS

### Hébergeur certifié HDS obligatoire

> En application de l'article L.1111-8 du Code de la santé publique, l'hébergement de données de santé à caractère personnel collectées dans le cadre d'activités de prévention, de diagnostic, de soins ou de suivi social et médico-social est soumis à agrément ou certification HDS.

**Action requise** : documenter ici l'hébergeur retenu et sa référence de certification HDS (numéro de certificat, date d'expiration, périmètre certifié).

| Champ | Valeur |
|-------|--------|
| Hébergeur retenu | ⚠️ À compléter |
| Numéro de certification HDS | ⚠️ À compléter |
| Date d'expiration | ⚠️ À compléter |
| Périmètre (infrastructure / PaaS / SaaS) | ⚠️ À compléter |
| URL du certificat public | ⚠️ À compléter |

***

## Clauses contractuelles obligatoires (Art. 28.3 RGPD)

Chaque DPA doit impérativement contenir :

* \[ ] Objet et durée du traitement
* \[ ] Nature et finalité du traitement
* \[ ] Type de données personnelles et catégories de personnes concernées
* \[ ] Obligations du sous-traitant (traitement uniquement sur instruction, confidentialité, sécurité, notification de violation, assistance DPIAs, suppression/restitution des données)
* \[ ] Autorisation pour faire appel à un sous-sous-traitant
* \[ ] Droit d'audit du responsable de traitement

***

## Actions requises avant mise en production

* \[ ] Identifier et confirmer l'hébergeur certifié HDS
* \[ ] Obtenir et archiver le certificat HDS de l'hébergeur
* \[ ] Signer les DPA avec chaque sous-traitant listé
* \[ ] Vérifier que les services de monitoring n'ingèrent pas de données de santé en clair
* \[ ] Anonymiser les données de staging (ne jamais utiliser de données de production pour les tests)
* \[ ] Mettre à jour ce registre à chaque changement de prestataire

***

*Ce document doit être révisé annuellement et à chaque nouveau sous-traitant.*\
*Dernière révision : 2026-04-17*
