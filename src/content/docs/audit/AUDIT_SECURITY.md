---
title: "Rapport d’audit de sécurité — EDC Multi-Tenant"
description: "Le présent rapport a pour objectif d’évaluer le niveau de sécurité d’une application EDC multi-tenant reposant sur une architecture Symfony / PostgreSQL,…"
---

**Date d’audit** : {{DATE}}  
**Auditeur** : analyse statique automatisée du code source  
**Projet** : {{PROJECT_NAME}}  
**Version du rapport** : 2.0  
**Stack** : Symfony 8 / PHP 8 / PostgreSQL / FrankenPHP  

---

## 1. Synthèse exécutive

Le présent rapport a pour objectif d’évaluer le niveau de sécurité d’une application **EDC multi-tenant** reposant sur une architecture **Symfony / PostgreSQL**, avec un focus particulier sur l’**isolation des tenants**, le **contrôle d’accès**, la **traçabilité**, ainsi que les mécanismes de **sécurisation applicative** et **opérationnelle**.

L’analyse couvre non seulement les mécanismes d’**autorisation** déjà identifiés comme structurants dans le projet (RBAC, voters, `PermissionChecker`, `OrganizationContext`, audit trail), mais également les dimensions souvent attendues dans un **rapport d’audit professionnel** : authentification, gestion de session, sécurité HTTP, dépendances, secrets, journalisation sécurité, gouvernance des droits, protection des données, et résilience.

### 1.1 Score global

| Domaine évalué | Score | Statut |
|---|---:|---|
| Configuration sécurité Symfony | /10 | 🟢🟡🔴 |
| Authentification et gestion de session | /10 | 🟢🟡🔴 |
| Voters & RBAC | /10 | 🟢🟡🔴 |
| PermissionChecker centralisé | /10 | 🟢🟡🔴 |
| Isolation multi-tenant | /10 | 🟢🟡🔴 |
| Sécurité HTTP / applicative | /10 | 🟢🟡🔴 |
| Audit trail et journalisation | /10 | 🟢🟡🔴 |
| Protection des données sensibles | /10 | 🟢🟡🔴 |
| Dépendances et supply chain | /10 | 🟢🟡🔴 |
| Infrastructure et déploiement | /10 | 🟢🟡🔴 |
| Tests de sécurité | /10 | 🟢🟡🔴 |
| Gouvernance des droits | /10 | 🟢🟡🔴 |

**Légende** : 🟢 Conforme · 🟡 Partiel · 🔴 Non conforme

### 1.2 Niveau de risque global

- **Risque résiduel estimé** : Faible / Modéré / Élevé / Critique  
- **Principaux facteurs de risque** :  
  1.  
  2.  
  3.  

### 1.3 Vulnérabilités critiques détectées

| # | Vulnérabilité | Gravité | Impact métier | Fichier / Composant |
|---|---|---|---|---|
| 1 |  | Critique |  |  |
| 2 |  | Critique |  |  |
| 3 |  | Majeure |  |  |

### 1.4 Recommandations prioritaires

1.  
2.  
3.  

---

## 2. Périmètre, objectifs et méthodologie

### 2.1 Objectifs de l’audit

Cet audit vise à :

- évaluer la robustesse du contrôle d’accès et de l’isolation multi-tenant ;
- identifier les vulnérabilités ou faiblesses de conception, d’implémentation ou de configuration ;
- mesurer le niveau de conformité vis-à-vis des exigences réglementaires et des bonnes pratiques ;
- proposer un plan de remédiation priorisé.

### 2.2 Périmètre analysé

**Composants inclus dans le périmètre** :

- configuration Symfony (`security.yaml`, firewalls, `access_control`, providers) ;
- mécanismes d’authentification et gestion de session ;
- voters, modèle RBAC, `PermissionChecker`, `OrganizationContext` ;
- contrôleurs, endpoints, accès directs aux ressources ;
- isolation multi-tenant au niveau applicatif et base de données ;
- audit trail, journalisation sécurité, événements sensibles ;
- schéma de données RBAC et politiques PostgreSQL (RLS le cas échéant) ;
- tests de sécurité existants et manquants ;
- gestion des secrets, dépendances, CI/CD, déploiement et durcissement ;
- protection des données sensibles et exigences de conformité applicables.

**Hors périmètre** :

- tests d’intrusion réseau externes ;
- revue exhaustive du code hors fonctionnalités de sécurité ;
- audit physique, audit du poste utilisateur, ou audit tiers non accessibles.

### 2.3 Méthodologie

L’analyse s’appuie sur les méthodes suivantes :

- revue de configuration ;
- revue de code ciblée ;
- revue d’architecture et des flux d’accès ;
- tests logiques de séparation des tenants ;
- vérifications de conformité ;
- analyse des scénarios de menace probables.

### 2.4 Échelle de criticité

| Niveau | Description |
|---|---|
| Critique | Exploitation probable ou triviale, impact majeur sur la confidentialité, l’intégrité ou l’isolation des données |
| Majeur | Faiblesse importante nécessitant correction prioritaire |
| Modéré | Écart notable, risque contextualisé |
| Mineur | Amélioration recommandée ou dette de sécurité |

---

## 3. Configuration Symfony (`security.yaml`)

### 3.1 État des lieux

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| `enable_authenticator_manager: true` | ☐ | ☐ |  |
| Firewalls configurés (`main`, `api`) | ☐ | ☐ |  |
| `access_control` défini | ☐ | ☐ |  |
| Providers (`entity` / custom) | ☐ | ☐ |  |
| Password hashers configurés | ☐ | ☐ |  |
| Voters taggés `security.voter` | ☐ | ☐ |  |
| `role_hierarchy` défini | ☐ | ☐ |  |
| Environnement de production non verbeux | ☐ | ☐ |  |
| Endpoints de debug désactivés en production | ☐ | ☐ |  |

### 3.2 Contenu actuel de `security.yaml`

```yaml
# Coller le contenu actuel ici
```

### 3.3 Analyse

- **Constats** :  
- **Risques identifiés** :  
- **Éléments conformes** :  

### 3.4 Recommandations

1.  
2.  
3.  

---

## 4. Authentification et gestion de session

### 4.1 État des lieux

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Politique de mot de passe formalisée | ☐ | ☐ |  |
| MFA / 2FA pour comptes sensibles | ☐ | ☐ |  |
| Protection contre le brute force | ☐ | ☐ |  |
| Réinitialisation de mot de passe sécurisée | ☐ | ☐ |  |
| Durée de session maîtrisée | ☐ | ☐ |  |
| Rotation / invalidation de session | ☐ | ☐ |  |
| Gestion de logout sur révocation | ☐ | ☐ |  |
| JWT signés et correctement expirés | ☐ | ☐ |  |
| Refresh tokens maîtrisés | ☐ | ☐ |  |
| Révocation des jetons possible | ☐ | ☐ |  |

### 4.2 Points d’analyse

- Mécanisme d’authentification utilisé :  
- Gestion des comptes inactifs / verrouillés :  
- Gestion des accès administrateurs :  
- Durée de validité des tokens / sessions :  
- Surface d’attaque liée à l’authentification :  

### 4.3 Recommandations

1.  
2.  
3.  

---

## 5. Analyse des voters et du RBAC

### 5.1 Matrice de présence

| Voter | Fichier | Existant | Conforme | Délègue au Checker | Multi-Tenant |
|---|---|---|---|---|---|
| `StudyVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `SiteVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `FormDataVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `QueryVoter` |  | ☐ | ☐ | ☐ | ☐ |
| `TeamMemberVoter` |  | ☐ | ☐ | ☐ | ☐ |

### 5.2 Analyse détaillée par voter

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

### 5.3 Observations transverses RBAC

- Principe du moindre privilège : ☐ Oui / ☐ Non  
- Séparation des rôles d’administration et d’exploitation : ☐ Oui / ☐ Non  
- Rôles temporaires / expirables : ☐ Oui / ☐ Non  
- Recertification périodique des droits : ☐ Oui / ☐ Non  

---

## 6. PermissionChecker centralisé

### 6.1 État des lieux

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Service dédié existant | ☐ | ☐ |  |
| Injecté dans tous les voters | ☐ | ☐ |  |
| Requête RBAC complète (`User → TeamMember → StudyRole → RolePermission`) | ☐ | ☐ |  |
| Filtre `organization_id` appliqué | ☐ | ☐ |  |
| Cache des permissions | ☐ | ☐ |  |
| Retourne `false` par défaut | ☐ | ☐ |  |
| Gestion des accès expirés (`expires_at`) | ☐ | ☐ |  |
| Journalisation des refus sensibles | ☐ | ☐ |  |

### 6.2 Code actuel

```php
// Coller le code actuel du PermissionChecker ici
```

### 6.3 Analyse

- **Forces** :  
- **Faiblesses** :  
- **Risques** :  

### 6.4 Code corrigé proposé

```php
// Code corrigé ici
```

### 6.5 Requête SQL générée

```sql
-- Requête DQL ou SQL générée par le PermissionChecker
-- Vérifier la présence de organization_id dans les JOIN / WHERE
```

---

## 7. Contrôle d’accès au niveau des routes, contrôleurs et endpoints

### 7.1 Vérifications à réaliser

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Routes sensibles protégées | ☐ | ☐ |  |
| Contrôleurs utilisant `#[IsGranted]` ou équivalent | ☐ | ☐ |  |
| Cohérence entre sécurité HTTP et sécurité métier | ☐ | ☐ |  |
| Endpoints API sans exposition non contrôlée | ☐ | ☐ |  |
| Webhooks / endpoints internes sécurisés | ☐ | ☐ |  |
| Absence d’accès direct aux ressources par simple ID | ☐ | ☐ |  |

### 7.2 Scénarios de contrôle

| Scénario | Résultat | Commentaire |
|---|---|---|
| Accès direct à une ressource par URL modifiée | ☐ Pass / ☐ Fail |  |
| Appel API sans rôle métier adéquat | ☐ Pass / ☐ Fail |  |
| Contrôleur protégé mais repository non filtré | ☐ Pass / ☐ Fail |  |
| Endpoint technique accessible depuis l’extérieur | ☐ Pass / ☐ Fail |  |

---

## 8. Isolation multi-tenant

### 8.1 `OrganizationContext`

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Service `OrganizationContext` existant | ☐ | ☐ |  |
| Initialisé à l’authentification | ☐ | ☐ |  |
| Disponible dans tous les voters / services | ☐ | ☐ |  |
| Validation de l’appartenance `user ↔ org` | ☐ | ☐ |  |
| Revalidation côté persistance / requête | ☐ | ☐ |  |

### 8.2 Row Level Security (PostgreSQL)

| Table | RLS activé | Politique définie | Testé |
|---|---|---|---|
| `studies` | ☐ | ☐ | ☐ |
| `sites` | ☐ | ☐ | ☐ |
| `form_data` | ☐ | ☐ | ☐ |
| `team_members` | ☐ | ☐ | ☐ |
| `audit_logs` | ☐ | ☐ | ☐ |

### 8.3 Risques d’évasion du tenanting

| Point de contrôle | Vérifié | Commentaire |
|---|---|---|
| Requêtes SQL natives revues | ☐ |  |
| Vues / fonctions SQL vérifiées | ☐ |  |
| Compte DB applicatif non privilégié | ☐ |  |
| Migrations non contournantes | ☐ |  |
| Jointures multi-organisations impossibles | ☐ |  |

### 8.4 Tests de pénétration logique

| Scénario | Résultat | Fichier de test |
|---|---|---|
| User Org A accède à une `Study` de l’Org B | ☐ Pass / ☐ Fail |  |
| User Org A modifie un `FormData` de l’Org B | ☐ Pass / ☐ Fail |  |
| User Org A liste les `Sites` de l’Org B | ☐ Pass / ☐ Fail |  |
| Modification directe du JWT / `org_id` | ☐ Pass / ☐ Fail |  |
| Appel API inter-tenant via ID deviné | ☐ Pass / ☐ Fail |  |

---

## 9. Sécurité HTTP et protections applicatives

### 9.1 Contrôles attendus

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Protection CSRF sur formulaires sensibles | ☐ | ☐ |  |
| CSP définie | ☐ | ☐ |  |
| HSTS activé | ☐ | ☐ |  |
| `X-Content-Type-Options: nosniff` | ☐ | ☐ |  |
| Politique anti-clickjacking | ☐ | ☐ |  |
| Referrer-Policy définie | ☐ | ☐ |  |
| Cookies `HttpOnly` | ☐ | ☐ |  |
| Cookies `Secure` | ☐ | ☐ |  |
| Cookies `SameSite` | ☐ | ☐ |  |
| Validation stricte des entrées | ☐ | ☐ |  |
| Gestion sécurisée des uploads | ☐ | ☐ |  |
| Messages d’erreur non verbeux en production | ☐ | ☐ |  |

### 9.2 Vulnérabilités applicatives à évaluer

- XSS réfléchi / stocké  
- injection SQL / DQL  
- SSRF  
- open redirect  
- exposition d’informations sensibles  
- désérialisation non maîtrisée  
- upload de fichiers dangereux  

### 9.3 Recommandations

1.  
2.  
3.  

---

## 10. Audit trail et journalisation sécurité

### 10.1 Conformité FDA 21 CFR Part 11

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

### 10.2 Événements capturés

| Événement | Journalisé | Détails capturés |
|---|---|---|
| Connexion / déconnexion | ☐ |  |
| Échec d’authentification | ☐ |  |
| Accès refusé | ☐ |  |
| Modification de données | ☐ |  |
| Validation de données | ☐ |  |
| Déverrouillage de formulaire | ☐ |  |
| Attribution / retrait de rôle | ☐ |  |
| Changement de permission | ☐ |  |
| Changement de configuration de sécurité | ☐ |  |

### 10.3 Capacités opérationnelles

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Centralisation des logs | ☐ | ☐ |  |
| Corrélation des événements | ☐ | ☐ |  |
| Alertes sur événements critiques | ☐ | ☐ |  |
| Horloge synchronisée (NTP) | ☐ | ☐ |  |
| Conservation adaptée des logs | ☐ | ☐ |  |
| Procédure de réponse à incident | ☐ | ☐ |  |

---

## 11. Modèle de données RBAC

### 11.1 Tables et relations

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

### 11.2 Migrations requises

```sql
-- Coller les migrations SQL nécessaires ici
```

---

## 12. Protection des données sensibles et conformité

### 12.1 Données et classification

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Classification des données | ☐ | ☐ |  |
| Identification des données sensibles / santé | ☐ | ☐ |  |
| Minimisation des données | ☐ | ☐ |  |
| Chiffrement au repos | ☐ | ☐ |  |
| Chiffrement en transit | ☐ | ☐ |  |
| Pseudonymisation / anonymisation | ☐ | ☐ |  |
| Politique de rétention / purge | ☐ | ☐ |  |
| Export contrôlé et traçable | ☐ | ☐ |  |

### 12.2 Références réglementaires applicables

| Référence | Applicable | Commentaire |
|---|---|---|
| FDA 21 CFR Part 11 | ☐ |  |
| RGPD Article 25 | ☐ |  |
| ICH E6(R2) | ☐ |  |
| ISO 27001 A.9 | ☐ |  |
| HDS §6.2.3 | ☐ |  |

---

## 13. Gestion des secrets et configuration sensible

### 13.1 Contrôles attendus

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Aucun secret en dur dans le dépôt | ☐ | ☐ |  |
| Secrets séparés par environnement | ☐ | ☐ |  |
| Rotation des secrets possible | ☐ | ☐ |  |
| Clés JWT protégées | ☐ | ☐ |  |
| `APP_SECRET` correctement géré | ☐ | ☐ |  |
| Coffre-fort / secret manager utilisé | ☐ | ☐ |  |
| Permissions d’accès restreintes | ☐ | ☐ |  |

### 13.2 Éléments à vérifier

- Variables d’environnement  
- Fichiers de configuration  
- Historique Git  
- Secrets CI/CD  
- Secrets d’intégration tierce  

---

## 14. Dépendances, supply chain et CI/CD

### 14.1 Dépendances applicatives

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| `composer.lock` versionné | ☐ | ☐ |  |
| Scan de vulnérabilités dépendances | ☐ | ☐ |  |
| Dépendances abandonnées identifiées | ☐ | ☐ |  |
| Mise à jour des dépendances critiques | ☐ | ☐ |  |
| Politique de revue des packages tiers | ☐ | ☐ |  |

### 14.2 CI/CD et chaîne de build

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Secrets CI protégés | ☐ | ☐ |  |
| Pipelines restreints | ☐ | ☐ |  |
| Contrôles de sécurité dans le pipeline | ☐ | ☐ |  |
| Images de build maîtrisées | ☐ | ☐ |  |
| Déploiements traçables | ☐ | ☐ |  |

---

## 15. Infrastructure, déploiement et durcissement

### 15.1 Contrôles attendus

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| TLS correctement configuré | ☐ | ☐ |  |
| Segmentation des environnements | ☐ | ☐ |  |
| Exécution applicative non-root | ☐ | ☐ |  |
| Permissions filesystem minimales | ☐ | ☐ |  |
| Reverse proxy / serveur durci | ☐ | ☐ |  |
| Base de données non exposée publiquement | ☐ | ☐ |  |
| Sauvegardes protégées | ☐ | ☐ |  |
| Supervision / alerting en place | ☐ | ☐ |  |

### 15.2 Observations

- Architecture de déploiement :  
- Exposition réseau :  
- Durcissement des composants :  

---

## 16. Gouvernance des droits et gestion du cycle de vie des accès

### 16.1 Vérifications

| Point de contrôle | Présent | Conforme | Commentaire |
|---|---|---|---|
| Principe du moindre privilège appliqué | ☐ | ☐ |  |
| Séparation des tâches | ☐ | ☐ |  |
| Validation des droits à l’attribution | ☐ | ☐ |  |
| Revue périodique des accès | ☐ | ☐ |  |
| Gestion des comptes inactifs | ☐ | ☐ |  |
| Onboarding / offboarding sécurisé | ☐ | ☐ |  |
| Comptes de service maîtrisés | ☐ | ☐ |  |
| Accès temporaires à expiration automatique | ☐ | ☐ |  |

---

## 17. Tests de sécurité

### 17.1 Tests existants

| Fichier | Couverture | Scénarios |
|---|---|---|
|  |  |  |

### 17.2 Tests manquants critiques

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
| 9 | Session révoquée → accès impossible | Majeur |
| 10 | Endpoint API sans rôle → refus correct | Critique |
| 11 | Upload malveillant → rejet | Majeur |
| 12 | Requête inter-tenant via ID forgé → refus | Critique |

### 17.3 Code de test proposé

```php
// Tests PHPUnit critiques à implémenter
```

---

## 18. Registre des constats et plan de remédiation

### 18.1 Registre des constats

| ID | Constat | Gravité | Vraisemblance | Impact métier | Effort | Responsable | Échéance | Statut |
|---|---|---|---|---|---|---|---|---|
| C-01 |  | Critique | Élevée | Élevé |  |  |  | Ouvert |
| C-02 |  | Majeure | Moyenne | Élevé |  |  |  | Ouvert |
| C-03 |  | Modérée | Moyenne | Modéré |  |  |  | Ouvert |

### 18.2 Phase 1 — Critique (sécurité immédiate)

| # | Action | Fichier(s) / Composant(s) | Effort |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

### 18.3 Phase 2 — Majeur (conformité et maîtrise opérationnelle)

| # | Action | Fichier(s) / Composant(s) | Effort |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

### 18.4 Phase 3 — Amélioration continue et optimisation

| # | Action | Fichier(s) / Composant(s) | Effort |
|---|---|---|---|
| 1 |  |  |  |
| 2 |  |  |  |
| 3 |  |  |  |

---

## 19. Conclusion

Le niveau de maturité sécurité de l’application devra être apprécié au regard de trois axes majeurs :

1. la capacité à **empêcher les accès non autorisés** ;
2. la capacité à **garantir l’isolation stricte entre organisations** ;
3. la capacité à **détecter, tracer et traiter les événements de sécurité**.

La structure de l’application semble particulièrement adaptée à une approche centralisée du contrôle d’accès, ce qui constitue un socle favorable. Néanmoins, la robustesse globale dépendra de la cohérence entre les couches **authentification**, **autorisation**, **requêtes applicatives**, **base de données**, **journalisation**, **tests** et **gouvernance**.

Les corrections prioritaires devront être orientées en premier lieu vers les écarts susceptibles d’affecter la confidentialité des données inter-tenant, l’intégrité des droits, et la traçabilité réglementaire.

---

## Annexe A — Références réglementaires et normatives

- **FDA 21 CFR Part 11** — *Electronic Records; Electronic Signatures*  
  https://www.ecfr.gov/current/title-21/part-11
- **RGPD — Article 25** : *Data Protection by Design and by Default*
- **ICH E6(R2)** : *Good Clinical Practice* — exigences d’audit trail
- **ISO 27001 A.9** : *Access Control*
- **HDS §6.2.3** : revue des droits d’accès

---

## Annexe B — Glossaire

| Terme | Définition |
|---|---|
| RBAC | Role-Based Access Control |
| RLS | Row Level Security |
| EDC | Electronic Data Capture |
| CRA | Clinical Research Associate |
| DM | Data Manager |
| MFA | Multi-Factor Authentication |
| CSP | Content Security Policy |
| HSTS | HTTP Strict Transport Security |
| CI/CD | Continuous Integration / Continuous Deployment |
