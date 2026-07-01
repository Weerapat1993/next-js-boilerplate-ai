# NEX-1001: Landing Page Redesign — Apple Developer Docs Style

**Date:** 2026-07-01  
**Ticket:** [NEX-1001](../../../obsidian/kanban/tasks/NEX-1001.md)  
**Status:** Approved

---

## Overview

Redesign 5 pages (Home, About, Counter, Portfolio, Dashboard) to a clean, professional UI inspired by Apple Developer Documentation. Project is a boilerplate showcase — the redesign makes the stack look polished without replacing its demo nature.

---

## Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Font | System font stack (`-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`) | Zero bundle weight, native Apple aesthetic, matches reference |
| Mobile nav | Hamburger → slide-out drawer | Apple Developer Docs pattern for docs/website, not mobile-app bottom nav |
| Accent color | `#0066CC` (Apple blue) | Apple docs uses blue for active states, links, CTA — gray-only feels flat |
| Sidebar arch | New `SidebarLayout` component | Clean separation; `BaseTemplate` stays untouched for auth/center pages |

---

## Architecture

### New components

```
src/components/layouts/
  SidebarLayout.tsx     — shared wrapper: sidebar + main content area
  SidebarNav.tsx        — nav links, hamburger toggle (client component)
```

### Layout wiring

- `src/app/[locale]/(marketing)/layout.tsx` — wrap children with `SidebarLayout`
- `src/app/[locale]/(auth)/dashboard/layout.tsx` — wrap with `SidebarLayout` (adds user section to sidebar)
- `src/templates/BaseTemplate.tsx` — unchanged (used by auth/center pages)

### Visual structure

```
Desktop (≥768px):
┌─────────────────────────────────────────────┐
│ Sidebar (240px fixed) │ Main content area   │
│  App name/logo        │ max-w-4xl, padded   │
│  Nav links            │                     │
│  [Dashboard if authed]│                     │
└─────────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────────────────────────────┐
│ [☰] App name                                │
├─────────────────────────────────────────────┤
│ Main content (full width)                   │
└─────────────────────────────────────────────┘
Hamburger ☰ slides sidebar in from left as overlay
```

### Theme

- Tailwind v4 dark mode via `@media (prefers-color-scheme: dark)`
- Base: neutral gray scale (`gray-50` bg, `gray-900` text, `gray-200` borders)
- Accent: `#0066CC` for active nav link, CTA buttons, inline links
- Dark mode: `gray-900` bg, `gray-100` text, `#4DA3FF` accent

---

## Pages

### 1. Home (`src/app/[locale]/(marketing)/page.tsx`)

Structure:
1. **Hero section** (top) — headline (from i18n), subtext, CTA button (blue accent)
2. **Feature grid** — tech stack cards (Next.js, TypeScript, Tailwind, Clerk, Drizzle, etc.)

Remove: current plain feature list, Sponsors section.

### 2. About (`src/app/[locale]/(marketing)/about/page.tsx`)

- Keep `About.about_paragraph` i18n content unchanged
- Restyle container to match sidebar layout aesthetic (white card, padding, prose typography)

### 3. Counter (`src/app/[locale]/(marketing)/counter/page.tsx`)

- Keep `CounterForm` and `CurrentCount` components untouched
- Restyle page container/heading only

### 4. Portfolio (`src/app/[locale]/(marketing)/portfolio/page.tsx`)

- 6-item card grid (hardcoded mock data, no DB)
- Each card: title, description, tag/tech label, optional link placeholder

### 5. Dashboard (`src/app/[locale]/(auth)/dashboard/page.tsx`)

- Replace `<Hello />` with stats cards row:
  - Counter value (from DB)
  - Portfolio count (hardcoded: 6)
  - Clerk user info (name, email)
- No welcome/hero section — start directly with stats

---

## i18n

- Add `Navigation` namespace to `src/locales/en.json` and `src/locales/fr.json`
- Nav labels: Home, About, Counter, Portfolio, Dashboard (fr translations required)
- Hero copy (Home page): new keys in `HomePage` namespace
- No existing keys removed or renamed

---

## Acceptance Criteria

- [ ] All 5 pages render without errors in light and dark mode
- [ ] Persistent left sidebar on desktop; hamburger drawer on mobile
- [ ] Home: hero section + feature grid
- [ ] Portfolio: 6-card grid
- [ ] Dashboard: stats cards (counter, portfolio count, user info)
- [ ] All user-visible strings via `getTranslations` / `useTranslations`
- [ ] `bun run check:types` passes
- [ ] `bun run lint` passes
- [ ] `bun run check:i18n` passes
- [ ] Responsive: usable on mobile viewport

---

## Out of Scope

- Portfolio DB connection
- New pages
- Counter or auth logic changes
- `@clark/nextjs` package integration
- Animation or transitions beyond CSS hover states
