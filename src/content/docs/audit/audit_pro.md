---
title: "AUDIT DE CONFORMITÉ CNIL / RGPD / HDS --- EDC (VERSION PROFESSIONNELLE)"
description: "Domaine Poids Score (0-5) Pondéré"
---

------------------------------------------------------------------------

# 1. Informations générales

-   Nom de l'application :
-   Version :
-   Date de l'audit :
-   Auditeur :

------------------------------------------------------------------------

# 2. Référentiels

-   RGPD (UE 2016/679)
-   CNIL (France)
-   Hébergement HDS
-   Bonnes pratiques GCP

------------------------------------------------------------------------

# 3. Méthodologie

-   Analyse du code source
-   Revue des modèles de données
-   Analyse des flux utilisateurs
-   Vérification des contrôles d'accès
-   Analyse sécurité & logs

------------------------------------------------------------------------

# 4. Scoring pondéré

  Domaine             Poids   Score (0-5)   Pondéré
  ------------------- ------- ------------- ---------
  RBAC & accès        25%                   
  Isolation données   25%                   
  Modèle données      15%                   
  Sécurité            15%                   
  Audit trail         10%                   
  HDS                 10%                   

Score global = somme pondérée

------------------------------------------------------------------------

# 5. Criticité

-   🔴 Critique : non conforme RGPD (risque CNIL)
-   🟠 Important : risque élevé
-   🟡 Mineur : amélioration

------------------------------------------------------------------------

# 6. Audit détaillé

## 6.1 RBAC & Accès

### Attendus

-   Permissions centralisées
-   Scope STUDY_SITE prioritaire
-   Pas d'accès implicite

### Preuves attendues

-   Code UserAssignment
-   Voters / policies
-   Requêtes filtrées

### Vérifications

-   [ ] Pas d'accès via site seul
-   [ ] Pas d'utilisation de user.sites pour filtrer

------------------------------------------------------------------------

## 6.2 Isolation inter-sites

### Attendus

-   Isolation stricte des données
-   Aucun accès cross-site

### Preuves

-   Endpoints API
-   Requêtes DB

### Vérifications

-   [ ] Aucun patient visible hors périmètre
-   [ ] Aucun autocomplete global

------------------------------------------------------------------------

## 6.3 Modèle de données

### Attendus

-   Subject lié à StudySite

### Vérifications

-   [ ] study_site_id obligatoire
-   [ ] pas de patient global

------------------------------------------------------------------------

## 6.4 Données de santé

### Attendus

-   Données pseudonymisées
-   Minimisation

### Vérifications

-   [ ] Pas de nom/prénom inutile
-   [ ] ID pseudonymisé

------------------------------------------------------------------------

## 6.5 Sécurité

### Attendus

-   HTTPS
-   Auth forte

### Vérifications

-   [ ] Protection brute force
-   [ ] Sessions sécurisées

------------------------------------------------------------------------

## 6.6 Audit trail

### Attendus

-   Logs complets

### Vérifications

-   [ ] user
-   [ ] rôle
-   [ ] study
-   [ ] site
-   [ ] timestamp

------------------------------------------------------------------------

## 6.7 HDS

### Attendus

-   Hébergement certifié
-   Chiffrement

------------------------------------------------------------------------

# 7. Analyse des risques

  Risque   Impact   Probabilité   Niveau
  -------- -------- ------------- --------

------------------------------------------------------------------------

# 8. Plan d'action

## Quick wins

-   Corriger accès implicites
-   Restreindre API

## Chantiers

-   Migration vers StudySite strict
-   Audit trail complet

------------------------------------------------------------------------

# 9. Conclusion

-   Niveau conformité :
-   Risques majeurs :
-   Actions prioritaires :
