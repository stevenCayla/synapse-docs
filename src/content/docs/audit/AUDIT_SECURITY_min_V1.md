---
title: "Audit de sécurité — EDC Multi-Tenant"
description: "// Coller le code actuel du PermissionChecker ici"
---

**Date d’audit** : {{DATE}}  
**Auditeur** : analyse statique automatisée du code source  
**Projet** : {{PROJECT_NAME}}  
**Stack** : Symfony 8 / PHP 8 / PostgreSQL / FrankenPHP  

---

## 1. Résumé exécutif

### 1.1 Score global

| Catégorie | Score | Statut |
|---|---:|---|
| Configuration sécurité | /10 | 🟢🟡🔴 |
| Voters & RBAC | /10 | 🟢🟡🔴 |
| PermissionChecker | /10 | 🟢🟡🔴 |
| Isolation multi-tenant | /10 | 🟢🟡🔴 |
| Audit trail | /10 | 🟢🟡🔴 |
| Tests de sécurité | /10 | 🟢🟡🔴 |

**Légende** : 🟢 Conforme · 🟡 Partiel · 🔴 Non conforme

### 1.2 Vulnérabilités critiques détectées

| # | Vulnérabilité | Impact | Fichier |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

---

## 2. Configuration Symfony (`security.yaml`)

### 2.1 État des lieux

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| `enable_authenticator_manager: true` | ☐ | ☐ |  |
| Firewalls configurés (`main`, `api`) | ☐ | ☐ |  |
| `access_control` défini | ☐ | ☐ |  |
| Providers (`entity` / custom) | ☐ | ☐ |  |
| Password hashers configurés | ☐ | ☐ |  |
| Voters taggés `security.voter` | ☐ | ☐ |  |
| `role_hierarchy` défini | ☐ | ☐ |  |

### 2.2 Contenu actuel de `security.yaml`

```yaml
# Coller le contenu actuel ici
```

### 2.3 Recommandations

1.  
2.  
3.  

---

## 3. Analyse des voters

### 3.1 Matrice de présence

| Voter | Fichier | Existant | Conforme | Délègue au Checker | Multi-Tenant |
|---|---|---|---|---|---|
| `StudyVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `SiteVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `FormDataVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `QueryVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `TeamMemberVoter` |  | ☐ | ☐ | ☐ | ☐ |

### 3.2 Analyse détaillée par voter

#### `StudyVoter`

- **Fichier** :
- **Attributs déclarés** :

**Méthode `supports()`**
- Filtre sur l’attribut
- Filtre sur le type (`instanceof Study`)

**Méthode `voteOnAttribute()`**
- Vérifie l’authentification
- Délègue au `PermissionChecker`
- N’embarque aucune logique métier directe

**Problèmes détectés**
- 

**Code corrigé proposé**
```php
// Code proposé ici
```

---

#### `SiteVoter`

- **Fichier** :
- **Attributs déclarés** :

**Méthode `supports()`**
- Filtre sur l’attribut
- Filtre sur le type (`instanceof Site`)

**Méthode `voteOnAttribute()`**
- Vérifie l’authentification
- Délègue au `PermissionChecker`
- N’embarque aucune logique métier directe

**Problèmes détectés**
- 

**Code corrigé proposé**
```php
// Code proposé ici
```

---

#### `FormDataVoter`

- **Fichier** :
- **Attributs déclarés** :

**Méthode `supports()`**
- Filtre sur l’attribut
- Filtre sur le type (`instanceof FormData`)

**Méthode `voteOnAttribute()`**
- Vérifie l’authentification
- Délègue au `PermissionChecker`
- N’embarque aucune logique métier directe

**Problèmes détectés**
- 

**Code corrigé proposé**
```php
// Code proposé ici
```

---

#### `QueryVoter`

- **Fichier** :
- **Attributs déclarés** :

**Méthode `supports()`**
- Filtre sur l’attribut
- Filtre sur le type (`instanceof Query`)

**Méthode `voteOnAttribute()`**
- Vérifie l’authentification
- Délègue au `PermissionChecker`
- N’embarque aucune logique métier directe

**Problèmes détectés**
- 

**Code corrigé proposé**
```php
// Code proposé ici
```

---

#### `TeamMemberVoter`

- **Fichier** :
- **Attributs déclarés** :

**Méthode `supports()`**
- Filtre sur l’attribut
- Filtre sur le type (`instanceof TeamMember`)

**Méthode `voteOnAttribute()`**
- Vérifie l’authentification
- Délègue au `PermissionChecker`
- N’embarque aucune logique métier directe

**Problèmes détectés**
- 

**Code corrigé proposé**
```php
// Code proposé ici
```

---

## 4. PermissionChecker centralisé

### 4.1 État des lieux

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Service dédié existant | ☐ | ☐ |  |
| Injecté dans tous les voters | ☐ | ☐ |  |
| Requête RBAC complète (`User → TeamMember → StudyRole → RolePermission`) | ☐ | ☐ |  |
| Filtre `organization_id` appliqué | ☐ | ☐ |  |
| Cache des permissions | ☐ | ☐ |  |
| Retourne `false` par défaut | ☐ | ☐ |  |
| Gestion des accès expirés (`expires_at`) | ☐ | ☐ |  |

### 4.2 Code actuel

```php
// Coller le code actuel du PermissionChecker ici
```

### 4.3 Code corrigé proposé

```php
// Code corrigé ici
```

### 4.4 Requête SQL générée

```sql
-- Requête DQL ou SQL générée par le PermissionChecker
-- Vérifier la présence de organization_id dans les JOIN / WHERE
```

---

## 5. Isolation multi-tenant

### 5.1 `OrganizationContext`

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Service `OrganizationContext` existant | ☐ | ☐ |  |
| Initialisé à l’authentification | ☐ | ☐ |  |
| Disponible dans tous les voters / services | ☐ | ☐ |  |
| Validation de l’appartenance `user ↔ org` | ☐ | ☐ |  |

### 5.2 Row Level Security (PostgreSQL)

| Table | RLS activé | Politique définie | Testé |
|---|---|---|---|
| `studies` | ☐ | ☐ | ☐ |
| `sites` | ☐ | ☐ | ☐ |
| `form_data` | ☐ | ☐ | ☐ |
| `team_members` | ☐ | ☐ | ☐ |
| `audit_logs` | ☐ | ☐ | ☐ |

### 5.3 Tests de pénétration logique

| Scénario | Résultat | Fichier de test |
|---|---|---|
| User Org A accède à une `Study` de l’Org B | ☐ Pass / ☐ Fail |  |
| User Org A modifie un `FormData` de l’Org B | ☐ Pass / ☐ Fail |  |
| User Org A liste les `Sites` de l’Org B | ☐ Pass / ☐ Fail |  |
| Modification directe du JWT / `org_id` | ☐ Pass / ☐ Fail |  |

---

## 6. Audit trail

### 6.1 Conformité FDA 21 CFR Part 11

| Exigence | Implémenté | Commentaire | Référence |
|---|---|---|---|
| Immutabilité des logs | ☐ |  | 11.10(e) |
| Horodatage certifié | ☐ |  | 11.10(b) |
| Identification utilisateur | ☐ |  | 11.10(a) |
| Ancienne / nouvelle valeur | ☐ |  | 11.10(e) |
| Justification des modifications | ☐ |  | 11.10(e) |
| Traçabilité IP | ☐ |  | 11.10(d) |
| Audit des changements de rôles | ☐ |  | 11.10(g) |
| Export par organisation | ☐ |  | 11.10(f) |

### 6.2 Événements capturés

| Événement | Journalisé | Détails capturés |
|---|---|---|
| Connexion / déconnexion | ☐ |  |
| Accès refusé | ☐ |  |
| Modification de données | ☐ |  |
| Validation de données | ☐ |  |
| Déverrouillage de formulaire | ☐ |  |
| Attribution / retrait de rôle | ☐ |  |
| Changement de permission | ☐ |  |

---

## 7. Modèle de données RBAC

### 7.1 Tables et relations

| Table | Existe | `organization_id` | Index composite | Contraintes |
|---|---|---|---|---|
| `organizations` | ☐ | N/A | N/A |  |
| `users` | ☐ | ☐ |  |  |
| `studies` | ☐ | ☐ | ☐ (`organization_id`, `id`) |  |
| `sites` | ☐ | ☐ | ☐ (`study_id`, `site_code`) |  |
| `teams` | ☐ | ☐ |  |  |
| `study_roles` | ☐ | ☐ |  |  |
| `permissions` | ☐ | N/A |  |  |
| `role_permissions` | ☐ | N/A |  |  |
| `team_members` | ☐ | ☐ | ☐ (`user_id`, `team_id`, `role_id`) |  |
| `audit_logs` | ☐ | ☐ | ☐ (`organization_id`, `entity_type`, `entity_id`) |  |

### 7.2 Migrations requises

```sql
-- Coller les migrations SQL nécessaires ici
```

---

## 8. Tests de sécurité

### 8.1 Tests existants

| Fichier | Couverture | Scénarios |
|---|---|---|
|  |  |  |

### 8.2 Tests manquants critiques

| # | Scénario de test | Priorité |
|---|---|---|
| 1 | Utilisateur sans rôle → accès refusé à une étude | Critique |
| 2 | Utilisateur Org A → données Org B inaccessibles | Critique |
| 3 | Rôle `Viewer` → écriture impossible | Critique |
| 4 | Rôle expiré → accès refusé | Majeur |
| 5 | Tentative d’accès refusée → audit trail | Majeur |
| 6 | Attribution de rôle → audit trail | Majeur |
| 7 | Modification directe de l’URL → accès refusé | Critique |
| 8 | Accès concurrent → aucune corruption | Majeur |

### 8.3 Code de test proposé

```php
// Tests PHPUnit critiques à implémenter
```

---

## 9. Plan d’implémentation

### 9.1 Phase 1 — Critique (sécurité immédiate)

| # | Action | Fichier(s) | Effort |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

### 9.2 Phase 2 — Majeur (conformité réglementaire)

| # | Action | Fichier(s) | Effort |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

### 9.3 Phase 3 — Facultatif (optimisation)

| # | Action | Fichier(s) | Effort |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

---

## Annexe B — Références réglementaires

- **FDA 21 CFR Part 11** — *Electronic Records; Electronic Signatures*  
  https://www.ecfr.gov/current/title-21/part-11
- **RGPD — Article 25** : *Data Protection by Design and by Default*
- **ICH E6(R2)** : *Good Clinical Practice* — exigences d’audit trail
- **ISO 27001 A.9** : *Access Control*
- **HDS §6.2.3** : revue des droits d’accès

---

## Annexe C — Glossaire

| Terme | Définition |
|---|---|
| RBAC | Role-Based Access Control |
| RLS | Row Level Security |
| EDC | Electronic Data Capture |
| CRA | Clinical Research Associate |
| DM | Data Manager |
