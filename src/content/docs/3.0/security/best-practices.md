---
title: Bonnes pratiques de sécurité
description: "Règles de codage sécurisé non négociables : isolation par
  workspace, stockage de fichiers hors webroot, chiffrement des PII,
  traçabilité, et check-list de revue."
sidebar:
  label: Bonnes pratiques
  badge:
    text: Nouveau
    variant: danger
slug: 3.0/security/best-practices
---

> 🌐 Version française · [English version](/3.0/en/security/best-practices/)

Synapse Medical traite des **données de santé** (HDS, RGPD, ANSSI, 21 CFR Part 11). Les
règles ci-dessous sont **non négociables** et s'appliquent à toute contribution. Voir aussi :
[Permissions](/3.0/security/permissions/) · [Contribuer](/3.0/contribute/).

## 🔒 Isolation par workspace

Chaque **workspace** est un environnement applicatif **totalement isolé** — pas un simple
filtre visuel.

:::danger[Règle d'or]
Ne **jamais** charger une ressource par son ID seul. Toujours vérifier aussi son
`workspace_id`.
:::

```php
// ❌ INTERDIT
$study = $repo->find($id);

// ✅ OBLIGATOIRE
$study = $repo->findOneBy(['id' => $id, 'workspace' => $activeWorkspace]);
// ou via un Voter qui vérifie study.workspace === activeWorkspace
```

| Règle | Application |
|-------|-------------|
| Toutes les tables métier portent `workspace_id` | Colonne non-nullable, FK vers `workspace` |
| Toutes les requêtes filtrent par `workspace_id` | Jamais de chargement par ID seul |
| Toute création associe le workspace actif | Contrôleur / service |
| Accès cross-workspace | Refus **HTTP 403/404** (Voter ou guard) |

Défense en profondeur : la **PostgreSQL Row-Level Security** (`FORCE ROW LEVEL SECURITY`)
double la vérification applicative sur `study`, `patient`, `ecrf_record`.

## 🗄️ Stockage sécurisé des fichiers

:::danger[Règle d'or]
Aucun fichier uploadé ne doit **jamais** être accessible via une URL publique.
:::

* 📁 **Hors webroot** : `private_uploads/`, jamais dans `public/`.
* 🎲 **Nommage opaque** : token de 32 hex (`bin2hex(random_bytes(16))`), aucun identifiant
  métier (IPP, ID patient/étude) dans le chemin.
* 🧹 **Suppression EXIF** : ré-encodage GD avant stockage.
* 🛡️ **Accès contrôlé** : `BinaryFileResponse` après vérification du rôle **et** de
  l'appartenance.

```php
// ❌ INTERDIT — upload direct dans public/
$file->move($publicDir . '/uploads/', $slugger->slug($name));

// ✅ OBLIGATOIRE — toujours passer par le service
$token = $uploader->store($file, SecureFileUploadService::CTX_AVATAR, $allowedMimes, $maxBytes);
```

## 🔐 Chiffrement & données personnelles

* Les **PII patient** et le **secret TOTP** sont chiffrés au repos (listeners Doctrine
  transparents, libsodium `crypto_secretbox`).
* Recherche sur données chiffrées via **index aveugle HMAC** (`externalIdHash`,
  `dateOfBirthHash`), jamais sur la valeur en clair.
* ❌ **Aucune PII en clair** dans les logs, les noms de fichiers, les URLs ou les messages
  d'erreur.

## 👮 Authentification & accès

* **2FA TOTP obligatoire** (`TotpService`, `TwoFactorSubscriber`).
  Dix codes de secours à usage unique sont affichés une seule fois à la fin de
  l'enrôlement et régénérables depuis le profil (`BackupCodeService`).
* Accès aux études via `StudyVoter` + `StudyAccessService` (rôle effectif).
* Verrouillage de compte, expiration de session côté serveur, anti-réutilisation de mot de
  passe (`PasswordHistory`).

## 📋 Traçabilité & audit

* `ActivityLog` (audit clinique GCP) et `SecurityAuditLog` (audit sécurité) sont
  **append-only** et **chaînés HMAC-SHA256** (inviolables).
* Vérification d'intégrité : `app:verify-audit-chain` / `app:audit:verify-chain`.
* Soft-delete (`deletedAt`) sur `Study` et `Patient` (valeur réglementaire).

## ✅ Check-list de revue

Avant d'ouvrir une Pull Request touchant à des données métier :

* \[ ] 🔒 Toutes les requêtes filtrent par `workspace_id` (aucun `find($id)` nu).
* \[ ] 🔒 Les nouveaux uploads passent par `SecureFileUploadService`.
* \[ ] 🔐 Aucune PII en clair dans les logs / noms de fichiers / erreurs.
* \[ ] 👮 Les nouveaux endpoints sont protégés par un Voter ou `access_control`.
* \[ ] 📋 Les actions sensibles sont tracées (`ActivityLog` / `SecurityAuditLog`).
* \[ ] 🧪 Un test couvre le contrôle d'accès (cas autorisé **et** refusé).

:::tip
Voir aussi la [Checklist QA sécurité](/3.0/qa/security-checklist/) pour les contrôles de revue
détaillés.
:::
