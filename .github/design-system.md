---

# Design System Redirect — Harvesters Reporting System

> **IMPORTANT:** This file is no longer the source of truth for the design system. All AI agents, Copilot, and automation tools must reference `.ai-system/agents/design-system.md` for the canonical design system, token rules, and UI/UX patterns.

All .github AI/dev artifacts are now pointers only. Do not update this file except to change the redirect location.

Tier 3: Tailwind Utility Exposure (@theme inline — Tier 2 exposed as Tailwind classes)
e.g., bg-ds-surface-elevated, text-ds-text-primary, border-ds-border-base

````

### Semantic Token Categories

| Category            | Prefix           | Purpose                              |
| ------------------- | ---------------- | ------------------------------------ |
| Brand / Accent      | `--ds-brand-*`   | Single accent + brand black scale    |
| Status / Functional | `--ds-status-*`  | Success, warning, error, info        |
| Surfaces            | `--ds-surface-*` | Backgrounds for every layer          |
| Text                | `--ds-text-*`    | Typography colors at every hierarchy |
| Borders             | `--ds-border-*`  | Component borders, dividers          |
| Glow                | `--ds-glow-*`    | Interactive box-shadow values        |
| Charts              | `--ds-chart-*`   | Categorical chart series colors      |
| Shape               | `--ds-radius-*`  | Border radius scale                  |
| Shadows             | `--ds-shadow-*`  | Elevation shadows                    |
| Typography          | `--ds-font-*`    | Font family stacks                   |

---

## 3. Token Reference

### Light Mode — `:root`

```css
:root {
  /* ── Palette ── */

  /* Brand Black Scale */
  --palette-black-base: #0a0a0b;
  --palette-black-soft: #111214;
  --palette-black-elevated: #16171a;

  /* Emerald Accent Scale (Harvesters green — single accent) */
  --palette-emerald-900: #064e3b;
  --palette-emerald-700: #047857;
  --palette-emerald-600: #059669;
  --palette-emerald-500: #10b981;
  --palette-emerald-400: #34d399;
  --palette-emerald-200: #a7f3d0;
  --palette-emerald-50: #ecfdf5;

  /* Neutral Scale */
  --palette-neutral-950: #0a0a0a;
  --palette-neutral-900: #0f172a;
  --palette-neutral-800: #1e293b;
  --palette-neutral-700: #374151;
  --palette-neutral-600: #4b5563;
  --palette-neutral-500: #64748b;
  --palette-neutral-400: #94a3b8;
  --palette-neutral-300: #cbd5e1;
  --palette-neutral-200: #e5e7eb;
  --palette-neutral-100: #f1f5f9;
  --palette-neutral-50: #f8f9fb;
  --palette-neutral-0: #ffffff;

  /* ── Brand / Accent ── */
  --ds-brand-accent: var(--palette-emerald-500); /* #10b981 — theme-invariant */
  --ds-brand-accent-hover: var(--palette-emerald-600);
  --ds-brand-accent-subtle: var(--palette-emerald-50);
  --ds-brand-black: var(--palette-black-base);
  --ds-brand-black-soft: var(--palette-black-soft);
  --ds-brand-black-elevated: var(--palette-black-elevated);

  /* ── Status ── */
  --ds-status-success: #15803d;
  --ds-status-warning: #b45309;
  --ds-status-error: #dc2626;
  --ds-status-info: var(--palette-emerald-700);

  /* ── Surfaces ── */
  --ds-surface-base: var(--palette-neutral-50);
  --ds-surface-elevated: var(--palette-neutral-0);
  --ds-surface-sunken: var(--palette-neutral-100);
  --ds-surface-overlay: var(--palette-neutral-0);
  --ds-surface-sidebar: var(--palette-neutral-0);
  --ds-surface-header: var(--palette-neutral-0);
  --ds-surface-glass: rgba(255, 255, 255, 0.7);

  /* ── Text ── */
  --ds-text-primary: var(--palette-neutral-900);
  --ds-text-secondary: var(--palette-neutral-500);
  --ds-text-subtle: var(--palette-neutral-400);
  --ds-text-inverse: var(--palette-neutral-0);
  --ds-text-link: var(--palette-emerald-600);

  /* ── Borders ── */
  --ds-border-base: var(--palette-neutral-200);
  --ds-border-strong: var(--palette-neutral-300);
  --ds-border-subtle: var(--palette-neutral-100);
  --ds-border-glass: rgba(255, 255, 255, 0.6);

  /* ── Glow ── */
  --ds-glow-accent-soft: 0 0 0 1px rgba(16, 185, 129, 0.2);
  --ds-glow-accent-strong: 0 0 20px rgba(16, 185, 129, 0.25);

  /* ── Chart / Categorical ── */
  --ds-chart-1: #2563eb; /* Reports / Users */
  --ds-chart-2: #10b981; /* Groups / Campuses */
  --ds-chart-3: #7c3aed; /* Templates */
  --ds-chart-4: #ea580c; /* Deadlines / Alerts */
  --ds-chart-5: #0891b2; /* Analytics */
  --ds-chart-6: #be185d; /* Special */

  /* ── Shape ── */
  --ds-radius-sm: 4px;
  --ds-radius-md: 8px;
  --ds-radius-lg: 12px;
  --ds-radius-xl: 20px;
  --ds-radius-2xl: 24px;
  --ds-radius-full: 9999px;

  /* ── Shadows ── */
  --ds-shadow-sm:
    0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04);
  --ds-shadow-md:
    0 4px 8px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05);
  --ds-shadow-lg:
    0 12px 20px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06);
  --ds-shadow-xl:
    0 24px 32px -8px rgb(0 0 0 / 0.12), 0 8px 16px -6px rgb(0 0 0 / 0.07);

  /* ── Typography ── */
  --ds-font-sans:
    "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --ds-font-mono: "JetBrains Mono", "Fira Code", "Cascadia Code", monospace;
}
````

### Dark Mode — `.dark` (overrides only)

```css
.dark {
  /* ── Surfaces ── */
  --ds-surface-base: var(--palette-black-base);
  --ds-surface-elevated: var(--palette-black-soft);
  --ds-surface-sunken: var(--palette-black-base);
  --ds-surface-overlay: var(--palette-black-soft);
  --ds-surface-sidebar: var(--palette-black-base);
  --ds-surface-header: var(--palette-black-soft);
  --ds-surface-glass: rgba(255, 255, 255, 0.04);

  /* Brand accent stays #10b981 — theme-invariant */
  --ds-brand-accent-subtle: rgba(16, 185, 129, 0.12);

  /* ── Status ── */
  --ds-status-success: #4ade80;
  --ds-status-warning: #fbbf24;
  --ds-status-error: #f87171;
  --ds-status-info: var(--palette-emerald-400);

  /* ── Text ── */
  --ds-text-primary: #f8fafc;
  --ds-text-secondary: var(--palette-neutral-400);
  --ds-text-subtle: #475569;
  --ds-text-inverse: var(--palette-neutral-900);
  --ds-text-link: var(--palette-emerald-400);

  /* ── Borders ── */
  --ds-border-base: rgba(255, 255, 255, 0.08);
  --ds-border-strong: rgba(255, 255, 255, 0.14);
  --ds-border-subtle: rgba(255, 255, 255, 0.04);
  --ds-border-glass: rgba(255, 255, 255, 0.08);

  /* ── Glow ── */
  --ds-glow-accent-soft: 0 0 0 1px rgba(16, 185, 129, 0.25);
  --ds-glow-accent-strong: 0 0 20px rgba(16, 185, 129, 0.3);

  /* ── Chart — brighter for dark backgrounds ── */
  --ds-chart-1: #60a5fa;
  --ds-chart-2: #34d399;
  --ds-chart-3: #a78bfa;
  --ds-chart-4: #fb923c;
  --ds-chart-5: #22d3ee;
  --ds-chart-6: #f472b6;

  /* ── Shadows ── */
  --ds-shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.3);
  --ds-shadow-md: 0 4px 8px -2px rgb(0 0 0 / 0.5), 0 2px 4px -2px rgb(0 0 0 / 0.35);
  --ds-shadow-lg: 0 12px 20px -4px rgb(0 0 0 / 0.6), 0 4px 8px -4px rgb(0 0 0 / 0.4);
  --ds-shadow-xl: 0 24px 32px -8px rgb(0 0 0 / 0.7), 0 8px 16px -6px rgb(0 0 0 / 0.5);
}
```

### Tailwind Utility Exposure — `@theme inline`

Paste this block in `app/globals.css` immediately after the token definitions. This exposes all `--ds-*` tokens as Tailwind utility classes with the `ds-` prefix.

```css
@theme inline {
  /* Brand */
  --color-ds-brand-accent: var(--ds-brand-accent);
  --color-ds-brand-accent-hover: var(--ds-brand-accent-hover);
  --color-ds-brand-accent-subtle: var(--ds-brand-accent-subtle);
  --color-ds-brand-black: var(--ds-brand-black);
  --color-ds-brand-black-soft: var(--ds-brand-black-soft);
  --color-ds-brand-black-elevated: var(--ds-brand-black-elevated);

  /* Status */
  --color-ds-status-success: var(--ds-status-success);
  --color-ds-status-warning: var(--ds-status-warning);
  --color-ds-status-error: var(--ds-status-error);
  --color-ds-status-info: var(--ds-status-info);

  /* Surfaces */
  --color-ds-surface-base: var(--ds-surface-base);
  --color-ds-surface-elevated: var(--ds-surface-elevated);
  --color-ds-surface-sunken: var(--ds-surface-sunken);
  --color-ds-surface-overlay: var(--ds-surface-overlay);
  --color-ds-surface-sidebar: var(--ds-surface-sidebar);
  --color-ds-surface-header: var(--ds-surface-header);
  --color-ds-surface-glass: var(--ds-surface-glass);

  /* Text */
  --color-ds-text-primary: var(--ds-text-primary);
  --color-ds-text-secondary: var(--ds-text-secondary);
  --color-ds-text-subtle: var(--ds-text-subtle);
  --color-ds-text-inverse: var(--ds-text-inverse);
  --color-ds-text-link: var(--ds-text-link);

  /* Borders */
  --color-ds-border-base: var(--ds-border-base);
  --color-ds-border-strong: var(--ds-border-strong);
  --color-ds-border-subtle: var(--ds-border-subtle);
  --color-ds-border-glass: var(--ds-border-glass);

  /* Charts */
  --color-ds-chart-1: var(--ds-chart-1);
  --color-ds-chart-2: var(--ds-chart-2);
  --color-ds-chart-3: var(--ds-chart-3);
  --color-ds-chart-4: var(--ds-chart-4);
  --color-ds-chart-5: var(--ds-chart-5);
  --color-ds-chart-6: var(--ds-chart-6);

  /* Radii */
  --radius-ds-sm: var(--ds-radius-sm);
  --radius-ds-md: var(--ds-radius-md);
  --radius-ds-lg: var(--ds-radius-lg);
  --radius-ds-xl: var(--ds-radius-xl);
  --radius-ds-2xl: var(--ds-radius-2xl);
  --radius-ds-full: var(--ds-radius-full);

  /* Shadows */
  --shadow-ds-sm: var(--ds-shadow-sm);
  --shadow-ds-md: var(--ds-shadow-md);
  --shadow-ds-lg: var(--ds-shadow-lg);
  --shadow-ds-xl: var(--ds-shadow-xl);

  /* Typography */
  --font-ds-sans: var(--ds-font-sans);
  --font-ds-mono: var(--ds-font-mono);
}
```

---

## 4. Typography System

### Fonts

| Role           | Stack                                                                | Usage                         |
| -------------- | -------------------------------------------------------------------- | ----------------------------- |
| Sans (primary) | `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif` | All UI text, headings, labels |
| Mono           | `"JetBrains Mono", "Fira Code", monospace`                           | Data tables, numeric values   |

Both loaded via `next/font/google` in `app/layout.tsx`.

### Scale

| Level   | Size                 | Weight  | Letter-spacing | Usage                                        |
| ------- | -------------------- | ------- | -------------- | -------------------------------------------- |
| Display | 36–42px              | 700     | `-0.03em`      | Large stat values in KPI cards               |
| H1      | 30px / `text-3xl`    | 700     | `-0.025em`     | Page titles                                  |
| H2      | 24px / `text-2xl`    | 600     | `-0.02em`      | Section headers                              |
| H3      | 20px / `text-xl`     | 600     | `-0.01em`      | Card headers, section titles on report forms |
| Body    | 15px / `text-[15px]` | 400     | `0`            | Standard prose, form labels                  |
| Small   | 13px / `text-[13px]` | 400     | `0`            | Form hints, field labels, metadata           |
| Meta    | 12px / `text-xs`     | 400–500 | `0.01em`       | Timestamps, read/unread badges               |

### Rules

- Tight letter-spacing on all headings (`-0.01em` to `-0.03em`)
- **Never use pure white (`#FFFFFF`) for body text in dark mode** — use `--ds-text-primary` (`#F8FAFC`)
- Semi-bold (`font-semibold`) for section headers, not bold
- Mono font (`font-ds-mono`) for all numerical data cells in report metric tables
- Line height: `1.5` body · `1.2` headings · `1.8` dense tables

---

## 5. Layout System

### App Shell

```
+--------------------------------------------------+
|  Sidebar (240px / collapsed 80px) |  Main Area  |
|                                   +-------------|
|  - Brand mark + logo              |  Top Header |
|  - Navigation items               +-------------|
|  - Role badge                     |  Content    |
|  - Collapse toggle                |  (scrolls)  |
+-----------------------------------+-------------+
```

| Property          | Desktop     | Tablet          | Mobile          |
| ----------------- | ----------- | --------------- | --------------- |
| Sidebar width     | 240px       | Hidden → Drawer | Hidden → Drawer |
| Sidebar collapsed | 80px        | —               | —               |
| Outer padding     | 24px        | 16px            | 12px            |
| Content max-width | none (full) | —               | —               |

### Bento Grid (KPI / Analytics Sections)

The KPI and analytics sections use a **12-column bento grid**. Report data screens (tables, forms) do **not** use bento — they use standard full-width layouts.

```
Desktop (12-col):
+------------------+------------------+---------+---------+
|  Large Block     |  Large Block     |   SM    |   SM    |
|   (span-6)       |   (span-6)       | (span3) | (span3) |
+-------+----------+------------------+---------+---------+
|  SM   |  Wide Analytics Block (span-9)                  |
|(span3)|                                                  |
+-------+--------------------------------------------------+
```

**Bento rules:**

- `--ds-radius-xl` (20px) on all bento cells
- Mixed heights; KPI min-height `120px`, analytics min-height `240px`
- Gap: `gap-4` (16px)
- Tablet: 6-col · Mobile: single column

### Page Anatomy

Every authenticated page follows this strict top-to-bottom structure:

```
1. Page Header       H1 title + context/date + primary CTA
2. KPI Bento Row     3–5 stat cards (glass surface variant)
3. Primary Data      Main table / list / report form (opaque, no glass)
4. Analytics Row     Charts, trends, sparklines
5. Secondary         Activity feed, quick actions (e.g., report timeline)
```

**Section header pattern:**

```tsx
<div className="flex items-center gap-3 mb-4">
  <h2 className="text-xl font-semibold text-ds-text-primary tracking-tight">Section Title</h2>
  <div className="h-0.5 w-8 bg-ds-brand-accent rounded-full" />
</div>
```

---

## 6. Component Guidelines

### Sidebar

| Property        | Value                                                                                           |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Background      | `bg-ds-surface-sidebar` (white light / `#0A0A0B` dark)                                          |
| Border-right    | `1px solid var(--ds-border-base)`                                                               |
| Active nav item | `bg-ds-brand-accent-subtle` + `text-ds-brand-accent` + `box-shadow: var(--ds-glow-accent-soft)` |
| Hover nav item  | `bg-ds-surface-sunken`                                                                          |
| Text            | `text-ds-text-primary` (theme-aware — do **not** force dark)                                    |

> The sidebar is **theme-aware** — it uses `--ds-surface-sidebar` which is white in light mode and deep black in dark mode. There is **no** `bg-indigo-*` or forced dark background.

### Cards

Four variants, all with `--ds-radius-xl` (20px) corners:

| Variant         | When to Use                               | Style                                                                          |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------------ |
| **Standard**    | Tables, report forms, CRM data            | `bg-ds-surface-elevated`, `border-ds-border-base`, `shadow-ds-md`              |
| **Glass**       | KPI stat cards, analytics overview blocks | `bg-ds-surface-glass`, `backdrop-filter: blur(12px)`, `border-ds-border-glass` |
| **Elevated**    | Featured / highlighted content            | `bg-ds-surface-elevated`, `shadow-ds-lg`                                       |
| **Glow-active** | Selected / expanded card                  | Standard + `box-shadow: var(--ds-glow-accent-strong)`                          |

### Report Status Badge Colors

| Status         | Token                    |
| -------------- | ------------------------ |
| DRAFT          | `--ds-text-subtle`       |
| SUBMITTED      | `--ds-chart-1` (blue)    |
| REQUIRES_EDITS | `--ds-status-warning`    |
| APPROVED       | `--ds-status-success`    |
| REVIEWED       | `--ds-chart-2` (emerald) |
| LOCKED         | `--ds-text-secondary`    |

### KPI Card — Stat Type Colors

| Stat Type              | Old (relic)       | New Token         |
| ---------------------- | ----------------- | ----------------- |
| Reports / Users        | `text-blue-600`   | `text-ds-chart-1` |
| Campuses / Groups      | `text-green-600`  | `text-ds-chart-2` |
| Templates              | `text-purple-600` | `text-ds-chart-3` |
| Deadlines / Alerts     | `text-orange-600` | `text-ds-chart-4` |
| Compliance / Analytics | —                 | `text-ds-chart-5` |

### Buttons

| Variant       | Style                                                                                   |
| ------------- | --------------------------------------------------------------------------------------- |
| **Primary**   | `bg-ds-brand-accent` · white text · `rounded-[var(--ds-radius-lg)]` (12px)              |
| **Secondary** | Transparent · `border-ds-border-base` · hover: `box-shadow: var(--ds-glow-accent-soft)` |
| **Ghost**     | Text only · `text-ds-text-secondary` · hover: `text-ds-brand-accent`                    |
| **Danger**    | `bg-ds-status-error` · white text                                                       |

### Tables

Tables are report-critical. Clarity above all. **Never** apply glass to tables.

```
Background:  bg-ds-surface-elevated (both modes via token)
Border:      border-ds-border-base
Wrapper:     rounded-[var(--ds-radius-lg)] overflow-hidden
Row hover:   bg-ds-brand-accent-subtle
Headers:     sticky, font-semibold, text-ds-text-secondary
Numeric cols: font-ds-mono
```

### Forms / Inputs

```css
/* Target dimensions */
height: 44px; /* WCAG minimum touch target */
border-radius: var(--ds-radius-lg); /* 12px */
border: 1px solid var(--ds-border-base);
background: var(--ds-surface-sunken);
font-size: 15px;
color: var(--ds-text-primary);

/* Focus */
border-color: var(--ds-brand-accent);
box-shadow: var(--ds-glow-accent-soft);
outline: none;
```

Labels are always **above inputs**, never inline-only or placeholder-only.

### Modals

```css
.ds-modal {
  border-radius: var(--ds-radius-2xl); /* 24px */
}
.ds-modal-header {
  background: var(--ds-surface-glass);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--ds-border-glass);
}
```

Motion: `opacity(0→1)` + `scale(0.97→1.00)`, 200ms ease-in-out.

### Theme Toggle

- Rounded pill, 40×40px
- `bg-ds-surface-elevated` · `border-ds-border-base`
- Hover: `box-shadow: var(--ds-glow-accent-soft)`

---

## 7. Glassmorphism Rules

### Apply glass to:

- KPI / stat cards (in bento section)
- Analytics overview blocks
- Modal headers

### Never apply glass to:

- Data tables
- Report form fields or inputs
- Dense list screens (report list, user list)
- Sidebar navigation items
- Any element where text readability is paramount

### Implementation

**Dark mode:**

```css
background: rgba(255, 255, 255, 0.04);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.08);
```

**Light mode:**

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(8px);
-webkit-backdrop-filter: blur(8px);
border: 1px solid rgba(255, 255, 255, 0.6);
```

A `@layer utilities` class `.glass-surface` is defined in `globals.css`:

```css
@layer utilities {
  .glass-surface {
    background: var(--ds-surface-glass);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--ds-border-glass);
  }
}
```

Glass surfaces require a non-flat parent background to produce a meaningful blur effect.

---

## 8. Glow Border Strategy

### Apply to:

| Context                  | Token                     |
| ------------------------ | ------------------------- |
| Active sidebar nav item  | `--ds-glow-accent-soft`   |
| Selected / active card   | `--ds-glow-accent-strong` |
| Hovered interactive card | `--ds-glow-accent-soft`   |
| Focused input            | `--ds-glow-accent-soft`   |
| Active filter button     | `--ds-glow-accent-soft`   |

### Never apply to:

- Decorative elements at rest
- All cards simultaneously
- Table rows
- Static text or headings

### CSS Classes (defined in `globals.css`)

```css
@layer utilities {
  .ds-hover-glow:hover {
    box-shadow: var(--ds-glow-accent-soft);
    border-color: var(--ds-brand-accent);
    transition:
      box-shadow 200ms ease-in-out,
      border-color 200ms ease-in-out;
  }

  .ds-glow-active {
    box-shadow: var(--ds-glow-accent-strong);
    border-color: var(--ds-brand-accent);
  }
}
```

---

## 9. Motion System

### Principles

- Motion is **purposeful** — it reinforces interaction, not decoration
- Duration: 150–250ms
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-in-out)
- Never use bounce, overshoot, or looping decorative animations

### Standard Transitions

| Context          | Effect                             | Duration    |
| ---------------- | ---------------------------------- | ----------- |
| Card hover       | `translateY(-2px)` + soft glow     | 200ms       |
| Sidebar collapse | width transition                   | 250ms       |
| Modal open       | `scale(0.97→1.0)` + `opacity(0→1)` | 200ms       |
| Button press     | `scale(0.98)`                      | 100ms       |
| Loading shimmer  | animated gradient                  | 1500ms loop |

### Skeleton Loading Shimmer

```css
@keyframes ds-shimmer {
  0% {
    background-position: -200% center;
  }
  100% {
    background-position: 200% center;
  }
}

.ds-skeleton {
  background: linear-gradient(
    90deg,
    var(--ds-surface-sunken) 25%,
    rgba(16, 185, 129, 0.06) 50%,
    var(--ds-surface-sunken) 75%
  );
  background-size: 200% 100%;
  animation: ds-shimmer 1.5s ease-in-out infinite;
  border-radius: var(--ds-radius-md);
}
```

`prefers-reduced-motion` suppression must be preserved globally in `globals.css`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 10. Data Visualization Aesthetic

All charts use Recharts. Apply these rules:

- **Series colors:** `--ds-chart-1` through `--ds-chart-6` — never raw Tailwind color classes
- **Area fills:** gradient from accent at `1.0` opacity (top) to `0.0` (baseline)
- **Bars:** rounded top corners (`borderRadius: 4`)
- **Lines:** smooth curves (`type="monotone"`), `strokeWidth: 2`
- **Grid lines:** `--ds-border-subtle` — faint horizontal only, no vertical
- **Axis labels:** `--ds-text-secondary`, `font-ds-mono` for numerical values
- **Dark mode:** Use brighter chart token variants (automatically applied via CSS var)

---

## 11. Visual Hierarchy Pattern

Every page follows this structure — non-negotiable:

```
1. Page Header     H1 title + context/date + primary CTA
                   └─ Section divider: 2px accent-colored underline

2. KPI Bento Row   3–5 stat cards (glass surface variant)
                   └─ Mixed card sizes for visual weight

3. Primary Data    Main table, list, or report form
                   └─ Standard card · no glass · full width

4. Analytics Row   Charts, trends, sparklines
                   └─ Standard or glass card · scrollable on mobile

5. Secondary       Activity logs, quick actions, related info
                   └─ Standard card · no glass
```

---

## 12. Responsiveness Strategy

### Breakpoints

| Name    | Range        | Tailwind prefix |
| ------- | ------------ | --------------- |
| Mobile  | `< 768px`    | (default)       |
| Tablet  | `768–1024px` | `md:`           |
| Desktop | `> 1024px`   | `lg:`           |

### Rules

- **Sidebar:** Hidden on mobile/tablet → Ant Design `<Drawer>`. Desktop: collapsible 240px → 80px.
- **Bento grids:** 12-col desktop · 6-col tablet · single-col mobile
- **Charts:** Horizontal scroll wrapper on mobile (`overflow-x: auto`)
- **Tables:** Horizontal scroll container on mobile/tablet
- **Outer padding:** `p-6` desktop · `p-4` tablet · `p-3` mobile
- **Report forms:** Single column on mobile; 2-col metric grid on tablet+

---

## 13. Ant Design Token Bridge

`providers/AntdProvider.tsx` reads CSS variables at runtime. **Zero hardcoded values.**

```tsx
// providers/AntdProvider.tsx
"use client";
import { ConfigProvider, theme } from "antd";
import { useTheme } from "next-themes";

const getCSSVar = (name: string) =>
  typeof window !== "undefined"
    ? getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    : "";

export function AntdProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: getCSSVar("--ds-brand-accent"),
          colorBgBase: getCSSVar("--ds-surface-base"),
          colorTextBase: getCSSVar("--ds-text-primary"),
          colorSuccess: getCSSVar("--ds-status-success"),
          colorWarning: getCSSVar("--ds-status-warning"),
          colorError: getCSSVar("--ds-status-error"),
          colorInfo: getCSSVar("--ds-status-info"),
          borderRadius: 8,
          fontFamily: getCSSVar("--ds-font-sans"),
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
```

---

## 14. Implementation File Structure

```
app/
  globals.css              ← ALL tokens: palette + semantic + @theme inline
                              .glass-surface .ds-hover-glow .ds-skeleton utilities
                              prefers-reduced-motion + base styles

providers/
  AntdProvider.tsx         ← CSS var bridge — zero hardcoded values

lib/
  design-system/
    tokens.ts              ← TS constants mirroring CSS token names (for dynamic inline styles)
    antd-theme.ts          ← Ant Design token builder helper function
```

### `globals.css` Section Order

```
1. @import (Tailwind + fonts)
2. :root — Palette tokens
3. :root — Semantic tokens light mode
4. .dark — Semantic token dark overrides
5. @theme inline — Tailwind utility exposure
6. body, html, box-sizing base styles
7. @layer utilities — .glass-surface .ds-hover-glow .ds-glow-active .ds-skeleton
8. Ant Design component-scope overrides (antd .ant-* where needed)
9. Scrollbar styling
10. Accessibility / prefers-reduced-motion
```

---

## 15. Token Migration Map

When adapting any relic code, replace old patterns with new `ds-*` tokens:

| Old Pattern                                   | Replace With                                  |
| --------------------------------------------- | --------------------------------------------- |
| `bg-indigo-600/700/800` (sidebar)             | `bg-ds-surface-sidebar`                       |
| `bg-white dark:bg-slate-800`                  | `bg-ds-surface-elevated`                      |
| `dark:bg-gray-800`                            | `bg-ds-surface-elevated`                      |
| `from-slate-50 dark:from-gray-900`            | `bg-ds-surface-base`                          |
| `text-gray-900 dark:text-white`               | `text-ds-text-primary`                        |
| `text-gray-600 dark:text-gray-400`            | `text-ds-text-secondary`                      |
| `text-gray-500 dark:text-gray-400`            | `text-ds-text-subtle`                         |
| `border-gray-100 dark:border-slate-700`       | `border-ds-border-base`                       |
| `text-blue-600 dark:text-blue-400` (stat)     | `text-ds-chart-1`                             |
| `text-green-600 dark:text-green-400` (stat)   | `text-ds-chart-2`                             |
| `text-purple-600 dark:text-purple-400` (stat) | `text-ds-chart-3`                             |
| `text-orange-600 dark:text-orange-400` (stat) | `text-ds-chart-4`                             |
| `bg-church-primary` / `text-church-primary`   | `bg-ds-brand-accent` / `text-ds-brand-accent` |
| `rounded-xl` (cards)                          | `rounded-[var(--ds-radius-xl)]`               |
| `rounded-lg` (buttons, inputs)                | `rounded-[var(--ds-radius-lg)]`               |
| `shadow-lg hover:shadow-xl`                   | `shadow-ds-md hover:shadow-ds-lg`             |
| `colorPrimary: "#1B4B3E"` in AntdProvider     | `getCSSVar('--ds-brand-accent')`              |
| Any hardcoded hex in `AntdProvider`           | `getCSSVar('--ds-*')`                         |

---

## 16. Design Anti-Patterns

Explicitly prohibited in this codebase:

| Anti-pattern                                                             | Why                                                           |
| ------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Glow on every card at rest                                               | Glow loses emphasis — reserved for interaction states only    |
| Glass on data tables or report forms                                     | Glass impairs readability in dense data contexts              |
| Multiple concurrent accent colors                                        | Single accent rule — Harvesters Emerald only                  |
| Inconsistent radius values                                               | Use `--ds-radius-*` tokens exclusively                        |
| Raw Tailwind color classes (`blue-600`, `gray-800`) for semantic purpose | Use `ds-*` classes only                                       |
| `dark:` inline overrides in component classes                            | Color adaptation is handled by the semantic token layer       |
| Pure white `#FFFFFF` for body text in dark mode                          | Use `--ds-text-primary` (`#F8FAFC`)                           |
| Heavy drop shadows in dark mode                                          | Glow for depth; heavy shadows disappear on dark surfaces      |
| Forcing sidebar to always dark                                           | Sidebar must respect active theme                             |
| `theme="dark"` on Ant Design `<Sider>`                                   | Sidebar theming via CSS tokens, not Ant Design dark mode prop |
| More than 5 KPI cards in one bento row                                   | Max 5 KPIs with varied sizing                                 |
| Hardcoded color in `AntdProvider`                                        | 100% CSS-var driven                                           |
| "Church Fellowship CRM" anywhere in UI copy                              | This is the Reporting System                                  |
