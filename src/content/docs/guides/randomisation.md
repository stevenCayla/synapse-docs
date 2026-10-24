---
title: Randomiser un patient
description: Attribuer un bras de traitement, gérer l'aveugle et la levée d'aveugle d'urgence.
time: "5 min"
---

:::caution[Études concernées]
Uniquement les études à design randomisé. La randomisation n'est pas disponible pour une RIPH 3.
:::

## 1. Paramètres (data manager)

Configurés à la création de l'étude, puis verrouillés en production.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Ratio** \* | `1:1` | La répartition entre bras. |
| **Taille de bloc** \* | `4` | Doit être un multiple de la somme du ratio. |
| **Facteurs de stratification** | `Site, stade` | Équilibrent les bras au sein de chaque strate. |

## 2. Randomiser

Fiche patient → **Randomiser**. Le bouton n'apparaît qu'une fois l'éligibilité confirmée.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Strates** \* | `Stade III` | Pré-remplies depuis l'eCRF quand c'est possible. |
| **Signature** \* | votre mot de passe | La randomisation est définitive et signée. |

**Ce que vous devez voir** : en aveugle, seul le numéro de traitement s'affiche, jamais le bras.

## 3. Lever l'aveugle en urgence

Fiche patient → **Levée d'aveugle**. Réservé à l'investigateur principal.

| Champ | Exemple | À quoi ça sert |
|-------|---------|----------------|
| **Motif** \* | `Événement indésirable grave` | Obligatoire, conservé dans l'audit trail. |
| **Confirmation** \* | mot de passe | Une notification part au promoteur et au data manager. |

:::caution[Action irréversible]
Le bras est révélé uniquement à l'utilisateur qui lève l'aveugle, pour ce patient.
:::

---

Précédent : [Requêtes et monitoring](../requetes-monitoring/) · Suivant : [Gel et verrouillage](../gel-verrouillage/)
