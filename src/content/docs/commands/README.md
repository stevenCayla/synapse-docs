---
title: "Référence des commandes console"
description: "Référence des commandes console app:* : seed et données de test, maintenance sécurité, rétention et vérification des chaînes d'audit. Vue d'ensemble, options communes et détail par commande."
---

Toutes les commandes métier de l'application sont préfixées `app:*` et définies dans
`src/Command`. Cette page en donne la référence complète : une [vue d'ensemble](#vue-densemble)
tabulée, les [options communes](#options-communes) partagées par plusieurs commandes,
puis le détail de chaque commande (description, options, exemples).

:::note[Comment exécuter une commande]
Toutes les commandes passent par le conteneur PHP. Deux équivalents :

```bash
make sf c="<commande> [options]"
# ou directement :
docker compose exec php php bin/console <commande> [options]
```

Dans les exemples ci-dessous, on note simplement `php bin/console <commande>`.
:::

## Vue d'ensemble

```bash
php bin/console <commande> [arguments] [--options]
```

### Données & environnement

| Commande | Description | Exemple |
|---|---|---|
| [`app:admin:create`](#appadmincreate) | Crée un super-administrateur (prod-safe, sans donnée fictive) | `app:admin:create --email=prenom.nom@exemple.fr` |
| [`app:seed`](#appseed) | Jeu de données fictif complet (pipeline orchestré) | `app:seed --reset --users=5 --studies=2` |
| [`app:reset-database`](#appreset-database) | Vide toutes les tables applicatives | `app:reset-database --force` |

### Sécurité & conformité

| Commande | Description | Exemple |
|---|---|---|
| [`app:users:auto-disable-inactive`](#appusersauto-disable-inactive) | Désactive les comptes inactifs depuis N jours | `app:users:auto-disable-inactive --days=60` |
| [`app:totp:provision-missing`](#apptotpprovision-missing) | Provisionne les secrets TOTP manquants | `app:totp:provision-missing --dry-run` |
| [`app:matchid:renew-token`](#appmatchidrenew-token) | Renouvelle le token d'accès MatchID | `app:matchid:renew-token --force` |
| [`app:patient:encrypt-existing`](#apppatientencrypt-existing) | Chiffre les données PII en clair (backfill) | `app:patient:encrypt-existing --dry-run` |

### Rétention & purge

| Commande | Description | Exemple |
|---|---|---|
| [`app:retention:check-studies`](#appretentioncheck-studies) | Vérifie la rétention HDS des études (15 ans) | `app:retention:check-studies --warning-days=180` |
| [`app:retention:purge-security-logs`](#appretentionpurge-security-logs) | Purge les logs de sécurité périmés | `app:retention:purge-security-logs --older-than=P3M` |

### Équipe & formation

| Commande | Description | Exemple |
|---|---|---|
| [`app:gcp:send-expiry-reminders`](#appgcpsend-expiry-reminders) | Rappelle l'expiration prochaine des certificats GCP | `app:gcp:send-expiry-reminders --days=30` |

### Données de test (fixtures)

| Commande | Description | Exemple |
|---|---|---|
| [`app:create-fake-sites`](#appcreate-fake-sites) | Crée des centres investigateurs fictifs | `app:create-fake-sites -w 1 --all` |
| [`app:create-fake-users`](#appcreate-fake-users) | Crée des utilisateurs fictifs | `app:create-fake-users -w 1 -c 5` |
| [`app:create-fake-teams`](#appcreate-fake-teams) | Crée les 9 équipes standard d'un essai clinique | `app:create-fake-teams -w 1` |
| [`app:create-fake-patients`](#appcreate-fake-patients) | Crée des patients fictifs | `app:create-fake-patients -w 1 -c 50` |
| [`app:create-fake-studies`](#appcreate-fake-studies) | Crée des études cliniques complètes | `app:create-fake-studies -w 1 -c 2 --with-sites` |
| [`app:create-fake-study-members`](#appcreate-fake-study-members) | Ajoute des membres fictifs aux études | `app:create-fake-study-members -w 1 -m 5` |
| [`app:create-fake-study-patients`](#appcreate-fake-study-patients) | Inclut des patients fictifs dans une étude | `app:create-fake-study-patients -w 1 -s 5 -c 30` |
| [`app:create-fake-ecrf-templates`](#appcreate-fake-ecrf-templates) | Crée des templates eCRF réutilisables | `app:create-fake-ecrf-templates --publish` |
| [`app:create-fake-ecrf-forms`](#appcreate-fake-ecrf-forms) | Crée des formulaires eCRF pour les études | `app:create-fake-ecrf-forms -w 1 --from-templates` |

## Options communes

Ces options reviennent dans plusieurs commandes avec la même sémantique. Elles ne sont
pas systématiquement répétées dans le détail de chaque commande ci-dessous.

### `-w, --workspace <id>`

ID du workspace cible. Si absent et que la commande en a besoin, il est **demandé
interactivement**. Garantit l'isolation : toutes les entités créées sont rattachées à ce workspace.

### `--dry-run`

Simule l'exécution **sans rien écrire** en base. Affiche ce qui serait fait. Recommandé
pour valider une commande de maintenance avant de l'exécuter réellement.

### `--force (-f)`

Exécute **sans confirmation interactive**. À utiliser dans les scripts et la CI, où aucune
saisie n'est possible.

---

## `app:admin:create`

Crée un super-administrateur, **sans donnée fictive** : c'est la commande qui fonctionne en `prod`
(où `app:seed` est refusé) pour créer le premier compte. Crée le premier workspace s'il n'en existe
aucun, et journalise la création (journal d'audit de sécurité, `account.created`).

```bash
php bin/console app:admin:create --email=prenom.nom@exemple.fr [--username=…] [--first-name=…] [--last-name=…] [--workspace-name=…]
```

Le mot de passe n'est **jamais** une option : variable d'environnement `ADMIN_PASSWORD`, sinon saisie
masquée avec confirmation (refus en mode non interactif sans `ADMIN_PASSWORD`). Il doit respecter la
politique de mot de passe. L'e-mail ou le nom d'utilisateur déjà pris est refusé. Au premier login :
changement du mot de passe puis activation de la 2FA. Procédure complète :
[mise en production](/deployment/production/).

---

## `app:seed`

Commande d'orchestration principale. Génère un jeu de données fictif complet en une seule
commande : workspace, admin, sites, utilisateurs, patients, études, eCRF. Idéale pour
initialiser un environnement de développement ou de test.

:::caution[Refusé en `prod`]
La commande est refusée en environnement `prod`. Un serveur de développement ou de recette qui exécute l'image de production peut l'autoriser avec `APP_ALLOW_FAKE_DATA=1` dans son `.env.local` (jamais en production : `--reset` vide la base). Premier administrateur d'une production : `app:admin:create`.
:::

```bash
php bin/console app:seed [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--reset` | flag | — | Vide entièrement la base avant de générer les données |
| `--workspace-name` | string | `Développement` | Nom du workspace créé après le reset |
| `--admin` | string (répétable) | — | Email d'un administrateur à créer (un par admin ; prénom et nom déduits de l'email). Sans cette option : mode interactif (invites), ou refus de la commande en mode non interactif, avant toute suppression de données ; il n'existe aucun administrateur par défaut |
| `SEED_ADMIN_PASSWORD` | variable d'env. | — | Mot de passe des administrateurs en mode non interactif. Sans elle, un mot de passe aléatoire est généré et affiché une seule fois à la fin |
| `-w, --workspace` | int | — | ID du workspace cible (ignoré si `--reset`) |
| `--users` | int | `10` | Nombre d'utilisateurs investigateurs à créer |
| `--patients` | int | `30` | Nombre de patients à créer |
| `--studies` | int | `3` | Nombre d'études à créer |
| `--patients-per-study` | int | `10` | Patients inclus par étude |
| `--all-sites` | flag | — | Crée tous les sites du catalogue (sinon les 3 premiers) |

**Exemple :**

```bash
# Réinitialisation complète + seed
php bin/console app:seed --reset --users=5 --studies=2

# Seed dans un workspace existant
php bin/console app:seed -w 1 --patients=50 --all-sites
```

**Administrateurs :** avec `--reset`, au moins un super-administrateur doit être nommé : il n'existe aucun administrateur par défaut.
En mode interactif, le seed demande l'e-mail (obligatoire), le prénom et le nom (proposés d'après l'e-mail, modifiables),
puis le mot de passe (saisie masquée avec confirmation, validée par la politique de mot de passe ; Entrée pour en générer un),
et propose d'ajouter un autre administrateur. En mode non interactif, `--admin=<email>` est obligatoire : sans lui, la commande
échoue avant de vider la base.
Chaque administrateur est `ROLE_SUPER_ADMIN`, rattaché aux deux workspaces, et **doit changer son mot de passe à la première connexion**. La commande est refusée en environnement `prod`.

**Pipeline interne :** reset (optionnel) → workspace + admin → sites → users (avec assignation aux sites) → équipes (9 équipes standard avec membres) → patients → études (avec patients inclus et occurrences de visites) → templates eCRF.

---

## `app:reset-database`

Vide toutes les tables applicatives et invalide toutes les sessions PHP actives.
**Irréversible.** Conserve les tables d'infrastructure (`messenger_messages`,
`doctrine_migration_versions`).

```bash
php bin/console app:reset-database [--force]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--force` | flag | — | Exécute sans confirmation interactive |

**Exemple :**

```bash
# Avec confirmation interactive
php bin/console app:reset-database

# Sans confirmation (CI/scripts)
php bin/console app:reset-database --force
```

:::caution
Ne pas utiliser en production.
:::

---

## `app:users:auto-disable-inactive`

Désactive automatiquement les comptes utilisateurs inactifs depuis plus de N jours.
Toutes les actions sont tracées via `SecurityAuditLogger`.

```bash
php bin/console app:users:auto-disable-inactive [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--days` | int | `90` | Seuil d'inactivité en jours |
| `--dry-run` | flag | — | Simule sans modifier la base |

**Exemple :**

```bash
# Désactiver après 60 jours d'inactivité
php bin/console app:users:auto-disable-inactive --days=60

# Simulation (audit uniquement)
php bin/console app:users:auto-disable-inactive --dry-run
```

:::tip[Cron recommandé]
Quotidien.
:::

---

## `app:totp:provision-missing`

Provisionne un secret TOTP pour les utilisateurs qui n'en ont pas encore (backfill
P0-NC03 — mise en application obligatoire du 2FA). Idempotent : ignore les utilisateurs
déjà provisionnés. Les utilisateurs vérifient leur code TOTP à la prochaine connexion.

```bash
php bin/console app:totp:provision-missing [--dry-run]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--dry-run` | flag | — | Simule sans écrire en base |

**Exemple :**

```bash
php bin/console app:totp:provision-missing --dry-run
php bin/console app:totp:provision-missing
```

---

## `app:matchid:renew-token`

Renouvelle le token d'accès à l'API MatchID. Vérifie la date d'expiration et la deadline
de renouvellement. Échoue si le renouvellement est trop tardif. Prévu pour une exécution
quotidienne en cron.

```bash
php bin/console app:matchid:renew-token [--force]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-f, --force` | flag | — | Renouvelle même si le token est encore valide |

**Exemple :**

```bash
php bin/console app:matchid:renew-token
php bin/console app:matchid:renew-token --force
```

:::tip[Cron recommandé]
Quotidien.
:::

---

## `app:patient:encrypt-existing`

Chiffre les champs PII en clair des patients (prénom, nom, nom de naissance, identifiant
externe, dates) suite à la migration P0-NC01. Opère directement via DBAL pour contourner
les listeners ORM. Idempotent : ignore les champs déjà chiffrés (préfixe `ENC:`). Recalcule
les hachages de recherche sur l'identifiant externe et la date de naissance.

```bash
php bin/console app:patient:encrypt-existing [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--batch-size` | int | `100` | Patients traités par flush |
| `--dry-run` | flag | — | Simule sans écrire en base |

**Exemple :**

```bash
php bin/console app:patient:encrypt-existing --dry-run
php bin/console app:patient:encrypt-existing --batch-size=500
```

:::caution
Commande one-shot post-migration. Ne doit pas être exécutée régulièrement.
:::

---

## `app:retention:check-studies`

Identifie les études cliniques approchant ou dépassant leur date de rétention HDS (15 ans
après clôture). Non destructif — alerte uniquement. Retourne le code de sortie `2` si des
études ont dépassé leur délai.

```bash
php bin/console app:retention:check-studies [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--warning-days` | int | `90` | Jours avant expiration déclenchant une alerte |
| `--workspace` | int | — | Restreindre la vérification à un workspace (ID) |

**Exemple :**

```bash
# Alerte à 6 mois de l'expiration
php bin/console app:retention:check-studies --warning-days=180

# Vérification ciblée sur un workspace
php bin/console app:retention:check-studies --workspace=3
```

:::tip[Cron recommandé]
Mensuel. Surveiller le code de sortie en CI/CD.
:::

---

## `app:gcp:send-expiry-reminders`

Envoie un e-mail de rappel aux utilisateurs dont le certificat GCP (formation aux bonnes pratiques
cliniques) expire dans la fenêtre donnée. Un rappel est envoyé une seule fois par certificat, et
seulement si c'est le certificat qui expire le plus tard pour l'utilisateur (un renouvellement déjà
déposé annule le rappel). Informatif : aucun accès n'est modifié ni bloqué.

```bash
php bin/console app:gcp:send-expiry-reminders [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--days` | int | `30` | Rappeler les certificats qui expirent dans ce nombre de jours |
| `--dry-run` | flag | — | Liste les rappels sans les envoyer |

Le code de sortie est `1` si au moins un envoi a échoué (il sera retenté au passage suivant).

:::tip[Cron recommandé]
Quotidien, par exemple `0 7 * * *`. Sans cette planification, aucun rappel n'est envoyé.
:::

---

## `app:retention:purge-security-logs`

Purge les entrées `SecurityAuditLog` dépassant la durée légale de conservation (6 mois par
défaut, RGPD). Supporte optionnellement la purge des `PatientErasureLog` de plus de 5 ans.

```bash
php bin/console app:retention:purge-security-logs [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--dry-run` | flag | — | Affiche le nombre de lignes sans effectuer la purge |
| `--older-than` | string (ISO 8601) | `P6M` | Âge maximal des entrées à conserver (`P6M`, `P3M`, `P1Y`…) |
| `--with-erasure-logs` | flag | — | Purge aussi les `PatientErasureLog` de plus de 5 ans |

**Exemple :**

```bash
# Simulation
php bin/console app:retention:purge-security-logs --dry-run

# Purge des logs de plus de 3 mois
php bin/console app:retention:purge-security-logs --older-than=P3M

# Purge complète incluant les logs d'effacement
php bin/console app:retention:purge-security-logs --with-erasure-logs
```

:::tip[Cron recommandé]
Mensuel.
:::

---

## `app:create-fake-sites`

Crée des centres investigateurs fictifs (hôpitaux français) avec codes uniques,
départements, adresses et couleurs d'identification. Le catalogue contient 6 sites
prédéfinis.

```bash
php bin/console app:create-fake-sites [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |
| `--all` | flag | — | Crée tous les sites du catalogue (sinon les 3 premiers) |

**Exemple :**

```bash
php bin/console app:create-fake-sites -w 1
php bin/console app:create-fake-sites -w 1 --all
```

---

## `app:create-fake-users`

Crée des utilisateurs fictifs avec profils réalistes (noms, postes), mot de passe commun
et rôles configurables. Ajoute les utilisateurs au workspace. Supporte l'assignation
aléatoire aux sites investigateurs (probabilité 70 %).

```bash
php bin/console app:create-fake-users [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-c, --count` | int | `10` | Nombre d'utilisateurs à créer |
| `-p, --password` | string | aléatoire | Mot de passe commun pour tous les utilisateurs. Sans cette option, un mot de passe aléatoire est généré à chaque exécution et affiché dans le résumé |
| `-r, --role` | string[] | — | Rôle(s) à attribuer (`ROLE_USER`, `ROLE_ADMIN`, `ROLE_MODERATOR`) |
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |
| `--assign-sites` | flag | — | Assigne aléatoirement les utilisateurs à des sites du workspace |

**Exemple :**

```bash
php bin/console app:create-fake-users -w 1 -c 5 --role=ROLE_ADMIN
php bin/console app:create-fake-users -w 1 --assign-sites
```

---

## `app:create-fake-teams`

Crée les 9 équipes fonctionnelles standard d'un essai clinique avec des membres aléatoires
issus du workspace. Un chef d'équipe (lead) est automatiquement désigné par équipe. Les
équipes suivantes sont créées avec leurs couleurs d'identification fixes :

| Équipe | Couleur |
|---|---|
| Clinical Operations | Violet `#6d4aff` |
| Data Management | Indigo `#6366f1` |
| Biostatistics | Émeraude `#10b981` |
| Pharmacovigilance / Safety | Coral `#ef4444` |
| Regulatory Affairs | Ambre `#f59e0b` |
| Monitoring / CRA | Cyan `#06b6d4` |
| Medical / Investigators | Lavande `#a78bfa` |
| Sponsor Management | Rose `#ec4899` |
| External CRO | Violet `#6d4aff` |

```bash
php bin/console app:create-fake-teams [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |
| `--min-members` | int | `2` | Nombre minimum de membres par équipe |
| `--max-members` | int | `6` | Nombre maximum de membres par équipe |
| `--clear` | flag | — | Supprime les équipes existantes avant de créer |

**Exemple :**

```bash
php bin/console app:create-fake-teams -w 1
php bin/console app:create-fake-teams -w 1 --min-members=3 --max-members=8
php bin/console app:create-fake-teams -w 1 --clear
```

:::note
Intégrée dans le pipeline `app:seed` à l'étape 5 (après les utilisateurs, avant les patients).
:::

---

## `app:create-fake-patients`

Génère des patients fictifs avec données démographiques réalistes (nom, prénom, sexe, date
de naissance, identifiant externe/IPP). Utilise Faker avec la locale française.

```bash
php bin/console app:create-fake-patients [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-c, --count` | int | `20` | Nombre de patients à créer |
| `-o, --owner` | string | — | Username du créateur des patients |
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |

**Exemple :**

```bash
php bin/console app:create-fake-patients -w 1 -c 50
php bin/console app:create-fake-patients -w 1 -o admin
```

---

## `app:create-fake-studies`

Crée des études cliniques complètes avec protocole, calendrier de visites, formulaires eCRF
(sections + champs + mappings visites), sites investigateurs, membres et patients inclus.
Comprend 5 templates d'études préconfigurés (SEP, Diabète T2, Insuffisance cardiaque,
Cancer colorectal, Post-AVC).

```bash
php bin/console app:create-fake-studies [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-c, --count` | int | `3` | Nombre d'études à créer (max selon le catalogue) |
| `-o, --owner` | string | — | Username du propriétaire des études |
| `--patients-per-study` | int | `8` | Patients inclus par étude |
| `--members-per-study` | int | `3` | Membres ajoutés par étude |
| `--with-visit-occurrences` | flag | — | Génère des occurrences de visites pour les patients inclus |
| `--with-sites` | flag | — | Associe des sites investigateurs et assigne les patients par site |
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |

**Exemple :**

```bash
php bin/console app:create-fake-studies -w 1 -c 2 --with-sites --with-visit-occurrences
php bin/console app:create-fake-studies -w 1 --patients-per-study=20 --members-per-study=5
```

---

## `app:create-fake-study-members`

Ajoute des membres à des études existantes avec des rôles assignés aléatoirement. Évite les
doublons de membres et respecte la propriété des études.

```bash
php bin/console app:create-fake-study-members [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-m, --members-per-study` | int | `3` | Nombre de membres à ajouter par étude |
| `-s, --study` | int | — | ID d'une étude spécifique (toutes les études si absent) |
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |

**Exemple :**

```bash
php bin/console app:create-fake-study-members -w 1 -m 5
php bin/console app:create-fake-study-members -w 1 -s 12 -m 2
```

---

## `app:create-fake-study-patients`

Inclut des patients fictifs dans une étude existante. Nécessite que l'étude dispose de sites
investigateurs avec le statut `ENROLLMENT_OPEN`. Génère les identifiants sujets via
`SubjectIdService`.

```bash
php bin/console app:create-fake-study-patients [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-s, --study` | int | **requis** | ID de l'étude cible |
| `-c, --count` | int | `10` | Nombre de patients à inclure |
| `-o, --owner` | string | — | Username de l'utilisateur effectuant les inclusions |
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |

**Exemple :**

```bash
php bin/console app:create-fake-study-patients -w 1 -s 5 -c 30
php bin/console app:create-fake-study-patients -w 1 -s 5 --owner=investigateur1
```

---

## `app:create-fake-ecrf-templates`

Crée 5 templates eCRF réutilisables couvrant les domaines cliniques courants :
démographie/inclusion, biologie standard, neurologie, oncologie et qualité de vie (SF-12).
Chaque template inclut sections et champs avec règles de validation.

```bash
php bin/console app:create-fake-ecrf-templates [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `--creator` | string | — | Username du créateur des templates |
| `--publish` | flag | — | Publie les templates après création |

**Exemple :**

```bash
php bin/console app:create-fake-ecrf-templates --publish
php bin/console app:create-fake-ecrf-templates --creator=admin --publish
```

---

## `app:create-fake-ecrf-forms`

Crée des formulaires eCRF pour des études existantes. Peut générer les formulaires à partir
des templates publiés ou utiliser des définitions de fallback avec des sections cliniques
standard (inclusion, suivi, clôture).

```bash
php bin/console app:create-fake-ecrf-forms [options]
```

### Flags

| Option | Type | Défaut | Description |
|---|---|---|---|
| `-s, --study` | int | — | ID d'une étude spécifique (toutes les études si absent) |
| `--activate` | flag | — | Active les formulaires après création |
| `--from-templates` | flag | — | Génère depuis les templates eCRF publiés |
| `-w, --workspace` | int | — | ID du workspace cible (demandé interactivement si absent) |

**Exemple :**

```bash
php bin/console app:create-fake-ecrf-forms -w 1 --from-templates --activate
php bin/console app:create-fake-ecrf-forms -w 1 -s 3 --activate
```

---

## Workflow recommandé — initialisation complète

```bash
# Option 1 : une seule commande (recommandé)
php bin/console app:seed --reset --all-sites --users=8 --studies=3 --patients=40

# Option 2 : étape par étape (plus de contrôle)
php bin/console app:reset-database --force
php bin/console app:create-fake-sites -w 1 --all
php bin/console app:create-fake-users -w 1 -c 8 --assign-sites
php bin/console app:create-fake-teams -w 1
php bin/console app:create-fake-patients -w 1 -c 40
php bin/console app:create-fake-ecrf-templates --publish
php bin/console app:create-fake-studies -w 1 -c 3 --with-sites --with-visit-occurrences
php bin/console app:create-fake-ecrf-forms -w 1 --from-templates --activate
```
