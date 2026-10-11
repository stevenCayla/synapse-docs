---
title: "Grille de scoring conformité CNIL / RGPD / HDS"
---

> Audit clôturé le 2026-04-17 — analyse statique du code source complet.

## Score par catégorie (0 à 5)

| Catégorie | Score | Justification |
|----------|:-----:|---------------|
| Accès (RBAC) | 4 | 3 niveaux (workspace/study/site), StudyVoter+SiteVoter, rôles distincts. Pas de revue périodique ni de workflow d'approbation. |
| Isolation | 4 | Workspace strict, SiteAccessService câblé, C1–C4 fixes. Contrainte DB site↔studySite manquante. |
| Données | 4 | PatientEncryptionListener (AES-256), ErasePatientService (Art.17), PatientDataExportService (Art.20), processingRestricted (Art.18), soft-delete User. HMAC ActivityLog absent. |
| Sécurité | 4 | 2FA obligatoire, CSP nonce-based, trusted_proxies, sessions kill list, PasswordPolicyService cohérent. Pas de scan CVE CI, secure=auto. |
| Audit trail | 3 | EcrfValueAudit complet + M1/M2/M3. Export droits d'accès CSV. Pas d'export EcrfValueAudit, pas de HMAC append-only. |
| HDS | 2 | Chiffrement OK, fichiers privés OK, rétention partielle. Backup non documenté, registre Art.30 absent, DPIA non réalisée. |

**Total : 21 / 30**

## Interprétation

| Plage | Niveau |
|-------|--------|
| 0–10 | Non conforme |
| 11–20 | Risque élevé |
| **21–25** | **Partiellement conforme ← position actuelle** |
| 26–30 | Conforme |

## Non-conformités restantes (11 ouvertes sur 21 identifiées)

| ID | Catégorie | Criticité | Statut |
|----|-----------|-----------|--------|
| NC-10 | HDS | P1 | Ouvert — backup PostgreSQL non documenté |
| NC-11 | Rétention | P1 | Ouvert — registre Art.30 absent |
| NC-13 | Modèle | P1 | Ouvert — StudyPatient site↔studySite sans contrainte DB |
| NC-14 | RBAC | P1 | Ouvert — pas de revue périodique des accès |
| NC-15 | Audit | P2 | Ouvert — EcrfValueAudit non exportable |
| NC-16 | Audit | P2 | Ouvert — ActivityLog sans HMAC chaîné |
| NC-17 | Sécurité | P2 | Ouvert — cookies secure=auto (pas true) |
| NC-18 | Sécurité | P2 | Ouvert — pas de scan CVE dans CI |
| NC-19 | Minimisation | P2 | Ouvert — birth.city potentiellement excessif |
| NC-20 | HDS | P2 | Ouvert — téléchargement fichiers cliniques non tracé |
| NC-21 | HDS | P2 | Ouvert — registre sous-traitants Art.28 absent |

## Non-conformités résolues (10 sur 21)

| ID | Description | Résolution |
|----|-------------|------------|
| NC-01 | Données Patient en clair | `PatientEncryptionListener` + `EncryptExistingPatientsCommand` |
| NC-02 | Soft-delete ≠ RGPD Art.17 | `ErasePatientService` + `PatientErasureLog` |
| NC-03 | 2FA optionnelle | `TwoFactorSubscriber` → redirect `/2fa/setup` obligatoire |
| NC-04 | Aucun export portabilité | `PatientDataExportService` |
| NC-05 | Absence rétention automatisée | `DataRetentionService`, `PurgeSecurityLogsCommand`, `CheckStudyRetentionCommand` |
| NC-06 | Hard-delete User sans trace | `$user->softDelete()` + log `user.deleted` |
| NC-07 | Politique mdp incohérente | `PasswordPolicyService` injecté dans `PasswordResetController` |
| NC-08 | CSP unsafe-inline | `SecurityHeadersSubscriber` → nonce-based CSP |
| NC-09 | trusted_proxies absent | `framework.yaml` → `%env(TRUSTED_PROXIES)%` |
| NC-12 | Pas de limitation Art.18 | `Patient.processingRestricted` + `processingRestrictedAt/By/Reason` |
