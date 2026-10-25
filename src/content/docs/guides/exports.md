---
title: Exporter les données
description: Extraire les données pour l'analyse statistique ou la soumission réglementaire.
time: "4 min"
sheet: true
---

## 1. Choisir le format

**Étude** → **Exports** → **Nouvel export**.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Format** \* | `CDISC ODM` | **Excel / CSV** pour l'analyse, **CDISC ODM** pour l'échange et l'archivage, avec le mapping SDTM défini dans le concepteur. |
| **Périmètre** | `Tous les sites` | Sites, formulaires, période. |
| **Données identifiantes** \* | `Exclues` | Exclues par défaut ; pseudonymisées sur demande. |
| **Audit trail** | inclure | Joint l'historique complet des modifications. |

## 2. Télécharger

L'export est préparé en arrière-plan ; une notification signale qu'il est prêt.

**Ce que vous devez voir** : chaque export a une empreinte SHA-256 et apparaît dans le journal d'activité.

:::tip[Exports de base verrouillée]
Après verrouillage, les exports portent sur l'instantané figé : deux exports successifs sont identiques.
:::

