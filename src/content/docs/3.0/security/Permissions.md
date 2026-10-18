---
title: Permissions & contrôle d'accès
description: "Modèle d'autorisation de Synapse Medical : rôles de workspace,
  d'étude et de site, permissions associées, hiérarchie des rôles et application
  par les Voters."
sidebar:
  label: Permissions
slug: 3.0/security/permissions
---

> 🌐 Version française · [English version](/3.0/en/security/permissions/)

L'autorisation repose sur **trois niveaux** indépendants, tous bornés par l'[isolation par
workspace](/3.0/security/best-practices/#-isolation-par-workspace) :

| Niveau | Porté par | Question |
|--------|-----------|----------|
| **Workspace** | `WorkspaceRole` (enum) | Que peut faire l'utilisateur **dans le workspace** ? |
| **Étude** | `StudyRole` (BDD, hiérarchique) | Que peut-il faire **sur une étude** donnée ? |
| **Site** | `SiteRole` (BDD) | Que peut-il faire **sur un centre investigateur** ? |

:::note[Rôles modélisés en base]
Les rôles d'étude et de site ne sont **pas** de simples constantes : ce sont des entités
(`study_role`, `site_role`) avec leurs permissions (`study_permission`, `site_permission`).
Les rôles `is_system = true` sont fournis par défaut ; des **rôles personnalisés** peuvent
être ajoutés par workspace.
:::

## 1. Rôles de workspace

`WorkspaceRole` — un utilisateur a **un** rôle par workspace, mappé à un rôle Symfony.

| Rôle | Code | Rôle Symfony | Description |
|------|------|--------------|-------------|
| **Owner** | `owner` | `ROLE_SUPER_ADMIN` | Contrôle total, **facturation incluse** — un seul par workspace |
| **Admin** | `admin` | `ROLE_ADMIN` | Gère utilisateurs, études, intégrations — **hors facturation** |
| **Member** | `member` | `ROLE_USER` | Accès standard — limité aux études assignées |
| **Guest** | `guest` | `ROLE_USER` | Collaborateur externe — **expire après 90 jours** par défaut |

### Capacités au niveau workspace

| Capacité | Owner | Admin | Member | Guest |
|----------|:-----:|:-----:|:------:|:-----:|
| Gérer la facturation | ✅ | – | – | – |
| Gérer les utilisateurs & invitations | ✅ | ✅ | – | – |
| Gérer les études & intégrations | ✅ | ✅ | selon l'étude | – |
| Accéder aux études assignées | ✅ | ✅ | ✅ | ✅ |

## 2. Rôles d'étude

`StudyRole` — **hiérarchique** (`hierarchy_level`) : un rôle supérieur hérite des permissions
des rôles inférieurs.

| Rôle | Code | Niveau | `STUDY_VIEW` | `STUDY_MANAGE` | `STUDY_ADMIN` |
|------|------|:------:|:------------:|:--------------:|:-------------:|
| **Lecteur** | `viewer` | 0 | ✅ | – | – |
| **Gestionnaire** | `manager` | 1 | ✅ | ✅ | – |
| **Administrateur** | `admin` | 2 | ✅ | ✅ | ✅ |

| Permission | Signification |
|------------|---------------|
| `STUDY_VIEW` | Voir l'étude et ses données |
| `STUDY_MANAGE` | Gérer les patients et les données |
| `STUDY_ADMIN` | Contrôle total de l'étude |

## 3. Rôles de site (centre investigateur)

`SiteRole` — droits sur un centre et la saisie de données patient.

| Rôle | Code | `SITE_VIEW` | `SITE_ENTER_DATA` | `SITE_MANAGE_QUERIES` |
|------|------|:-----------:|:-----------------:|:---------------------:|
| **Coordinateur** | `coordinator` | ✅ | ✅ | ✅ |
| **Investigateur** | `investigator` | ✅ | ✅ | – |
| **Sous-investigateur** | `sub_investigator` | ✅ | ✅ | – |
| **ARC moniteur** | `cra` | ✅ | – | ✅ |
| **Data manager** | `data_manager` | ✅ | ✅ | ✅ |

| Permission | Signification |
|------------|---------------|
| `SITE_VIEW` | Voir le site et ses patients |
| `SITE_ENTER_DATA` | Saisir et modifier les données patient |
| `SITE_MANAGE_QUERIES` | Gérer les requêtes et discordances |

## 4. Application technique

L'autorisation est vérifiée **côté serveur** à chaque accès :

| Composant | Rôle |
|-----------|------|
| `StudyVoter` | Attributs `STUDY_VIEW` / `STUDY_MANAGE` / `STUDY_ADMIN` |
| `StudyAccessService` | `canView()` / `canManage()` / `canAdmin()` — résout le rôle effectif |
| `SiteAccessService` | Droits au niveau centre investigateur |
| Hiérarchie Symfony | `ROLE_SUPER_ADMIN` (Owner) **court-circuite** les Voters |

```php
// Vérification d'accès via le Voter
$this->denyAccessUnlessGranted(StudyVoter::MANAGE, $study);

// ou directement via le service
if (!$this->studyAccess->canManage($study, $user)) {
    throw $this->createAccessDeniedException();
}
```

:::caution[Toujours combiner rôle + workspace]
Un rôle n'accorde l'accès qu'**au sein du workspace actif**. Conformément à la
[règle d'or](/3.0/security/best-practices/#-isolation-par-workspace), ne jamais charger une
ressource par son ID seul : toujours filtrer par `workspace_id`.
:::

Voir aussi : [Bonnes pratiques de sécurité](/3.0/security/best-practices/) ·
[Module eCRF](/3.0/architecture/overview/#6-module-ecrf).
