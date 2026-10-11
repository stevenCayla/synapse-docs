---
title: "Audit de conformité CNIL / RGPD / HDS --- EDC (Version avancée)"
description: "Évaluer la conformité de l'application EDC selon : - RGPD (UE 2016/679) - CNIL (France) - Hébergement HDS"
---

## 1. Objectif

Évaluer la conformité de l'application EDC selon : - RGPD (UE
2016/679) - CNIL (France) - Hébergement HDS

------------------------------------------------------------------------

## 2. Méthodologie

-   Analyse du code
-   Vérification des flux
-   Contrôle des accès
-   Évaluation des risques

------------------------------------------------------------------------

## 3. Grille de scoring pondérée

> État au 2026-04-17 — voir `scoring.md` pour le détail des justifications.

| Domaine | Poids | Score (0-5) | Score pondéré |
|---------|------:|:-----------:|:-------------:|
| Accès (RBAC) | 25% | 4 | 1.00 |
| Isolation | 25% | 4 | 1.00 |
| Données | 15% | 4 | 0.60 |
| Sécurité | 15% | 4 | 0.60 |
| Audit trail | 10% | 3 | 0.30 |
| HDS | 10% | 2 | 0.20 |
| **Total** | **100%** | | **3.70 / 5** |

**Score final : 3.70 / 5 (74%) — Partiellement conforme**

Points bloquants restants : backup non documenté, registre Art.30 absent, DPIA non réalisée, HMAC audit trail, export EcrfValueAudit.

------------------------------------------------------------------------

## 4. Criticité

-   🔴 Critique : non conforme RGPD
-   🟠 Important : risque élevé
-   🟡 Amélioration

------------------------------------------------------------------------

## 5. Checklist détaillée

### 5.1 Accès (RBAC)

-   Preuve attendue :
    -   Code des permissions
    -   Table UserAssignment
-   Vérification :
    -   Pas d'accès implicite
    -   Scope limité à STUDY_SITE

### 5.2 Isolation

-   Preuve :
    -   requêtes SQL
    -   endpoints API
-   Vérification :
    -   pas de fuite inter-sites

### 5.3 Données

-   Preuve :
    -   schéma DB
-   Vérification :
    -   Subject → StudySite obligatoire

### 5.4 Sécurité

-   Preuve :
    -   config HTTPS
-   Vérification :
    -   chiffrement actif

### 5.5 Audit trail

-   Preuve :
    -   logs
-   Vérification :
    -   user, role, site, timestamp

### 5.6 HDS

-   Preuve :
    -   hébergement certifié

------------------------------------------------------------------------

## 6. Conclusion

-   Niveau de conformité :
-   Risques principaux :
-   Plan d'action :
