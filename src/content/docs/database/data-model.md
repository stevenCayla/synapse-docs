---
title: "Modèle de données"
description: "Modèle de données Doctrine : ~50 entités regroupées par domaine, leurs relations, les conventions transverses (workspace, soft-delete, audit) et les migrations."
---

> 🌐 Version française · [English version](/en/database/data-model/)

Entités Doctrine, relations et conventions transverses.
Voir aussi : [Structure du code backend](/backend/symfony-structure/) · [Architecture](/architecture/overview/).

---

## Table des matières

1. [Chiffres clés](#1-chiffres-clés)
2. [Conventions transverses](#2-conventions-transverses)
3. [Schéma global](#3-schéma-global)
4. [Workspace & multi-tenance](#4-workspace--multi-tenance)
5. [Identité & sécurité](#5-identité--sécurité)
6. [Étude & domaine clinique](#6-étude--domaine-clinique)
7. [Patients & consentement](#7-patients--consentement)
8. [eCRF](#8-ecrf)
9. [Audit & traçabilité](#9-audit--traçabilité)
10. [Migrations](#10-migrations)

---

## 1. Chiffres clés

- **~50 entités**, **~25 enums**, **~47 repositories**.
- **2 fonctions DQL custom** (PostgreSQL JSON/text).
- **35 migrations actives** (+ 85 archivées).
- SGBD : **PostgreSQL 16** (avec Row-Level Security sur les tables sensibles).

---

## 2. Conventions transverses

| Convention | Détail |
|------------|--------|
| **`workspace_id`** | Colonne non-nullable, FK vers `workspace`, sur ~16 entités métier. Filtrage obligatoire dans **toutes** les requêtes. |
| **Soft-delete** (`deletedAt`) | Sur les entités à forte valeur réglementaire : `User`, `Study`, `Patient`. |
| **Timestamps** | `createdAt`/`updatedAt` sur les agrégats ; entités d'audit **append-only** (créées, jamais modifiées). |
| **Chiffrement au repos** | PII patient et secret TOTP chiffrés transparemment (listeners Doctrine) + index aveugle HMAC pour la recherche. |
| **Row-Level Security** | `FORCE ROW LEVEL SECURITY` sur `study`, `patient`, `ecrf_record`. |
| **Rôles & permissions** | Modélisés en base (`StudyRole`/`StudyPermission`, `SiteRole`/`SitePermission`), pas seulement en code. |

> **Règle d'or** : ne jamais charger une ressource par son ID seul — toujours vérifier `workspace_id` (repository filtré ou Voter). Voir [architecture/overview.md §5](/architecture/overview/#5-multi-tenance--isolation).

---

## 3. Schéma global

`Workspace` est le **tenant racine** : toutes les entités métier en dépendent (FK `workspace_id`).
Le diagramme ci-dessous montre les agrégats principaux et leurs cardinalités ; les
entités de sécurité hors workspace (`SecurityAuditLog`, `UserSession`, `PasswordHistory`…)
ne sont pas représentées.

```mermaid
erDiagram
    Workspace ||--o{ WorkspaceUser : "membres"
    Workspace ||--o{ Site : "centres"
    Workspace ||--o{ Study : "études"
    Workspace ||--o{ EcrfTemplate : "modèles eCRF"
    Workspace ||--o{ ConsentTemplate : "modèles consentement"
    User      ||--o{ WorkspaceUser : "appartenances"

    Site      ||--o{ SiteMember : ""
    Site      ||--o{ StudySite : ""
    Study     ||--o{ StudySite : "centres ouverts"

    Study     ||--o{ StudyMember : "équipe"
    Study     ||--o{ StudyPatient : "inclusions"
    Patient   ||--o{ StudyPatient : "inclusions"
    Study     ||--o{ StudyVisit : "calendrier"
    StudyVisit ||--o{ PatientVisitOccurrence : "occurrences"
    StudyPatient ||--o{ PatientVisitOccurrence : ""

    Study     ||--o{ EcrfForm : "formulaires"
    EcrfForm  ||--o{ EcrfSection : ""
    EcrfSection ||--o{ EcrfField : ""
    EcrfForm  ||--o{ EcrfRecord : "saisies"
    EcrfRecord ||--o{ EcrfValue : "valeurs"
    EcrfValue ||--o{ EcrfValueAudit : "historique"
    EcrfRecord ||--o{ EcrfSignature : "signatures"
    EcrfRecord ||--o{ EcrfAttachment : "pièces jointes"
    EcrfRecord ||--o{ EcrfQuery : "discordances"
    EcrfQuery ||--o{ EcrfQueryMessage : "fil"

    EcrfTemplate ||--o{ EcrfTemplateSection : ""
    EcrfTemplateSection ||--o{ EcrfTemplateField : ""
    EcrfTemplate ..|| EcrfForm : "instancie (snapshot)"

    ConsentTemplate ||--o{ ConsentVersion : "versions"
    ConsentVersion ||--o{ PatientConsent : "consentements"
    Patient ||--o{ PatientConsent : ""

    Study ||--o{ ActivityLog : "audit GCP (HMAC)"

    Workspace {
        uuid id PK
        string name
    }
    Study {
        uuid id PK
        uuid workspace_id FK
        enum status "draft|active|completed|archived"
        datetime deletedAt "soft-delete"
    }
    Patient {
        uuid id PK
        uuid workspace_id FK
        string externalId "IPP — chiffré"
        string externalIdHash "HMAC (recherche)"
        datetime deletedAt "soft-delete"
    }
    EcrfRecord {
        uuid id PK
        enum status "draft|in_progress|completed|locked"
    }
    EcrfQuery {
        uuid id PK
        enum status "open|answered|closed|cancelled"
    }
```

---

## 4. Workspace & multi-tenance

| Entité | Rôle | Relations clés |
|--------|------|----------------|
| `Workspace` | Racine de tenance | → `DpoContact`, owner `User`, `WorkspaceUser[]` |
| `WorkspaceUser` | Appartenance User↔Workspace | `role: WorkspaceRole` |
| `WorkspaceModule` | Activation de module | `moduleCode: ModuleCode`, `status` |
| `DpoContact` | Délégué à la protection des données | `type: DpoContactType` |
| `Invitation` | Invitation en attente | rôle, sites/études assignés, `enforceMfa` |
| `Team` / `TeamMember` | Regroupement intra-workspace | — |

Contraintes d'intégrité notables : `WorkspaceUserRepository` garantit **≥ 1 Owner** par workspace ; `UserRepository.findOneByWorkspace` empêche l'assignation cross-workspace.

---

## 5. Identité & sécurité

| Entité | Rôle |
|--------|------|
| `User` | Compte (UserInterface) — soft-delete, MFA, expiration MDP, catégorie |
| `UserSession` | Suivi des sessions (multi-appareils, révocation) |
| `UserBackupCode` | Codes de secours 2FA (hashés) |
| `PasswordHistory` | Anti-réutilisation de mot de passe |
| `PasswordResetToken` | Réinitialisation |
| `AppSetting` | Réglages globaux clé/valeur |
| `AdminNotification` | Notifications admin |

Détails fonctionnels : [security/README.md](/en/security/readme/).

---

## 6. Étude & domaine clinique

| Entité | Rôle |
|--------|------|
| `Study` | Étude clinique (« série ») — soft-delete, `status: StudyStatus` |
| `StudyMember` / `StudyRole` / `StudyPermission` | Membres et droits |
| `StudySite` | Lien étude ↔ centre investigateur |
| `StudyVisit` / `StudyVisitForm` | Calendrier de visites du protocole |
| `StudyFavorite` | Marque-page utilisateur |

`Site`, `SiteMember`, `SiteRole`, `SitePermission`, `SiteDocument` modélisent les centres investigateurs.

---

## 7. Patients & consentement

| Entité | Rôle |
|--------|------|
| `Patient` | Patient — **PII chiffrées**, soft-delete, IPP = `externalId` |
| `StudyPatient` | Inclusion patient ↔ étude (`status: StudyPatientStatus`) |
| `PatientVisitOccurrence` | Instance réelle de visite |
| `PatientErasureLog` | Journal d'effacement RGPD (Art. 17) |
| `ConsentTemplate` / `ConsentVersion` / `PatientConsent` | eConsent (RGPD) |

Les colonnes `externalIdHash` / `dateOfBirthHash` (HMAC déterministe) permettent la recherche exacte sur données chiffrées.

---

## 8. eCRF

Architecture **template (réutilisable) → form (instancié par étude)** avec snapshot de définition.

| Niveau | Entités |
|--------|---------|
| Modèles | `EcrfTemplate` ── `EcrfTemplateSection` ── `EcrfTemplateField` |
| Formulaires vivants | `EcrfForm` ── `EcrfSection` ── `EcrfField` |
| Données saisies | `EcrfRecord` ── `EcrfValue` (repeatIndex pour groupes répétables) |
| Audit & intégrité | `EcrfValueAudit`, `EcrfFieldSnapshot` |
| Annexes | `EcrfAttachment` (token opaque), `EcrfSignature` (contentHash), `EcrfQuery` ── `EcrfQueryMessage` |
| Taxonomie | `EcrfSpecialty`, mapping CDISC SDTM (`SdtmClass`) |

`EcrfFieldType` couvre ~23 types (texte, date, nombre, signature, matrice, champ calculé, galerie…). Les sections sont **auto-référentielles** (arbre parent/enfants).

Repositories d'intégrité : `EcrfFieldRepository.findOneByIdAndForm`, `EcrfAttachmentRepository` scopent l'accès au record/form parent.

---

## 9. Audit & traçabilité

Deux pistes distinctes, **inviolables par chaînage HMAC-SHA256** :

| Entité | Service | Portée |
|--------|---------|--------|
| `ActivityLog` | `ActivityLogService` + `ActivityLogIntegrityService` | Audit clinique/GCP (21 CFR Part 11 §11.10(e)) — workspace-scopé |
| `SecurityAuditLog` | `SecurityAuditLogger` | Audit sécurité (login, lockout, accès refusé…) — sans secret/PII en clair |

Vérification : `verifyChain()` retourne le point de rupture. Commandes : `app:verify-audit-chain`, `app:audit:verify-chain`.

---

## 10. Migrations

- Répertoire `migrations/` — **35 migrations actives** (fenêtre de consolidation 2026-04-25 → 2026-04-30) + **85 archivées** dans `migrations/_archive/`.
- Les policies RLS sont créées par migration (`Version20260429200000`, `Version20260429500000`).

```bash
make sf c="make:migration"                 # générer
make sf c="doctrine:migrations:migrate"    # appliquer
make sf c="doctrine:schema:validate"       # valider la cohérence ORM ↔ schéma
```

> Toute évolution du schéma passe par une migration versionnée (jamais de modification manuelle de la base).
