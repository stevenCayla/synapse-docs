---
title: "🚀 Quick Start — Lancer Synapse Medical en 5 minutes"
description: "Guide de démarrage rapide pour développeurs : prérequis, clés de chiffrement, lancement des conteneurs Docker (FrankenPHP), migrations, seed et première connexion. Opérationnel en 5 à 10 minutes."
sidebar:
  label: "🚦 Guide de démarrage"
  order: 1
  badge:
    text: Nouveau
    variant: tip
---

> 🌐 Version française · [English version](/en/getting-started/)

*Pour les développeurs — environnement local (Docker recommandé).*
**Objectif : application opérationnelle en 5 à 10 minutes.**

:::tip[En une commande]
Pressé ? Après le clone et la génération des clés (étapes 1-2) :
`make start && make seed c="--reset --all-sites"`, puis ouvre **https://localhost**.
:::

## 📌 Prérequis

| Outil | Détail |
|-------|--------|
| **Docker** + **Docker Compose v2** | [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Compose v2.10+ inclus) |
| **Git** | [git-scm.com](https://git-scm.com/downloads) |
| **Make** | Wrappers du projet (préinstallé sur macOS/Linux ; sous Windows via WSL2) |
| **Un terminal** | Terminal macOS/Linux, ou **WSL2** sous Windows |
| **Un éditeur** | VS Code, PHPStorm… (optionnel) |

:::note
Synapse Medical tourne **entièrement en conteneurs** : un seul service applicatif
**FrankenPHP** (PHP 8.5 + Caddy) embarque le serveur web, le worker, le hub **Mercure** et
**Vulcain**. Aucune installation locale de PHP, Composer ou PostgreSQL n'est nécessaire.
:::

## ✅ Étape 1 — Cloner le dépôt

```bash
git clone <url-du-dépôt> synapse-medical
cd synapse-medical
```

:::tip
Pas d'accès au dépôt ? Demande-le à l'équipe ou travaille sur un **fork**. Le code source
sera publié sur [GitHub](https://github.com/stevenCayla/SYNAPSE-MEDICAL).
:::

## ✅ Étape 2 — Générer les clés de chiffrement

L'application chiffre les données de santé au repos (libsodium) et signe les sessions. Quatre
clés **doivent** être définies. Génère-les dans un fichier `.env.local` (ignoré par Git) :

```bash
{
  echo "APP_SECRET=$(openssl rand -hex 16)"
  echo "APP_TOTP_ENCRYPTION_KEY=$(openssl rand -base64 32)"
  echo "APP_PATIENT_ENCRYPTION_KEY=$(openssl rand -base64 32)"
  echo "APP_PATIENT_SEARCH_HMAC_KEY=$(openssl rand -base64 32)"
} >> .env.local
```

| Clé | Format attendu | Usage |
|-----|----------------|-------|
| `APP_SECRET` | hex | Signature des sessions / CSRF (Symfony) |
| `APP_TOTP_ENCRYPTION_KEY` | **base64, 32 octets** | Chiffrement des secrets 2FA (TOTP) |
| `APP_PATIENT_ENCRYPTION_KEY` | **base64, 32 octets** | Chiffrement des PII patient (`crypto_secretbox`) |
| `APP_PATIENT_SEARCH_HMAC_KEY` | **base64, ≥ 32 octets** | Index aveugle HMAC pour la recherche chiffrée |

:::caution
Les valeurs `POSTGRES_PASSWORD`, mots de passe et clés du fichier `.env` sont des **valeurs
de développement**. Ne les réutilise **jamais** en production — voir
[Déploiement en production](/deployment/production/).
:::

## ✅ Étape 3 — Lancer les conteneurs

```bash
make start
```

`make start` construit les images puis démarre les services. Au premier lancement, le
conteneur exécute automatiquement `composer install` **et applique les migrations** une fois
PostgreSQL prêt.

> 🔄 Compte **2 à 3 minutes** au premier démarrage (build + dépendances + migrations).

:::note[Certificat TLS]
FrankenPHP génère un certificat **HTTPS auto-signé** en développement. À la première visite
sur `https://localhost`, accepte l'avertissement du navigateur (certificat local).
:::

**Vérifie l'état des services :**

```bash
make ps          # ou : docker compose ps
```

Tu devrais voir les services `php`, `database` et `mailer` en cours d'exécution :

```
NAME                        SERVICE    STATUS    PORTS
synapse-medical-php-1       php        running   0.0.0.0:80->80/tcp, 0.0.0.0:443->443/tcp
synapse-medical-database-1  database   running   5432/tcp
synapse-medical-mailer-1    mailer     running   1025/tcp, 8025/tcp
```

## ✅ Étape 4 — Initialiser les données

Les migrations sont déjà appliquées au démarrage. Charge maintenant un **jeu de données de
développement** (workspace, admin, sites, utilisateurs, patients, études, eCRF) :

```bash
make seed c="--reset --all-sites"
# équivalent : make sf c="app:seed --reset --all-sites"
```

:::tip
Besoin de relancer une migration manuellement ? `make migrate`.
Pour repartir de zéro : `make reset-database` (⚠️ destructif).
:::

**Vérifie la base de données (optionnel) :**

```bash
make pgsql       # ouvre psql, puis tape \dt pour lister les tables
```

Tu devrais voir les tables `study`, `patient`, `ecrf_form`, `workspace`, `user`, etc.

## ✅ Étape 5 — Se connecter

1. Ouvre **https://localhost** dans ton navigateur.
2. Connecte-toi avec l'administrateur créé par le seed :

   | Champ | Valeur par défaut |
   |-------|-------------------|
   | **Email** | `steven@example.com` |
   | **Mot de passe** | `Password1!` |

:::note[2FA obligatoire]
L'authentification à deux facteurs (**TOTP**) est obligatoire. À la première connexion, scanne
le QR code avec une application d'authentification (Google Authenticator, Aegis, 1Password…),
puis saisis le code à 6 chiffres.
:::

**Problème de connexion ?**

```bash
make logs                    # suit les logs de tous les services
docker compose logs php      # logs du conteneur applicatif uniquement
```

## ✅ Étape 6 — Explorer l'API (optionnel)

L'API interne est documentée via **Swagger UI** (authentification par **session + CSRF**, pas
de JWT) :

👉 **https://localhost/api/doc**

Pour le détail des endpoints et des conventions OpenAPI, voir la
[Référence de l'API](/api/readme/).

:::tip[E-mails en dev]
Les e-mails sortants sont capturés par **Mailpit** (aucun envoi réel). Récupère l'URL de son
interface web avec `docker compose port mailer 8025`.
:::

## 🎯 Prochaines étapes

- 🏗️ Comprendre l'architecture : [Vue d'ensemble](/architecture/overview/)
- 🗄️ Explorer le modèle de données : [Modèle de données](/database/data-model/)
- ⌨️ Toutes les commandes : [Référence des commandes console](/commands/readme/)
- 🔒 Règles de sécurité : [Bonnes pratiques de sécurité](/security/best-practices/)
- 🤝 Participer : [Guide de contribution](/contribute/)

## 🔍 Vérification finale

| Étape | Statut | Commande de vérification |
|-------|--------|--------------------------|
| Dépôt cloné | ✅ | `ls` (affiche `Makefile`, `compose.yaml`, `Dockerfile`…) |
| Clés générées | ✅ | `cat .env.local` (4 clés présentes) |
| Conteneurs lancés | ✅ | `make ps` (services `php`, `database`, `mailer` en `running`) |
| Base initialisée | ✅ | `make pgsql` puis `\dt` |
| Application accessible | ✅ | `curl -k https://localhost` (retourne du HTML) |
| Connexion admin | ✅ | https://localhost (`steven@example.com` / `Password1!`) |

---

:::tip[Ce guide t'a aidé ?]
Une étape manque ou une commande échoue ? Signale-le sur le
[Discord](https://discord.com/channels/1521440528388984934/1521440528829382718) ou via une
*issue*. Voir aussi le [Dépannage](/troubleshooting/common-errors/).
:::
