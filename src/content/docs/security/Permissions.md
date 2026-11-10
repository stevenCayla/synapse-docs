---
title: "Permissions & contrôle d'accès"
description: "Modèle d'autorisation de Synapse Medical : rôles de workspace, d'étude et de site, permissions associées, hiérarchie des rôles et application par les Voters."
sidebar:
  label: "Permissions"
---

> 🌐 Version française · [English version](/en/security/permissions/)

L'autorisation repose sur **trois niveaux** indépendants, tous bornés par l'[isolation par
workspace](/security/best-practices/#-isolation-par-workspace) :

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

`WorkspaceRole` — un utilisateur a **un** rôle par workspace. Les droits d'administration viennent uniquement de ce rôle dans le workspace **actif** (owner ou admin) : aucun compte ne porte `ROLE_ADMIN`, l'attribut est accordé à l'exécution par `WorkspaceAdministratorVoter`. `ROLE_SUPER_ADMIN` reste le rôle de la plateforme.

| Rôle | Code | Attribut `ROLE_ADMIN` | Description |
|------|------|--------------|-------------|
| **Owner** | `owner` | oui, dans son workspace | Contrôle total **de son workspace**, facturation incluse — au moins un par workspace (copropriétaires possibles) |
| **Admin** | `admin` | oui, dans son workspace | Gère utilisateurs, études, intégrations — **hors facturation** |
| **Member** | `member` | non | Accès standard — limité aux études assignées |
| **Guest** | `guest` | non | Collaborateur externe — **expire après 90 jours** par défaut |

### Capacités au niveau workspace

| Capacité | Owner | Admin | Member | Guest |
|----------|:-----:|:-----:|:------:|:-----:|
| Gérer la facturation | ✅ | – | – | – |
| Gérer les utilisateurs & invitations | ✅ | ✅ | – | – |
| Gérer les études & intégrations | ✅ | ✅ | selon l'étude | – |
| Accéder aux études assignées | ✅ | ✅ | ✅ | ✅ |

### Changer le rôle d'un membre

Onglet Membres du workspace (`WorkspaceRoleChanger`, routes `app_settings_workspace_user_role` et `app_settings_workspace_user_transfer`). Chaque changement exige un **motif**,
une confirmation dans la modale de l'application,
une entrée `workspace.member.role_changed` dans l'historique du workspace (rôle avant/après, auteur, motif) et, dès que le rôle owner est en jeu,
une entrée du journal d'audit sécurité (`workspace.owner.granted`, `workspace.owner.revoked`, `workspace.ownership.transferred`).
Les droits s'appliquent immédiatement (aucun rôle global n'est stocké).

| Qui | Ce qu'il peut faire |
|-----|---------------------|
| Owner du workspace, super-administrateur de la plateforme | Passer **un autre membre** en member, admin, guest (avec expiration, 90 jours par défaut) ou owner (copropriétaire) |
| Owner | Transférer la propriété à un membre, en restant admin ou member |
| Admin | Seulement member → guest (avec expiration) et guest → member ; jamais attribuer ni retirer admin ou owner |

Refus expliqués : personne ne change son propre rôle
(sauf en transférant la propriété, ou un owner qui se retire tant qu'un autre owner reste) ; le dernier owner ne peut être ni rétrogradé ni retiré ; un guest ou un compte de service ne devient pas owner (un compte de service n'est pas non plus admin) ;
une cible hors du workspace donne un 404. Retirer un membre exige aussi un motif, conservé dans l'historique (`workspace.member.removed`).

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

### Discordances d'un ARC (rôle lecteur)

Lever, clôturer et suivre une discordance n'exige pas de droit de saisie : `STUDY_QUERY_RAISE` (`StudyVoter`, sujet : l'inclusion) est accordé

- au gestionnaire et à l'administrateur de l'étude, comme avant, sur les patients qu'ils peuvent voir ;
- au **lecteur** de l'étude qui a le rôle de site **ARC moniteur** (`cra`) sur le centre **du patient**. Un lecteur sans rattachement à un centre n'a pas ce rôle : il n'obtient rien (lecture la plus restrictive).

| Action | Gestionnaire / administrateur | Lecteur ARC du centre du patient | Autre lecteur |
|--------|:-----------------------------:|:--------------------------------:|:-------------:|
| Voir les discordances | ✅ | ✅ (ses centres) | ✅ |
| Lever une discordance (champ, œil) | ✅ | ✅ | – |
| Répondre | ✅ | – | – |
| Clôturer | ✅ | ✅ | – |
| Annuler (levée par erreur) | ✅ | ✅ (les siennes) | – |
| Signer (signification « Vérification sponsor / ARC » seule) | ✅ | ✅ | – |
| Saisir, signer en investigateur ou data manager, verrouiller, inclure, changer un statut, importer | ✅ (selon le rôle) | – | – |

## 4. Application technique

L'autorisation est vérifiée **côté serveur** à chaque accès :

| Composant | Rôle |
|-----------|------|
| `StudyVoter` | Attributs `STUDY_VIEW` / `STUDY_MANAGE` / `STUDY_ADMIN`, et `STUDY_QUERY_RAISE` (sujet : `StudyPatient`) |
| `StudyAccessService` | `canView()` / `canManage()` / `canAdmin()` — résout le rôle effectif |
| `SiteAccessService` | Droits au niveau centre investigateur ; `canRaiseQuery()` pour les discordances |
| `WorkspaceAccess` | Distingue le niveau plateforme (`ROLE_SUPER_ADMIN`, créé par `app:admin:create`) du niveau workspace (rôle `WorkspaceUser`, non expiré, du workspace de la ressource) |
| Hiérarchie Symfony | `ROLE_SUPER_ADMIN` (super-administrateur de la **plateforme**) et l'Owner **du workspace de la ressource** court-circuitent les Voters ; l'Owner d'un workspace n'obtient jamais `ROLE_SUPER_ADMIN` ni de droit sur un autre workspace |

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
[règle d'or](/security/best-practices/#-isolation-par-workspace), ne jamais charger une
ressource par son ID seul : toujours filtrer par `workspace_id`.
:::

Voir aussi : [Bonnes pratiques de sécurité](/security/best-practices/) ·
[Module eCRF](/architecture/overview/#6-module-ecrf).

## 5. Rôle plateforme : Affaires réglementaires

`ROLE_REGULATORY_AFFAIRS` est un rôle **de niveau plateforme**, distinct des rôles de workspace ci-dessus. Il donne accès à l'administration des packs réglementaires (`/admin/regulatory-packs`) et **à rien d'autre** : aucune donnée de workspace, d'étude ou de patient (il hérite uniquement de `ROLE_USER`, et l'accès aux données reste porté par l'appartenance au workspace et par les Voters).

| Point | Règle |
|-------|-------|
| Attribution | Par un super administrateur uniquement, depuis le tiroir utilisateur (« Affaires réglementaires »), pas depuis le formulaire d'édition |
| Hiérarchie | `ROLE_SUPER_ADMIN` inclut `ROLE_REGULATORY_AFFAIRS` ; `ROLE_ADMIN` (admin de workspace) ne l'inclut pas |
| Modifier / publier | Réservé à ce rôle et aux super administrateurs |
| Versions | Modifier une exigence d'une version publiée crée une version `YYYY.MM-draft` ; la version publiée reste en vigueur et les études gardent la version appliquée |
| Publication | Cas de test rejoués côté serveur (tous réussis), sources vérifiées, signature électronique avec mot de passe (`RegulatoryPackSignature`) |
| Journal | Les actions de plateforme n'ont pas de workspace : elles sont écrites dans `platform_activity_log` (table à chaîne de hachage HMAC, sans donnée de workspace), pas dans `activity_log` |
| Impact | Seule lecture inter-workspaces : identifiant d'étude, nom du workspace et statut des études qui ont appliqué une version, jamais de donnée d'étude |
