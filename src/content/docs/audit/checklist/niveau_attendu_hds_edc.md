---
title: "✅ Niveau attendu HDS / EDC sérieux"
---

## 🌐 Réseau
- VPC / réseaux séparés (ou sous-réseaux isolés)
- Pas de communication directe dev → prod
- Firewall strict entre environnements

## 🔐 Accès
- Comptes différents :
  - dev ≠ prod
- Accès prod limité (très restreint)
- Bastion / jump host pour accès prod

## 💾 Données
- Aucune donnée patient réelle en dev
- Données staging :
  - anonymisées ou pseudonymisées
