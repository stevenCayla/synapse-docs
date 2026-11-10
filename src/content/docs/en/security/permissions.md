---
title: "Permissions & access control"
description: "Synapse Medical authorization model: workspace, study and site roles, their permissions, role hierarchy and enforcement by Voters."
sidebar:
  label: "Permissions"
---

> 🌐 [Version française](/security/permissions/) · English version

Authorization relies on **three** independent levels, all bounded by
[workspace isolation](/en/security/best-practices/#-workspace-isolation):

| Level | Carried by | Question |
|-------|-----------|----------|
| **Workspace** | `WorkspaceRole` (enum) | What can the user do **within the workspace**? |
| **Study** | `StudyRole` (DB, hierarchical) | What can they do **on a given study**? |
| **Site** | `SiteRole` (DB) | What can they do **on an investigator site**? |

:::note[Database-modeled roles]
Study and site roles are **not** plain constants: they are entities (`study_role`,
`site_role`) with their permissions (`study_permission`, `site_permission`). Roles with
`is_system = true` are provided by default; **custom roles** can be added per workspace.
:::

## 1. Workspace roles

`WorkspaceRole` — a user has **one** role per workspace. Administration rights come only from that role in the **active** workspace (owner or admin): no account carries `ROLE_ADMIN`, the attribute is granted at runtime by `WorkspaceAdministratorVoter`. `ROLE_SUPER_ADMIN` remains the platform role.

| Role | Code | `ROLE_ADMIN` attribute | Description |
|------|------|--------------|-------------|
| **Owner** | `owner` | yes, in its workspace | Full control **of its workspace**, billing included — one per workspace |
| **Admin** | `admin` | yes, in its workspace | Manages users, studies, integrations — **excluding billing** |
| **Member** | `member` | no | Standard access — scoped to assigned studies |
| **Guest** | `guest` | no | External collaborator — **expires after 90 days** by default |

### Workspace-level capabilities

| Capability | Owner | Admin | Member | Guest |
|------------|:-----:|:-----:|:------:|:-----:|
| Manage billing | ✅ | – | – | – |
| Manage users & invitations | ✅ | ✅ | – | – |
| Manage studies & integrations | ✅ | ✅ | per study | – |
| Access assigned studies | ✅ | ✅ | ✅ | ✅ |

## 2. Study roles

`StudyRole` — **hierarchical** (`hierarchy_level`): a higher role inherits the permissions of
the lower ones.

| Role | Code | Level | `STUDY_VIEW` | `STUDY_MANAGE` | `STUDY_ADMIN` |
|------|------|:-----:|:------------:|:--------------:|:-------------:|
| **Viewer** | `viewer` | 0 | ✅ | – | – |
| **Manager** | `manager` | 1 | ✅ | ✅ | – |
| **Administrator** | `admin` | 2 | ✅ | ✅ | ✅ |

| Permission | Meaning |
|------------|---------|
| `STUDY_VIEW` | View the study and its data |
| `STUDY_MANAGE` | Manage patients and data |
| `STUDY_ADMIN` | Full control of the study |

## 3. Site roles (investigator center)

`SiteRole` — rights on a center and patient data entry.

| Role | Code | `SITE_VIEW` | `SITE_ENTER_DATA` | `SITE_MANAGE_QUERIES` |
|------|------|:-----------:|:-----------------:|:---------------------:|
| **Coordinator** | `coordinator` | ✅ | ✅ | ✅ |
| **Investigator** | `investigator` | ✅ | ✅ | – |
| **Sub-investigator** | `sub_investigator` | ✅ | ✅ | – |
| **CRA / monitor** | `cra` | ✅ | – | ✅ |
| **Data manager** | `data_manager` | ✅ | ✅ | ✅ |

| Permission | Meaning |
|------------|---------|
| `SITE_VIEW` | View the site and its patients |
| `SITE_ENTER_DATA` | Enter and edit patient data |
| `SITE_MANAGE_QUERIES` | Manage queries and discrepancies |

### Queries raised by a monitor (read-only role)

Raising, closing and following a query needs no data-entry right: `STUDY_QUERY_RAISE` (`StudyVoter`, subject: the inclusion) is granted

- to the study manager and administrator, as before, on the patients they can see;
- to the study **viewer** holding the **CRA / monitor** site role (`cra`) on **the patient's site**. A viewer with no site assignment has no such role and gets nothing (most restrictive reading).

| Action | Manager / administrator | Viewer CRA on the patient's site | Other viewer |
|--------|:-----------------------:|:--------------------------------:|:------------:|
| See the queries | ✅ | ✅ (their sites) | ✅ |
| Raise a query (field, eye) | ✅ | ✅ | – |
| Answer | ✅ | – | – |
| Close | ✅ | ✅ | – |
| Cancel (raised in error) | ✅ | ✅ (their own) | – |
| Sign (the "sponsor / CRA review" meaning only) | ✅ | ✅ | – |
| Enter data, sign as investigator or data manager, lock, include, change a status, import | ✅ (per role) | – | – |

## 4. Technical enforcement

Authorization is checked **server-side** on every access:

| Component | Role |
|-----------|------|
| `StudyVoter` | Attributes `STUDY_VIEW` / `STUDY_MANAGE` / `STUDY_ADMIN`, and `STUDY_QUERY_RAISE` (subject: `StudyPatient`) |
| `StudyAccessService` | `canView()` / `canManage()` / `canAdmin()` — resolves the effective role |
| `SiteAccessService` | Rights at the investigator-site level; `canRaiseQuery()` for the queries |
| `WorkspaceAccess` | Tells the platform level (`ROLE_SUPER_ADMIN`, created by `app:admin:create`) from the workspace level (the non expired `WorkspaceUser` role on the workspace of the resource) |
| Symfony hierarchy | `ROLE_SUPER_ADMIN` (platform super administrator) and the Owner **of the resource's workspace** bypass the Voters; the owner of a workspace never receives `ROLE_SUPER_ADMIN` nor any right on another workspace |

```php
// Access check via the Voter
$this->denyAccessUnlessGranted(StudyVoter::MANAGE, $study);

// or directly via the service
if (!$this->studyAccess->canManage($study, $user)) {
    throw $this->createAccessDeniedException();
}
```

:::caution[Always combine role + workspace]
A role only grants access **within the active workspace**. Per the
[golden rule](/en/security/best-practices/#-workspace-isolation), never load a resource by its
ID alone: always filter by `workspace_id`.
:::

See also: [Security best practices](/en/security/best-practices/) ·
[eCRF module](/en/architecture/overview/#6-ecrf-module).
