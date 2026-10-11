---
title: "Checklist EDC / HDS"
description: "Pour une EDC, les auditeurs regardent en priorité :"
---

## ✅ 1. Hébergement & périmètre HDS

### 🔐 Certification
- [X] Hébergeur certifié HDS valide (certificat à jour)
- [ ] Périmètre des [6 activités HDS couvert](/audit/checklist/activites_hds_6/) (ou justifié)
- [ ] Certificat disponible et vérifié (organisme accrédité)

### 📍 Localisation
- [X] Données hébergées UE uniquement
- [ ] Liste des sous-traitants documentée
- [X] Aucun transfert hors UE sans mécanisme RGPD valide

## ✅ 2. Architecture technique EDC

### 🏗️ Infrastructure
- [ ] Architecture documentée (schémas à jour)
- [ ] [Segmentation réseau](/audit/checklist/niveau_attendu_hds_edc/) (prod / staging / dev séparés)
- [ ] Isolation stricte des environnements clients (multi-tenant sécurisé - base de données par client ou schéma isolé)

### ☁️ Composants
- [ ] Bases de données chiffrées et sécurisées
- [ ] Stockage sécurisé (documents, eCRF, pièces jointes)
- [ ] Load balancing + haute disponibilité

## ✅ 3. Gestion des accès (critique EDC)

### 👤 Authentification
- [X] MFA activé (obligatoire pour tous — redirect /2fa/setup si non enrôlé)
- [X] Politique de mots de passe robuste (12 chars, complexité, historique, uniforme)
- [X] Gestion des sessions (timeout 15 min, kill list, invalidation après changement mdp)

### 🔑 Autorisations
- [X] [RBAC](/audit/checklist/roles_edc_rbac/) (rôles : investigateur, CRA, data manager…)
- [ ] Principe du moindre privilège
- [ ] Revue périodique des habilitations

### 📜 Traçabilité
- [X] Logs des connexions (réussies + échouées)
- [X] Historique des changements de droits

## ✅ 4. Chiffrement & protection des données

- [X] Données chiffrées au repos (PatientEncryptionListener — AES-256 libsodium sur tous les champs PII)
- [X] Données chiffrées en transit (FrankenPHP/Caddy — TLS 1.3, HSTS)
- [ ] Gestion des clés sécurisée (KMS / HSM) — clé via variable d'env APP_ENCRYPTION_KEY
- [ ] Séparation des environnements de clés

## ✅ 5. Audit trail (EXIGENCE MAJEURE EDC)

### 📊 Traçabilité des données cliniques
- [X] Audit trail complet (EcrfValueAudit champ par champ + ActivityLog + SecurityAuditLog)
- [ ] Inaltérable (HMAC chaîné non implémenté — NC-16)
- [X] Capture création / modification / suppression (EcrfValueAudit event_type)
- [X] Ancienne valeur / nouvelle valeur (EcrfValueAudit + ActivityLog old_value/new_value)
- [X] Raison du changement obligatoire (reasonForChange — CHECK constraint DB)
- [X] Autosave tracé avec raison implicite horodatée
- [X] Horodatage précis UTC
- [X] Identification utilisateur unique (changedBy / performedBy)

### 🔍 Conformité
- [X] Conforme GCP ICH E6(R3) — EcrfValueAudit complet, reasonForChange mandatory
- [X] Conforme 21 CFR Part 11 — e-signatures (EcrfSignatureService HMAC-SHA256 + re-auth)
- [ ] Impossible de désactiver l’audit trail (aucun flag disable — conforme en pratique)

## ✅ 6. Intégrité & validation des données

- [ ] Contrôles de cohérence (edit checks) — non implémenté
- [X] Versioning des formulaires eCRF (EcrfRecord.formVersion capturé à la création)
- [X] Historique des versions des données (EcrfValueAudit complet)
- [X] Signature électronique conforme Part 11 (EcrfSignatureService — HMAC-SHA256, re-auth, non-répudiation)

## ✅ 7. Sauvegardes & continuité

### 💾 Sauvegardes
- [ ] Sauvegardes automatiques
- [ ] Chiffrées
- [ ] Fréquence définie (ex : quotidienne)
- [ ] Politique de rétention documentée

### 🔁 Restauration
- [ ] Tests de restauration réguliers
- [ ] Procédures documentées

### 🚨 PRA / PCA
- [ ] PRA défini (RTO / RPO clairs)
- [ ] PCA en place
- [ ] Tests réalisés et documentés

## ✅ 8. Journalisation & supervision

- [ ] Logs centralisés (SIEM recommandé)
- [ ] Logs protégés contre modification
- [ ] Surveillance en temps réel (alerting)
- [ ] Conservation conforme (≥ 6 mois ou selon besoin étude)

## ✅ 9. Gestion des incidents

- [ ] Procédure documentée
- [ ] Classification des incidents
- [ ] Notification client définie
- [ ] Process RGPD (notification CNIL < 72h si nécessaire)
- [ ] Registre des incidents

## ✅ 10. Conformité RGPD (critique santé)

- [ ] DPA signé avec hébergeur
- [ ] Registre des traitements Art.30
- [ ] Analyse d’impact (DPIA) réalisée
- [ ] Minimisation des données (birth.city potentiellement excessif — NC-19)
- [X] Pseudonymisation des patients (subjectId par site `{SITE_CODE}-{NNN}` distinct de l’IPP)
- [X] Droit à l’effacement Art.17 (ErasePatientService + PatientErasureLog immuable)
- [X] Portabilité Art.20 (PatientDataExportService)
- [X] Limitation du traitement Art.18 (Patient.processingRestricted)

## ✅ 11. Validation système (CSV)

### 📋 Documentation
- [ ] Plan de validation (VMP)
- [ ] URS (User Requirements)
- [ ] IQ / OQ / PQ

### 🧪 Tests
- [ ] Tests documentés et validés
- [ ] Gestion des anomalies (deviation log)
- [ ] Revalidation en cas de changement

## ✅ 12. Gestion des changements (change control)

- [ ] Process formalisé (change request)
- [ ] Évaluation d’impact (GxP + [sécurité](/audit/checklist/securite_edc_hds_rgpd/))
- [ ] Validation avant mise en prod
- [ ] Historique des changements

## ✅ 13. Réversibilité & fin de contrat

- [ ] Procédure de restitution des données
- [ ] Format exploitable (CSV, SQL…)
- [ ] Délais définis
- [ ] Suppression sécurisée après restitution

## ✅ 14. Organisation & gouvernance

- [ ] Politique de [sécurité](/audit/checklist/securite_edc_hds_rgpd/) (PSSI)
- [ ] Gestion des accès internes (admins)
- [ ] Formation sécurité des équipes
- [ ] Gestion des risques documentée

## 🚨 Points “red flags” fréquents en audit EDC

- [ ] Audit trail modifiable ou incomplet
- [ ] Absence de validation logicielle (CSV)
- [ ] MFA absent pour comptes sensibles
- [ ] Sauvegardes non testées
- [ ] Logs non exploitables
- [ ] Mélange données prod / test
- [ ] Hébergeur HDS partiel ou mal compris

## 💡 Astuce terrain

Pour une EDC, les auditeurs regardent en priorité :

- Audit trail
- Validation système (CSV)
- Gestion des accès
- Intégrité des données
- Hébergement HDS réel (pas marketing)
