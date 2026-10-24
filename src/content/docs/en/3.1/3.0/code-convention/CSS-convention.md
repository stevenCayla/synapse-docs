---
title: CSS Convention — BEM + CSS Nesting
description: "CSS naming and structure convention based on BEM and CSS Nesting:
  rules, reference pattern and common mistakes to avoid."
slug: 3.1/en/3.0/code-convention/css-convention
---

> Reference guide for writing CSS on the project.
> All new styles must follow these conventions.

***

## Table of Contents

1. [What is BEM?](#1-what-is-bem)
2. [Naming Syntax](#2-naming-syntax)
3. [CSS Nesting — Fundamentals](#3-css-nesting--fundamentals)
4. [The 10 Rules](#4-the-10-rules)
5. [Full Reference Pattern](#5-full-reference-pattern)
6. [Quick Reference](#6-quick-reference)
7. [Common Mistakes](#7-common-mistakes)

***

## 1. What is BEM?

**BEM** (Block Element Modifier) is a CSS naming convention that makes code predictable, maintainable, and reusable.

| Concept      | Role                                          | Separator |
|--------------|-----------------------------------------------|-----------|
| **Block**    | Standalone, reusable component                | —         |
| **Element**  | Internal part of a block                      | `__`      |
| **Modifier** | Variant or state of a block or element        | `--`      |

```
.block                        → component
.block__element               → sub-part of the component
.block--modifier              → variant of the component
.block__element--modifier     → variant of a sub-part
```

***

## 2. Naming Syntax

### Block

A self-contained component. The name describes **what it is**, not how it looks.

```css
/* ✅ */
.event-card { }
.search-form { }
.nav { }

/* ❌ Visual names */
.big-blue-box { }
.left-section { }
```

### Element

An internal part of the block. Always prefixed with the block name + `__`.

```css
.event-card__title { }
.event-card__image { }
.event-card__footer { }
.search-form__input { }
```

### Modifier

A variant or state. Always prefixed with the block or element name + `--`.

```css
/* Block modifier */
.event-card--featured { }
.event-card--past { }

/* Element modifier */
.event-card__type--show { }
.event-card__type--open { }
.btn-action--manage { }
.btn-action--delete { }
```

***

## 3. CSS Nesting — Fundamentals

CSS nesting allows selectors to be nested inside one another. The `&` character represents the **parent selector**.

### `&.` (no space) → same element

Used for **modifiers**, **pseudo-classes**, and **pseudo-elements**.

```css
.event-card {
    &.event-card--featured { }   /* → .event-card.event-card--featured */
    &:hover { }                  /* → .event-card:hover */
    &::before { }                /* → .event-card::before */
}
```

### `& .` (with space) → descendant

Used for **BEM elements** and **child tags**.

```css
.event-card {
    & .event-card__title { }     /* → .event-card .event-card__title */
    & img { }                    /* → .event-card img */
}
```

> **Golden rule**: `&.foo` = same element, `& .foo` = child.

***

## 4. The 10 Rules

### Rule 1 — Only one level of `__`

Never chain `__`. An element is always attached directly to the root block.

```css
/* ❌ */
.event-card__body__title { }
.event-card__footer__actions__btn { }

/* ✅ */
.event-card__title { }
.event-card__actions { }
.event-card__btn { }
```

### Rule 2 — A modifier is never used alone

In HTML, always apply the base class **and** the modifier.

```html
<!-- ❌ -->
<span class="event-card__type--open">Open Days</span>

<!-- ✅ -->
<span class="event-card__type event-card__type--open">Open Days</span>
```

### Rule 3 — Max 3 levels of nesting

Beyond that, code becomes unreadable and hard to debug.

```css
/* ✅ 3 levels — readable */
.event-card {                          /* level 1 */
    & .event-card__title {             /* level 2 */
        & a { &:hover { } }           /* level 3 */
    }
}

/* ❌ 5 levels — unmanageable */
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

### Rule 4 — One block per CSS section

Each block is independent. Never nest a block inside another.

```css
/* ✅ Two separate blocks */
.event-card {
    & .event-card__actions { display: flex; }
}

.btn-action {
    padding: 5px 12px;
    &.btn-action--manage { background: navy; }
    &.btn-action--delete { background: transparent; }
}

/* ❌ btn-action nested inside event-card */
.event-card {
    & .btn-action {
        &.btn-action--manage { }
    }
}
```

### Rule 5 — Block structure order

Always follow this order:

```css
.block {
    /* 1. Base styles */
    display: flex;
    border: 1px solid var(--border);

    /* 2. Block modifiers */
    &.block--featured { }
    &.block--past { }

    /* 3. States / pseudo-classes */
    &:hover { }
    &:focus { }

    /* 4. Pseudo-elements */
    &::before { }
    &::after { }

    /* 5. Child elements */
    & .block__element { }

    /* 6. Media queries */
    @media (max-width: 768px) { }
}
```

### Rule 6 — Name by function, not appearance

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

### Rule 7 — CSS variables for shared values

Never hard-code colors, sizes, or shadows.

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

### Rule 8 — Media queries close to the source

Two acceptable approaches. Pick one and **stay consistent** across the project.

```css
/* Option A: grouped at the end of the block */
.event-card {
    & .event-card__title { font-size: 1.3rem; }
    & .event-card__image { height: 180px; }

    @media (max-width: 768px) {
        & .event-card__title { font-size: 1.1rem; }
        & .event-card__image { height: 150px; }
    }
}

/* Option B: inline next to the relevant property */
.event-card {
    & .event-card__image {
        height: 180px;

        @media (max-width: 768px) {
            height: 150px;
        }
    }
}
```

### Rule 9 — No styles on bare tags (except within a scope)

```css
/* ❌ Global style on a tag */
img { border-radius: 8px; }
a { color: blue; }

/* ✅ Scoped inside a block */
.event-card {
    & img { border-radius: 8px; }
    & a { text-decoration: none; }
}
```

### Rule 10 — Section comments

Each block starts with a clear comment for navigation.

```css
/* ── Event Card ── */
.event-card { }

/* ── Stat Chip ── */
.stat-chip { }

/* ── Button Action ── */
.btn-action { }
```

***

## 5. Full Reference Pattern

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

/* ── Stat Chip (separate block) ── */
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

/* ── Button Action (separate block) ── */
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

***

## 6. Quick Reference

| Syntax          | Generated CSS                   | Usage                        |
|-----------------|---------------------------------|------------------------------|
| `&.foo`         | `.parent.foo`                   | Modifier, combined class     |
| `&:hover`       | `.parent:hover`                 | Pseudo-class                 |
| `&::before`     | `.parent::before`               | Pseudo-element               |
| `& .foo`        | `.parent .foo`                  | BEM child element            |
| `& img`         | `.parent img`                   | Child HTML tag               |

***

## 7. Common Mistakes

### Accidental space in a modifier

```css
/* ❌ Generates: .event-card__type --show (non-existent descendant) */
& .event-card__type {
    & --show { background: navy; }
}

/* ✅ Generates: .event-card__type.event-card__type--show */
& .event-card__type {
    &.event-card__type--show { background: navy; }
}
```

### Looking for a descendant instead of the same element

```css
/* ❌ Looks for a child .event-card__type--show INSIDE .event-card__type */
& .event-card__type .event-card__type--show { }

/* ✅ Same element carrying both classes */
& .event-card__type {
    &.event-card__type--show { }
}
```

### Modifier used alone in HTML

```html
<!-- ❌ Base styles won't apply -->
<span class="event-card__type--open">

<!-- ✅ Base + modifier -->
<span class="event-card__type event-card__type--open">
```

### Block nested inside another block

```css
/* ❌ Creates coupling between blocks */
.event-card {
    & .btn-action { }
}

/* ✅ Each block is independent */
.event-card { }
.btn-action { }
```

***

> **Last updated**: February 2026
