---
title: "Checklist ANSM pour EDC"
---

## 🔴 1. Data Integrity (ALCOA+)
- Données attribuables (user unique, pas de comptes partagés)
- Lisibles (logs exploitables, exportables)
- Contemporaines (timestamp en temps réel)
- Originales (pas d’écrasement sans trace)
- Exactes

### Extensions
- Complètes
- Cohérentes
- Durables
- Disponibles

> **Point critique ANSM**

---

## 🔴 2. Audit Trail (niveau inspection)
- Audit trail activé sur toutes les données critiques
- Impossible à désactiver
- Capture :
  - ancienne valeur
  - nouvelle valeur
  - utilisateur
  - date/heure
  - raison du changement (justification obligatoire)
- Audit trail revu régulièrement (pas juste stocké)

---

## 🔴 3. Signature électronique (21 CFR Part 11)
- Signature liée à un utilisateur unique
- Double facteur ou équivalent
- Non répudiation
- Traçabilité des signatures
- Lien indissociable signature ↔ donnée

---

## 🔴 4. Validation système (CSV)
- Validation basée sur le risque
- URS approuvées
- Matrice de traçabilité (RTM)
- Tests couvrant :
  - fonctions critiques
  - sécurité
  - audit trail
- Déviations documentées et justifiées
- Rapport de validation signé

> **Sans ça = rejet quasi certain en audit pharma**

---

## 🔴 5. Gestion des rôles (EDC)
- Séparation stricte :
  - investigateur
  - moniteur (CRA)
  - data manager
  - admin
- Aucun rôle “super user” non contrôlé
- Accès site par site (multi-centres)

---

## 🔴 6. Gestion des données cliniques
- Verrouillage des données (lock / freeze)
- Gestion des queries (data clarification forms)
- Historique complet des corrections
- Export conforme CDISC (si applicable)

---

## 🔴 7. Infrastructure & sécurité (attendu implicite)
- Hébergement HDS prouvé
- Tests de pénétration réguliers
- Scan de vulnérabilités
- Correctifs appliqués rapidement

---

## 🔴 8. Change Control (GxP)
- Tout changement tracé
- Analyse d’impact GCP
- Validation avant mise en production
- Versioning logiciel clair

---

## 🔴 9. Documentation (souvent là où ça casse)
- SOPs disponibles :
  - gestion des accès
  - sauvegardes
  - incidents
  - validation
- Manuel utilisateur
- Documentation technique
- Formation utilisateurs tracée

---

## 🔴 10. Inspection readiness
- Capacité à rejouer une donnée complète
- Démonstration live possible :
  - audit trail
  - signature
  - correction de données
- Accès auditeur en lecture seule possible

---

## 🚨 Différence clé HDS vs ANSM / Pharma
- **HDS** → sécurité de l’hébergement
- **ANSM / GCP** → fiabilité scientifique et réglementaire des données

> **Tu peux être 100% HDS et recalé en audit pharma (ça arrive souvent).**

---

## 💡 Pour aller encore plus loin
- Matrice de scoring pondérée **ANSM-ready** (plus exigeante que HDS)
- Gap analysis de ton EDC actuel (ligne par ligne)
