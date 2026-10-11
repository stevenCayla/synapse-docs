---
title: "Convention CSS — BEM + CSS Nesting"
description: "Convention de nommage et de structure CSS basée sur BEM et le CSS Nesting : règles, pattern de référence et erreurs fréquentes à éviter."
---

> Guide de référence pour l'écriture du CSS sur le projet.
> Tous les nouveaux styles doivent respecter ces conventions.

---

## Table des matières

1. [Qu'est-ce que BEM ?](#1-quest-ce-que-bem-)
2. [Syntaxe de nommage](#2-syntaxe-de-nommage)
3. [CSS Nesting — Règles de base](#3-css-nesting--règles-de-base)
4. [Les 10 règles à respecter](#4-les-10-règles-à-respecter)
5. [Pattern complet de référence](#5-pattern-complet-de-référence)
6. [Mémo rapide](#6-mémo-rapide)
7. [Erreurs fréquentes](#7-erreurs-fréquentes)

---

## 1. Qu'est-ce que BEM ?

**BEM** (Block Element Modifier) est une convention de nommage CSS qui rend le code prévisible, maintenable et réutilisable.

| Concept      | Rôle                                         | Séparateur |
|--------------|----------------------------------------------|------------|
| **Block**    | Composant autonome et réutilisable           | —          |
| **Element**  | Partie interne d'un block                    | `__`       |
| **Modifier** | Variante ou état d'un block ou d'un element  | `--`       |

```
.block                        → composant
.block__element               → sous-partie du composant
.block--modifier              → variante du composant
.block__element--modifier     → variante d'une sous-partie
```

---

## 2. Syntaxe de nommage

### Block

Un composant autonome. Le nom décrit **ce que c'est**, pas à quoi il ressemble.

```css
/* ✅ */
.event-card { }
.search-form { }
.nav { }

/* ❌ Noms visuels */
.big-blue-box { }
.left-section { }
```

### Element

Une partie interne du block. Toujours préfixée par le nom du block + `__`.

```css
.event-card__title { }
.event-card__image { }
.event-card__footer { }
.search-form__input { }
```

### Modifier

Une variante ou un état. Toujours préfixé par le nom du block ou de l'element + `--`.

```css
/* Modifier de block */
.event-card--featured { }
.event-card--past { }

/* Modifier d'element */
.event-card__type--show { }
.event-card__type--open { }
.btn-action--manage { }
.btn-action--delete { }
```

---

## 3. CSS Nesting — Règles de base

Le CSS nesting permet d'imbriquer les sélecteurs. Le caractère `&` représente le **sélecteur parent**.

### `&.` (collé, sans espace) → même élément

Utilisé pour les **modifiers**, les **pseudo-classes** et les **pseudo-éléments**.

```css
.event-card {
    &.event-card--featured { }   /* → .event-card.event-card--featured */
    &:hover { }                  /* → .event-card:hover */
    &::before { }                /* → .event-card::before */
}
```

### `& .` (avec espace) → descendant

Utilisé pour les **elements BEM** et les **tags enfants**.

```css
.event-card {
    & .event-card__title { }     /* → .event-card .event-card__title */
    & img { }                    /* → .event-card img */
}
```

> **Règle d'or** : `&.foo` = même élément, `& .foo` = enfant.

---

## 4. Les 10 règles à respecter

### Règle 1 — Un seul niveau de `__`

Ne jamais chaîner les `__`. Un element est toujours rattaché directement au block racine.

```css
/* ❌ */
.event-card__body__title { }
.event-card__footer__actions__btn { }

/* ✅ */
.event-card__title { }
.event-card__actions { }
.event-card__btn { }
```

### Règle 2 — Un modifier ne s'utilise jamais seul

En HTML, toujours appliquer la classe de base **et** le modifier.

```html
<!-- ❌ -->
<span class="event-card__type--open">Open Days</span>

<!-- ✅ -->
<span class="event-card__type event-card__type--open">Open Days</span>
```

### Règle 3 — Max 3 niveaux d'imbrication

Au-delà, le code devient illisible et difficile à débugger.

```css
/* ✅ 3 niveaux — lisible */
.event-card {                          /* niveau 1 */
    & .event-card__title {             /* niveau 2 */
        & a { &:hover { } }           /* niveau 3 */
    }
}

/* ❌ 5 niveaux — ingérable */
.event-card {
    & .event-card__body {
        & .event-card__title {
            & a {
                & span {
                    &:hover { }
                }
            }
        }
    }
}
```

### Règle 4 — Un block par section CSS

Chaque block est indépendant. Ne jamais imbriquer un block dans un autre.

```css
/* ✅ Deux blocks séparés */
.event-card {
    & .event-card__actions { display: flex; }
}

.btn-action {
    padding: 5px 12px;
    &.btn-action--manage { background: navy; }
    &.btn-action--delete { background: transparent; }
}

/* ❌ btn-action imbriqué dans event-card */
.event-card {
    & .btn-action {
        &.btn-action--manage { }
    }
}
```

### Règle 5 — Structure d'un block

Toujours dans cet ordre :

```css
.block {
    /* 1. Styles de base */
    display: flex;
    border: 1px solid var(--border);

    /* 2. Modifiers du block */
    &.block--featured { }
    &.block--past { }

    /* 3. États / pseudo-classes du block */
    &:hover { }
    &:focus { }

    /* 4. Pseudo-éléments du block */
    &::before { }
    &::after { }

    /* 5. Elements enfants */
    & .block__element { }

    /* 6. Media queries */
    @media (max-width: 768px) { }
}
```

### Règle 6 — Nommer par fonction, pas par apparence

```css
/* ❌ */
.red-button { }
.big-card { }
.left-sidebar { }

/* ✅ */
.btn-action--delete { }
.event-card--featured { }
.nav--sidebar { }
```

### Règle 7 — Variables CSS pour les valeurs partagées

Ne pas hard-coder les couleurs, tailles et ombres.

```css
:root {
    --navy: #0c1b33;
    --border: #e5e2db;
    --radius: 14px;
    --shadow-sm: 0 1px 3px rgba(12, 27, 51, .06);
    --transition: all .3s cubic-bezier(.4, 0, .2, 1);
}

.event-card {
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    transition: var(--transition);
}
```

### Règle 8 — Media queries au plus proche

Deux options acceptables. Choisir l'une et **rester cohérent** dans tout le projet.

```css
/* Option A : regroupées à la fin du block */
.event-card {
    & .event-card__title { font-size: 1.3rem; }
    & .event-card__image { height: 180px; }

    @media (max-width: 768px) {
        & .event-card__title { font-size: 1.1rem; }
        & .event-card__image { height: 150px; }
    }
}

/* Option B : inline à côté de la propriété concernée */
.event-card {
    & .event-card__image {
        height: 180px;

        @media (max-width: 768px) {
            height: 150px;
        }
    }
}
```

### Règle 9 — Pas de styles sur les tags seuls (sauf dans un scope)

```css
/* ❌ Style global sur un tag */
img { border-radius: 8px; }
a { color: blue; }

/* ✅ Scopé dans un block */
.event-card {
    & img { border-radius: 8px; }
    & a { text-decoration: none; }
}
```

### Règle 10 — Commentaires de section

Chaque block commence par un commentaire clair pour la navigation.

```css
/* ── Event Card ── */
.event-card { }

/* ── Stat Chip ── */
.stat-chip { }

/* ── Button Action ── */
.btn-action { }
```

---

## 5. Pattern complet de référence

```css
/* ── Event Card ── */
.event-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
    transition: var(--transition);

    /* Modifiers */
    &.event-card--featured { border-color: var(--gold); }
    &.event-card--past { opacity: .6; filter: grayscale(.3); }

    /* States */
    &:hover {
        box-shadow: var(--shadow-lg);
        transform: translateY(-4px);
    }

    /* Elements */
    & .event-card__image {
        position: relative;
        height: 180px;
        overflow: hidden;

        & img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform .5s ease;
        }

        &::after {
            content: '';
            position: absolute;
            inset: 0;
            background: linear-gradient(0deg, rgba(0, 0, 0, .5) 0%, transparent 60%);
            pointer-events: none;
        }
    }

    &:hover .event-card__image img {
        transform: scale(1.05);
    }

    & .event-card__type {
        position: absolute;
        top: 12px;
        left: 12px;
        font-size: .7rem;
        font-weight: 700;
        text-transform: uppercase;
        padding: 4px 10px;
        border-radius: 6px;

        &.event-card__type--show { background: rgba(12, 27, 51, .7); color: #fff; }
        &.event-card__type--open { background: rgba(201, 168, 76, .85); color: #fff; }
    }

    & .event-card__title {
        font-size: 1.3rem;
        font-weight: 700;
        margin: 0 0 8px;

        & a {
            color: var(--navy);
            text-decoration: none;
            transition: color .2s;

            &:hover { color: var(--sea); }
        }
    }

    & .event-card__location {
        font-size: .82rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 5px;

        & i { color: var(--coral); }
    }

    & .event-card__stats {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
    }

    & .event-card__footer {
        padding: 14px 20px;
        margin-top: auto;
        border-top: 1px solid var(--border);
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    & .event-card__author {
        font-size: .72rem;
        color: var(--text-muted);
        display: flex;
        align-items: center;
        gap: 6px;

        & .avatar {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            background: var(--navy);
            color: #fff;
            font-size: .6rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    }

    & .event-card__actions {
        display: flex;
        gap: 6px;
    }

    /* Responsive */
    @media (max-width: 768px) {
        & .event-card__image { height: 150px; }
        & .event-card__title { font-size: 1.1rem; }
    }
}

/* ── Stat Chip (block séparé) ── */
.stat-chip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    font-size: .78rem;
    font-weight: 500;
    background: var(--sea-light);
    color: var(--sea);
    text-decoration: none;
    transition: var(--transition);

    &:hover { background: var(--sea); color: #fff; }

    &.stat-chip--empty {
        background: #f3f3f0;
        color: #aaa;

        &:hover { background: #e5e5e0; color: #888; }
    }
}

/* ── Button Action (block séparé) ── */
.btn-action {
    font-size: .75rem;
    padding: 5px 12px;
    border-radius: 8px;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border: none;
    cursor: pointer;
    transition: var(--transition);

    &.btn-action--manage {
        background: var(--navy);
        color: #fff;

        &:hover { background: var(--navy-light); }
    }

    &.btn-action--delete {
        background: transparent;
        color: #ccc;

        &:hover { background: #fef2f2; color: var(--coral); }
    }
}
```

---

## 6. Mémo rapide

| Syntaxe         | Résultat CSS                    | Usage                        |
|-----------------|---------------------------------|------------------------------|
| `&.foo`         | `.parent.foo`                   | Modifier, classe combinée   |
| `&:hover`       | `.parent:hover`                 | Pseudo-classe                |
| `&::before`     | `.parent::before`               | Pseudo-élément               |
| `& .foo`        | `.parent .foo`                  | Element BEM enfant           |
| `& img`         | `.parent img`                   | Tag HTML enfant              |

---

## 7. Erreurs fréquentes

### Espace involontaire dans un modifier

```css
/* ❌ Génère : .event-card__type --show (descendant inexistant) */
& .event-card__type {
    & --show { background: navy; }
}

/* ✅ Génère : .event-card__type.event-card__type--show */
& .event-card__type {
    &.event-card__type--show { background: navy; }
}
```

### Chercher un descendant au lieu du même élément

```css
/* ❌ Cherche un enfant .event-card__type--show DANS .event-card__type */
& .event-card__type .event-card__type--show { }

/* ✅ Même élément qui porte les deux classes */
& .event-card__type {
    &.event-card__type--show { }
}
```

### Modifier utilisé seul en HTML

```html
<!-- ❌ Les styles de base ne s'appliquent pas -->
<span class="event-card__type--open">

<!-- ✅ La base + le modifier -->
<span class="event-card__type event-card__type--open">
```

### Block imbriqué dans un autre

```css
/* ❌ Crée un couplage entre les deux blocks */
.event-card {
    & .btn-action { }
}

/* ✅ Chaque block est indépendant */
.event-card { }
.btn-action { }
```

---

> **Dernière mise à jour** : Février 2026
