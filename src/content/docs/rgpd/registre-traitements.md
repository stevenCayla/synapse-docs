---
title: "Registre des activités de traitement — RGPD Art. 30"
---

**Application** : SYNAPSE MEDICAL (EDC — Electronic Data Capture)  
**Responsable du traitement** : [À compléter — dénomination sociale]  
**DPO** : [À compléter — nom, coordonnées]  
**Version** : 1.0 — 2026-04-17  
**Révision** : annuelle ou à chaque évolution significative

---

## 1. Gestion des comptes utilisateurs

| Champ | Valeur |
|-------|--------|
| **Finalité** | Authentification, contrôle d'accès, traçabilité des actions |
| **Base légale** | Intérêt légitime (Art. 6.1.f) — obligation réglementaire (HDS) |
| **Catégories de données** | Nom d'usage, prénom, email professionnel, numéro de téléphone, rôle, mot de passe hashé (bcrypt), secret TOTP chiffré, logs de connexion |
| **Catégories de personnes** | Professionnels de santé, investigateurs, coordinateurs, administrateurs |
| **Destinataires** | Administrateurs du workspace, DPO |
| **Transferts hors UE** | Aucun |
| **Durée de conservation** | Durée de la relation + 5 ans (archivage) |
| **Mesures techniques** | Authentification 2FA obligatoire, hashage bcrypt, chiffrement TOTP (AES-256-GCM), journalisation des connexions, soft-delete |

---

## 2. Gestion des études cliniques (séries)

| Champ | Valeur |
|-------|--------|
| **Finalité** | Collecte et gestion des données cliniques dans le cadre de recherches médicales |
| **Base légale** | Intérêt public (Art. 6.1.e) + données de santé (Art. 9.2.j) — recherche scientifique |
| **Catégories de données** | Données administratives de l'étude (titre, statut, champs eCRF définis par l'investigateur), aucune donnée patient directe à ce niveau |
| **Catégories de personnes** | Aucune (entité organisationnelle) |
| **Destinataires** | Membres de l'étude (rôles : viewer, manager, admin) |
| **Transferts hors UE** | Aucun |
| **Durée de conservation** | Durée de l'étude + 15 ans (obligation archivage recherche clinique — Art. L1121-13 CSP) |
| **Mesures techniques** | Isolation par workspace_id, contrôle d'accès par rôle (StudyVoter), soft-delete |

---

## 3. Gestion des patients (registre de l'IPP)

| Champ | Valeur |
|-------|--------|
| **Finalité** | Identification des patients inclus dans les études cliniques |
| **Base légale** | Intérêt public (Art. 6.1.e) + données de santé (Art. 9.2.j) |
| **Catégories de données** | IPP (Identifiant Patient Permanent), prénom, nom, nom de naissance, date de naissance, lieu de naissance, sexe, statut vital (Death Checker) |
| **Catégories de personnes** | Patients pris en charge dans les établissements membres du workspace |
| **Destinataires** | Investigateurs autorisés (via StudyMember/SiteMember), administrateurs |
| **Transferts hors UE** | Aucun |
| **Durée de conservation** | Durée de l'étude + 15 ans ; effacement sur demande (Art. 17) via ErasePatientService |
| **Mesures techniques** | Chiffrement AES-256-GCM des données PII (firstName, lastName, birthName, externalId, dateOfBirth, birth, death), HMAC-SHA256 pour les recherches, suppression EXIF sur les images, restriction de traitement (Art. 18) |

---

## 4. Données eCRF (Electronic Case Report Form)

| Champ | Valeur |
|-------|--------|
| **Finalité** | Collecte structurée des données cliniques d'observation pour les études |
| **Base légale** | Intérêt public (Art. 6.1.e) + données de santé (Art. 9.2.j) |
| **Catégories de données** | Valeurs des champs eCRF (texte, dates, nombres, choix multiples), fichiers joints cliniques, historique des modifications (audit trail), signatures électroniques |
| **Catégories de personnes** | Patients inclus dans les études (identifiés via StudyPatient) |
| **Destinataires** | Investigateurs autorisés, moniteurs, DPO |
| **Transferts hors UE** | Aucun |
| **Durée de conservation** | Durée de l'étude + 15 ans |
| **Mesures techniques** | Isolation workspace, piste d'audit (EcrfValueAudit), motif de modification obligatoire (reason_for_change), signatures horodatées, fichiers stockés hors webroot (private_uploads/) avec token opaque |

---

## 5. Journaux d'audit et de sécurité

| Champ | Valeur |
|-------|--------|
| **Finalité** | Traçabilité des accès et des modifications pour la conformité HDS et la détection des incidents |
| **Base légale** | Obligation légale (Art. 6.1.c) — HDS v1.1 §9, ANSSI |
| **Catégories de données** | Identifiant utilisateur, action, horodatage, adresse IP, agent utilisateur, entités concernées |
| **Catégories de personnes** | Utilisateurs de l'application |
| **Destinataires** | Administrateurs système, DPO, autorités de contrôle (CNIL) en cas d'incident |
| **Transferts hors UE** | Aucun |
| **Durée de conservation** | 5 ans (SecurityAuditLog), 2 ans (ActivityLog) |
| **Mesures techniques** | Journalisation en base (SecurityAuditLog, ActivityLog), index sur userId/createdAt, pas d'effacement possible par les utilisateurs |

---

## 6. Consentements

| Champ | Valeur |
|-------|--------|
| **Finalité** | Recueil et preuve du consentement éclairé des patients pour leur inclusion dans une étude |
| **Base légale** | Consentement (Art. 6.1.a) + données de santé (Art. 9.2.a) |
| **Catégories de données** | Template de consentement, date et heure de signature, identifiant du patient, signature électronique horodatée |
| **Catégories de personnes** | Patients |
| **Destinataires** | Investigateurs, DPO, CNIL en cas de contrôle |
| **Transferts hors UE** | Aucun |
| **Durée de conservation** | Durée de l'étude + 15 ans |
| **Mesures techniques** | Signature HMAC-SHA256 de la preuve, stockage horodaté, non-modifiable après signature |

---

## Mesures de sécurité transverses

| Mesure | Détail |
|--------|--------|
| **Hébergement** | HDS (Hébergeur de Données de Santé) agréé |
| **Chiffrement en transit** | TLS 1.3 (FrankenPHP/Caddy), HTTP/3 |
| **Chiffrement au repos** | AES-256-GCM sur les données PII patients |
| **Authentification** | 2FA TOTP obligatoire pour tous les accès |
| **Contrôle d'accès** | RBAC multi-niveaux (workspace / étude / site) |
| **Sauvegarde** | Voir `docs/deployment/backup.md` |
| **Revue des accès** | Semestrielle (ISO 27001 A.9) — outil intégré dans la matrice d'accès |
| **Notification de violation** | Procédure : délai 72h CNIL (Art. 33), DPO notifié automatiquement |

---

*Ce document doit être mis à jour à chaque évolution significative des traitements et examiné annuellement par le DPO.*
