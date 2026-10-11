---
title: "Rôles EDC / RBAC"
---

## 🧪 1. Rôles côté site investigateur (centre clinique)

### 👨‍⚕️ Investigateur principal (PI)
- Responsable médical du site
- Valide / signe les données (eCRF)
- Accès complet aux patients de son site

### 👩‍⚕️ Sous-investigateur
- Saisie et modification des données
- Peut répondre aux queries

### 🧑‍⚕️ Coordinateur d’étude (Study Coordinator)
- Saisie eCRF
- Gestion opérationnelle des patients
- Interaction avec CRA

### 🧪 Personnel de site (site staff)
- Accès limité (ex: saisie partielle)
- Pas forcément accès à toutes les sections

## 🏢 2. Rôles côté promoteur (sponsor)

### 📊 Data Manager
- Configure les eCRF
- Gère les queries
- Nettoyage des données
- Accès global à l’étude

### 📈 Biostatisticien
- Accès lecture aux données
- Exports (CDISC, CSV…)
- Pas de modification

### 🧠 Medical Monitor
- Revue médicale
- Accès aux données patients (lecture)
- Peut ouvrir des queries

### 🧾 Clinical Project Manager
- Supervision globale
- Accès reporting
- Pas forcément accès au détail patient

## 🔍 3. Monitoring (CRO / sponsor)

### 🧑‍💼 CRA (Clinical Research Associate)
- Monitoring des sites
- Accès aux données des sites assignés
- Création / suivi des queries
- Accès audit trail

### 🧑‍💻 Lead CRA
- Supervision des CRA
- Accès multi-sites

## 🔐 4. Qualité & audit

### 🧑‍⚖️ QA / Quality Assurance
- Accès en lecture globale
- Accès audit trail
- Vérification conformité

### 🏛️ Auditeur / Inspecteur (ANSM, FDA…)
- Accès read-only
- Accès complet :
  - données
  - audit trail
  - logs
- Accès temporaire

> 👉 rôle critique en inspection

## ⚙️ 5. Rôles techniques (éditeur EDC)

### 👨‍💻 Admin système
- Gestion utilisateurs
- Configuration plateforme
- ⚠️ accès très sensible → ultra restreint

### 🧑‍💻 Support applicatif
- Support utilisateurs
- Accès limité et tracé
- Pas d’accès libre aux données patients

### 🔧 DevOps / Infra
- Accès infrastructure
- Pas d’accès fonctionnel aux données (idéalement)

## 🧪 6. Rôles spécifiques EDC (souvent oubliés)

### 🧾 Data Entry
- Saisie uniquement
- Pas de validation

### ✅ Validator / Signataire
- Signature électronique des eCRF

### ❓ Query Manager
- Gestion des queries uniquement

### 🔒 Archivage / Read-only
- Accès après lock de base

## 🧩 7. Rôles par étude / par site (très important)

> 👉 Un même utilisateur peut être :
- PI sur étude A
- CRA sur étude B

> 👉 Donc ton RBAC doit être :
- scopé par étude
- scopé par site

## 🔥 Exigences critiques RBAC (audit)

### 🔴 Séparation des rôles
- Un utilisateur ne peut pas tout faire
- Pas de “super admin métier”

### 🔴 Principe du moindre privilège
- accès strictement nécessaire

### 🔴 Traçabilité
- qui a fait quoi
- quand
- sur quelle donnée

### 🔴 Gestion dynamique
- ajout / retrait rapide des accès
- gestion des départs (offboarding)
