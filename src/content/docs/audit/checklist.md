---
title: "Checklist Audit CNIL / RGPD / HDS — EDC"
---

## 1. Gouvernance & cadre légal
- [ ] Finalité définie
- [ ] Base légale identifiée
- [ ] DPIA réalisé

## 2. Contrôle des accès (RBAC)
- [ ] Rôles définis
- [ ] Scopes limités (GLOBAL, STUDY, STUDY_SITE)
- [ ] Aucun accès implicite

## 3. Isolation des données
- [ ] Isolation inter-sites
- [ ] Pas de recherche globale
- [ ] Filtrage backend

## 4. Modèle de données
- [ ] Subject lié à StudySite
- [ ] Aucun patient global

## 5. Données de santé
- [ ] Données sensibles identifiées
- [ ] Pseudonymisation

## 6. Sécurité
- [ ] Authentification robuste
- [ ] HTTPS
- [ ] Chiffrement

## 7. Audit trail
- [ ] Actions tracées
- [ ] Logs complets

## 8. HDS
- [ ] Hébergement certifié
