---
title: "Sécurité — points à renforcer pour un EDC / HDS / RGPD"
---

> État au 2026-04-17 — vérification code source.

- [X] Authentification forte MFA Support TOTP
- [X] MFA obligatoire pour tous les comptes (TwoFactorSubscriber — redirect /2fa/setup si non enrôlé)
- [X] HTTPS partout
- [X] Hébergement HDS prouvé
- [X] Timeout session
- [X] Politique mot de passe solide (PasswordPolicyService — 12 chars, complexité, historique)
- [X] Protection brute force (5 tentatives, lockout 15 min DB + throttling)
- [X] Audit des changements de rôle (ActivityLog old_value/new_value sur study_member.* et site_member.*)

## Gestion des sessions

- [X] timeout (SessionInactivitySubscriber — 15 min configurable)
- [X] warning (SessionExpireController)
- [X] Invalidation sessions après changement de mot de passe (SessionEnforcementSubscriber)
- [ ] Limitation sessions simultanées
- [X] Liste sessions actives + kill (UserSessionController — kill / kill-others)
- [ ] Rotation tokens (refresh tokens sécurisés)

## Audit trail

- [X] journal d'audit (ActivityLog + SecurityAuditLog + EcrfValueAudit)
- [X] logs (SecurityAuditLog — login/logout/2FA/lockout/password change)
- [X] raison du changement — mandatory reason for change (EcrfValueAudit.reasonForChange, M2 CHECK constraint NOT VALID)
- [X] ancienne valeur / nouvelle valeur (EcrfValueAudit old/new + ActivityLog old_value/new_value M3)
- [X] autosave tracé avec raison implicite horodatée (M1 — `[Autosave] YYYY-MM-DD HH:MM:SS UTC`)
- [ ] audit trail NON modifiable (WORM / append-only) — HMAC chaîné non implémenté
- [X] export audit trail droits d'accès (CSV — SecuritySettingsController)
- [ ] export EcrfValueAudit par étude (AuditExportController manquant)

## RBAC & sécurité des droits

- [X] historique des changements de droits (ActivityLog old_value/new_value)
- [ ] Revue périodique des droits (quarterly access review)
- [ ] Workflow d'approbation pour changements critiques
- [ ] Segregation of duties (SoD)
- [ ] Blocage des rôles à privilèges excessifs

## Politique mot de passe

- [X] Rotation périodique désactivée = OK (bonne pratique moderne)
- [X] Politique uniforme (PasswordPolicyService appliqué dans reset + force-change + formulaires)
- [ ] Vérification contre listes de mots de passe compromis (HaveIBeenPwned)
- [ ] Blocage des mots de passe faibles (dictionary check)

## Protection avancée contre attaques

- [X] brute force (LoginSecuritySubscriber)
- [X] rate limiting (Symfony login_throttling)
- [ ] CAPTCHA après X tentatives
- [ ] détection d'anomalies (IP inhabituelle, pays)
- [ ] blocage géographique (optionnel)

## Gestion des comptes

- [X] Désactivation automatique comptes inactifs (AutoDisableInactiveUsersCommand)
- [ ] Revue régulière des comptes (ex: tous les 6 mois)
- [ ] Gestion des départs (offboarding rapide)
- [ ] Interdiction comptes partagés
- [ ] Vérification email / identité

## Accès admin (ultra critique en audit)

- [ ] Accès admin séparé (compte dédié)
- [X] MFA obligatoire
- [ ] accès via bastion / IP whitelist (idéal)
- [ ] journalisation renforcée des actions admin

## Logs & monitoring

- [X] logs (ActivityLog + SecurityAuditLog + EcrfValueAudit)
- [X] Conservation longue (DataRetentionService — durée étude + 15 ans HDS, sécurité 6 mois)
- [ ] centralisation (SIEM)
- [ ] alerting en temps réel (ex: accès suspect)
- [ ] logs immuables (HMAC manquant)

## Sécurité EDC spécifique

- [X] Signature électronique conforme (Part 11) — EcrfSignatureService (HMAC-SHA256, re-auth, non-répudiation)
- [X] Re-authentification pour actions critiques (EcrfSignatureController — password check)
- [X] Verrouillage des données après freeze (Study.frozenAt — EcrfRecordController bloque)
- [X] Gestion des corrections avec justification (EcrfValueAudit.reasonForChange mandatory)

## Tests & conformité

- [X] Tests unitaires (32 tests — StudyPatientStatus, StudyFreeze, EcrfQueryStatus)
- [ ] Tests de pénétration réguliers
- [ ] scans de vulnérabilités (CI — composer audit absent)
- [ ] validation sécurité documentée (CSV)

## RGPD / données personnelles

- [X] Chiffrement au repos (PatientEncryptionListener — AES-256 libsodium sur PII patient)
- [X] Droit à l'effacement Art.17 (ErasePatientService + PatientErasureLog immuable)
- [X] Portabilité Art.20 (PatientDataExportService)
- [X] Limitation du traitement Art.18 (Patient.processingRestricted)
- [X] Soft-delete utilisateurs (User.deletedAt + log user.deleted)
- [ ] Registre des traitements Art.30
- [ ] DPIA (Art.35) formalisée
- [ ] Registre sous-traitants Art.28
