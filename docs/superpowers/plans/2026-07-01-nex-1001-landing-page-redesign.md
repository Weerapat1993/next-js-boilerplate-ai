# NEX-1001: Landing Page Redesign — Apple Developer Docs Style

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the horizontal BaseTemplate layout across 5 pages with an Apple Developer Docs–style persistent left sidebar, hero home page, portfolio card grid, and dashboard stats view.

**Architecture:** Create two new shared layout components (`SidebarLayout` server, `SidebarNav` client). Wire them into the existing `(marketing)/layout.tsx` and `(auth)/dashboard/layout.tsx` route group layouts via `sidebarFooter` prop for per-layout extras (LocaleSwitcher, SignOut). Rewrite each page's content independently without touching BaseTemplate, CounterForm, or CurrentCount.

**Tech Stack:** Next.js 16+ App Router, TypeScript, Tailwind CSS v4, Clerk, next-intl (en/fr), DrizzleORM + PGlite

## Global Constraints

- Named exports only; default exports for Next.js pages and layouts only.
- Single `props` param with inline type; access as `props.foo`, no destructuring.
- No `useMemo` / `useCallback`. No `useEffect`. Avoid `ReactNode` — use `React.ReactNode`.
- Absolute imports via `@/` for cross-directory; relative for same-directory.
- All user-visible strings through `getTranslations` (server) or `useTranslations` (client).
- Tailwind v4 utility classes only. `dark:` for dark mode.
- Accent color: `#0066CC`. Dark-mode accent: `#4DA3FF`.
- System font already covered by Tailwind's `font-sans` (maps to `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, ...`).
- `bun run check:types`, `bun run lint`, `bun run check:i18n` must pass after each task.

---

### Task 1: i18n — Add Navigation and HomePage namespaces

**Files:**
- Modify: `src/locales/en.json`
- Modify: `src/locales/fr.json`

**Interfaces:**
- Produces: `Navigation.{home,about,counter,portfolio,dashboard}` — consumed by `SidebarNav` (Task 2)
- Produces: `HomePage.{hero_title,hero_subtitle,hero_cta,feature_grid_title}` — consumed by Home page (Task 6)
- Produces: `Dashboard.{stat_counter,stat_portfolio,stat_account}` — consumed by Dashboard page (Task 10)

- [ ] **Step 1: Add namespaces to `src/locales/en.json`**

Add the following keys. Insert them as top-level siblings of the existing namespaces (e.g., after `"RootLayout": {...},`):

```json
"Navigation": {
  "home": "Home",
  "about": "About",
  "counter": "Counter",
  "portfolio": "Portfolio",
  "dashboard": "Dashboard"
},
"HomePage": {
  "hero_title": "Next.js Boilerplate",
  "hero_subtitle": "A developer-friendly starter for Next.js with authentication, database, i18n, and more.",
  "hero_cta": "View on GitHub",
  "feature_grid_title": "What's included"
},
```

Also add these three keys to the existing `"Dashboard"` object (after `"max_message"`):

```json
"stat_counter": "Counter",
"stat_portfolio": "Portfolio",
"stat_account": "Account"
```

- [ ] **Step 2: Add namespaces to `src/locales/fr.json`**

Mirror the same structure with French translations:

```json
"Navigation": {
  "home": "Accueil",
  "about": "À propos",
  "counter": "Compteur",
  "portfolio": "Portfolio",
  "dashboard": "Tableau de bord"
},
"HomePage": {
  "hero_title": "Next.js Boilerplate",
  "hero_subtitle": "Un starter Next.js pour développeurs avec authentification, base de données, i18n et plus encore.",
  "hero_cta": "Voir sur GitHub",
  "feature_grid_title": "Ce qui est inclus"
},
```

Also add to `"Dashboard"` in fr.json:

```json
"stat_counter": "Compteur",
"stat_portfolio": "Portfolio",
"stat_account": "Compte"
```

- [ ] **Step 3: Verify i18n coverage**

```bash
bun run check:i18n
```

Expected: no missing keys reported.

- [ ] **Step 4: Commit**

```bash
git add src/locales/en.json src/locales/fr.json
git commit -m "feat: add Navigation, HomePage, and Dashboard stat i18n keys for NEX-1001"
```

---

### Task 2: SidebarNav — client nav component with hamburger drawer

**Files:**
- Create: `src/components/layouts/SidebarNav.tsx`
- Create: `src/components/layouts/SidebarNav.test.tsx`

**Interfaces:**
- Consumes: `Navigation.*` namespace (Task 1), `@/libs/I18nNavigation` `Link`, `@/utils/AppConfig`
- Produces: `export const SidebarNav = (props: { footerSlot?: React.ReactNode }) => JSX.Element`

- [ ] **Step 1: Write the failing test**

Create `src/components/layouts/SidebarNav.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/en',
}));
vi.mock('@/libs/I18nNavigation', () => ({
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));
vi.mock('@/utils/AppConfig', () => ({
  AppConfig: { name: 'TestApp' },
}));

import { SidebarNav } from './SidebarNav';

describe('SidebarNav', () => {
  it('renders all nav links', () => {
    render(<SidebarNav />);
    expect(screen.getAllByRole('link').length).toBeGreaterThanOrEqual(5);
  });

  it('toggles mobile drawer on hamburger click', () => {
    render(<SidebarNav />);
    const hamburger = screen.getByLabelText('Open navigation');
    expect(screen.queryByLabelText('Close navigation')).toBeNull();
    fireEvent.click(hamburger);
    expect(screen.getByLabelText('Close navigation')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test -- src/components/layouts/SidebarNav.test.tsx
```

Expected: FAIL — `SidebarNav` does not exist.

- [ ] **Step 3: Create `src/components/layouts/SidebarNav.tsx`**

```tsx
'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

type NavEntry = {
  href: string;
  key: 'home' | 'about' | 'counter' | 'portfolio' | 'dashboard';
};

const NAV_ENTRIES: NavEntry[] = [
  { href: '/', key: 'home' },
  { href: '/about/', key: 'about' },
  { href: '/counter/', key: 'counter' },
  { href: '/portfolio/', key: 'portfolio' },
  { href: '/dashboard/', key: 'dashboard' },
];

const isActive = (pathname: string, href: string): boolean => {
  if (href === '/') {
    return pathname.split('/').filter(Boolean).length === 1;
  }
  return pathname.includes(href.replace(/\/$/, ''));
};

const NavLinks = (props: {
  pathname: string;
  t: (key: string) => string;
  onLinkClick?: () => void;
}) => (
  <ul className="space-y-0.5 px-2">
    {NAV_ENTRIES.map((entry) => (
      <li key={entry.href}>
        <Link
          href={entry.href}
          onClick={props.onLinkClick}
          className={`block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            isActive(props.pathname, entry.href)
              ? 'bg-blue-50 text-[#0066CC] dark:bg-blue-950/40 dark:text-[#4DA3FF]'
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
          }`}
        >
          {props.t(entry.key)}
        </Link>
      </li>
    ))}
  </ul>
);

export const SidebarNav = (props: { footerSlot?: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const t = useTranslations('Navigation');
  const pathname = usePathname();

  const appName = (
    <span className="text-base font-semibold text-gray-900 dark:text-gray-100">
      {AppConfig.name}
    </span>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center border-b border-gray-200 bg-white px-4 py-3 md:hidden dark:border-gray-700 dark:bg-gray-950">
        <button
          type="button"
          aria-label="Open navigation"
          onClick={() => setOpen(true)}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="ml-3">{appName}</div>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl dark:bg-gray-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
              {appName}
              <button
                type="button"
                aria-label="Close navigation"
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <svg className="size-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4">
              <NavLinks pathname={pathname} t={t} onLinkClick={() => setOpen(false)} />
            </nav>
            {props.footerSlot && (
              <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
                {props.footerSlot}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-gray-200 bg-white md:flex dark:border-gray-700 dark:bg-gray-950">
        <div className="border-b border-gray-200 px-4 py-5 dark:border-gray-700">
          {appName}
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <NavLinks pathname={pathname} t={t} />
        </nav>
        {props.footerSlot && (
          <div className="border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            {props.footerSlot}
          </div>
        )}
      </aside>
    </>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun run test -- src/components/layouts/SidebarNav.test.tsx
```

Expected: PASS — 2 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/layouts/SidebarNav.tsx src/components/layouts/SidebarNav.test.tsx
git commit -m "feat: add SidebarNav client component with hamburger drawer for NEX-1001"
```

---

### Task 3: SidebarLayout — server wrapper component

**Files:**
- Create: `src/components/layouts/SidebarLayout.tsx`
- Create: `src/components/layouts/SidebarLayout.test.tsx`

**Interfaces:**
- Consumes: `SidebarNav` (Task 2)
- Produces: `export const SidebarLayout = (props: { children: React.ReactNode; sidebarFooter?: React.ReactNode }) => JSX.Element`

- [ ] **Step 1: Write the failing test**

Create `src/components/layouts/SidebarLayout.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('./SidebarNav', () => ({
  SidebarNav: (props: { footerSlot?: React.ReactNode }) => (
    <div data-testid="sidebar-nav">{props.footerSlot}</div>
  ),
}));

import { SidebarLayout } from './SidebarLayout';

describe('SidebarLayout', () => {
  it('renders children in main area', () => {
    render(<SidebarLayout><p>page content</p></SidebarLayout>);
    expect(screen.getByText('page content')).toBeTruthy();
  });

  it('passes sidebarFooter to SidebarNav', () => {
    render(
      <SidebarLayout sidebarFooter={<button>Sign out</button>}>
        <p>content</p>
      </SidebarLayout>,
    );
    expect(screen.getByText('Sign out')).toBeTruthy();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
bun run test -- src/components/layouts/SidebarLayout.test.tsx
```

Expected: FAIL — `SidebarLayout` does not exist.

- [ ] **Step 3: Create `src/components/layouts/SidebarLayout.tsx`**

```tsx
import { SidebarNav } from './SidebarNav';

export const SidebarLayout = (props: {
  children: React.ReactNode;
  sidebarFooter?: React.ReactNode;
}) => (
  <div className="flex min-h-screen font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
    <SidebarNav footerSlot={props.sidebarFooter} />
    <main className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-4xl px-6 py-8 md:px-10">{props.children}</div>
    </main>
  </div>
);
```

- [ ] **Step 4: Run test to verify it passes**

```bash
bun run test -- src/components/layouts/SidebarLayout.test.tsx
```

Expected: PASS — 2 tests passing.

- [ ] **Step 5: Commit**

```bash
git add src/components/layouts/SidebarLayout.tsx src/components/layouts/SidebarLayout.test.tsx
git commit -m "feat: add SidebarLayout server component for NEX-1001"
```

---

### Task 4: Wire marketing layout to SidebarLayout

**Files:**
- Modify: `src/app/[locale]/(marketing)/layout.tsx`

**Interfaces:**
- Consumes: `SidebarLayout` (Task 3), `@/components/LocaleSwitcher`
- The marketing layout no longer needs `BaseTemplate`, `Link`, or `RootLayout` translations.

- [ ] **Step 1: Replace the file contents**

Replace `src/app/[locale]/(marketing)/layout.tsx` with:

```tsx
import { setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

export default async function MarketingLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return (
    <SidebarLayout sidebarFooter={<LocaleSwitcher />}>
      {props.children}
    </SidebarLayout>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
bun run check:types
```

Expected: no errors.

- [ ] **Step 3: Lint**

```bash
bun run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/(marketing)/layout.tsx"
git commit -m "feat: replace BaseTemplate with SidebarLayout in marketing layout (NEX-1001)"
```

---

### Task 5: Wire dashboard layout to SidebarLayout

**Files:**
- Modify: `src/app/[locale]/(auth)/dashboard/layout.tsx`

**Interfaces:**
- Consumes: `SidebarLayout` (Task 3), `@/components/LocaleSwitcher`, `@clerk/nextjs` `SignOutButton`, `DashboardLayout` i18n namespace (already exists)
- The dashboard layout no longer needs `BaseTemplate` or `Link` for nav items.

- [ ] **Step 1: Replace the file contents**

Replace `src/app/[locale]/(auth)/dashboard/layout.tsx` with:

```tsx
import { SignOutButton } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';

type DashboardLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: DashboardLayoutProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'DashboardLayout' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function DashboardLayout(props: DashboardLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'DashboardLayout' });

  return (
    <SidebarLayout
      sidebarFooter={
        <div className="flex flex-col gap-1">
          <LocaleSwitcher />
          <SignOutButton>
            <button
              type="button"
              className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
            >
              {t('sign_out')}
            </button>
          </SignOutButton>
        </div>
      }
    >
      {props.children}
    </SidebarLayout>
  );
}
```

- [ ] **Step 2: Type-check and lint**

```bash
bun run check:types && bun run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(auth)/dashboard/layout.tsx"
git commit -m "feat: replace BaseTemplate with SidebarLayout in dashboard layout (NEX-1001)"
```

---

### Task 6: Redesign Home page — hero + feature grid

**Files:**
- Modify: `src/app/[locale]/(marketing)/page.tsx`

**Interfaces:**
- Consumes: `HomePage.*` namespace (Task 1), `Index.*` namespace for metadata (already exists)
- Removes: `<Sponsors />` import and usage

- [ ] **Step 1: Replace the file contents**

Replace `src/app/[locale]/(marketing)/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type IndexPageProps = {
  params: Promise<{ locale: string }>;
};

const FEATURES = [
  { emoji: '🚀', title: 'Next.js App Router', description: 'Latest App Router with server components and streaming.' },
  { emoji: '🔥', title: 'TypeScript', description: 'Full type safety across the entire codebase.' },
  { emoji: '💎', title: 'Tailwind CSS v4', description: 'Utility-first styling with the latest Tailwind.' },
  { emoji: '🔒', title: 'Clerk Auth', description: 'Passwordless, social, and multi-factor authentication.' },
  { emoji: '📦', title: 'DrizzleORM', description: 'Type-safe ORM with PostgreSQL, SQLite, and MySQL.' },
  { emoji: '🌐', title: 'next-intl', description: 'Multi-language support with locale-aware routing.' },
  { emoji: '🔴', title: 'Form validation', description: 'React Hook Form + Zod for robust forms.' },
  { emoji: '🦺', title: 'Testing suite', description: 'Vitest, React Testing Library, and Playwright.' },
  { emoji: '🤖', title: 'SEO ready', description: 'Metadata, JSON-LD, Open Graph, and sitemap.' },
] as const;

export async function generateMetadata(props: IndexPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Index' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function IndexPage(props: IndexPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'HomePage' });

  return (
    <div>
      <section className="border-b border-gray-200 pb-10 dark:border-gray-800">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          {t('hero_title')}
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-gray-500 dark:text-gray-400">
          {t('hero_subtitle')}
        </p>
        <div className="mt-6">
          <a
            href="https://github.com/ixartz/Next-js-Boilerplate"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center rounded-md bg-[#0066CC] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0055AA] focus:outline-none focus:ring-2 focus:ring-[#0066CC]/50"
          >
            {t('hero_cta')}
          </a>
        </div>
      </section>

      <section className="pt-10">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t('feature_grid_title')}
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="rounded-lg border border-gray-200 p-4 dark:border-gray-700"
            >
              <div className="mb-2 text-xl">{feature.emoji}</div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {feature.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Type-check and lint**

```bash
bun run check:types && bun run lint
```

Expected: no errors. (If `Sponsors` import is flagged as unused elsewhere — it isn't imported here, so no issue.)

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(marketing)/page.tsx"
git commit -m "feat: redesign home page with hero section and feature grid (NEX-1001)"
```

---

### Task 7: Restyle About page container

**Files:**
- Modify: `src/app/[locale]/(marketing)/about/page.tsx`

**Interfaces:**
- Consumes: `About.*` namespace (already exists, no changes)
- No new dependencies

- [ ] **Step 1: Replace the file contents**

Replace `src/app/[locale]/(marketing)/about/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: AboutPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'About' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function AboutPage(props: AboutPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'About' });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('meta_title')}
      </h1>
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
          {t('about_paragraph')}
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
bun run check:types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(marketing)/about/page.tsx"
git commit -m "feat: restyle About page container for sidebar layout (NEX-1001)"
```

---

### Task 8: Restyle Counter page container

**Files:**
- Modify: `src/app/[locale]/(marketing)/counter/page.tsx`

**Interfaces:**
- Consumes: `Counter.*` namespace (already exists), `CounterForm`, `CurrentCount` (unchanged)

- [ ] **Step 1: Replace the file contents**

Replace `src/app/[locale]/(marketing)/counter/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CounterForm } from '@/components/CounterForm';
import { CurrentCount } from '@/components/CurrentCount';

type CounterPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: CounterPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Counter' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function CounterPage(props: CounterPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Counter' });

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('meta_title')}
      </h1>
      <div className="rounded-lg border border-gray-200 p-6 dark:border-gray-700">
        <CurrentCount />
        <div className="mt-6">
          <CounterForm />
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
bun run check:types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(marketing)/counter/page.tsx"
git commit -m "feat: restyle Counter page container for sidebar layout (NEX-1001)"
```

---

### Task 9: Redesign Portfolio page — 6-card grid

**Files:**
- Modify: `src/app/[locale]/(marketing)/portfolio/page.tsx`

**Interfaces:**
- Consumes: `Portfolio.*` namespace for metadata (already exists)
- Removes: `Link`, `Image`, Sentry sponsor link/image

- [ ] **Step 1: Replace the file contents**

Replace `src/app/[locale]/(marketing)/portfolio/page.tsx` with:

```tsx
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';

type PortfolioPageProps = {
  params: Promise<{ locale: string }>;
};

const PORTFOLIO_ITEMS = [
  {
    title: 'Authentication System',
    description: 'Passwordless and social login with Clerk, including multi-factor auth.',
    tag: 'Auth',
  },
  {
    title: 'Database Layer',
    description: 'Type-safe ORM with DrizzleORM. Local PGlite in dev, Neon in production.',
    tag: 'Database',
  },
  {
    title: 'Internationalization',
    description: 'Multi-language routing with next-intl supporting English and French.',
    tag: 'i18n',
  },
  {
    title: 'Form Validation',
    description: 'React Hook Form with Zod schema validation and accessible error messages.',
    tag: 'Forms',
  },
  {
    title: 'Testing Suite',
    description: 'Unit tests with Vitest, component tests with RTL, E2E with Playwright.',
    tag: 'Testing',
  },
  {
    title: 'Security & Rate Limiting',
    description: 'Bot detection and rate limiting powered by Arcjet middleware.',
    tag: 'Security',
  },
] as const;

export async function generateMetadata(props: PortfolioPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'Portfolio' });
  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

export default async function PortfolioPage(props: PortfolioPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Portfolio' });

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('meta_title')}
      </h1>
      <p className="mb-8 text-base text-gray-500 dark:text-gray-400">
        {t('meta_description')}
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PORTFOLIO_ITEMS.map((item) => (
          <div
            key={item.title}
            className="flex flex-col rounded-lg border border-gray-200 p-5 dark:border-gray-700"
          >
            <span className="mb-3 inline-block self-start rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-[#0066CC] dark:bg-blue-950/40 dark:text-[#4DA3FF]">
              {item.tag}
            </span>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
              {item.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
              {item.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check and lint**

```bash
bun run check:types && bun run lint
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(marketing)/portfolio/page.tsx"
git commit -m "feat: redesign Portfolio page with 6-card tech stack grid (NEX-1001)"
```

---

### Task 10: Redesign Dashboard page — stats cards

**Files:**
- Modify: `src/app/[locale]/(auth)/dashboard/page.tsx`

**Interfaces:**
- Consumes: `Dashboard.{stat_counter,stat_portfolio,stat_account}` (Task 1), `DashboardLayout.meta_title` (already exists), `CurrentCount` component, `@clerk/nextjs/server` `currentUser`
- Removes: `Hello` component

- [ ] **Step 1: Replace the file contents**

Replace `src/app/[locale]/(auth)/dashboard/page.tsx` with:

```tsx
import { currentUser } from '@clerk/nextjs/server';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CurrentCount } from '@/components/CurrentCount';

export async function generateMetadata(props: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({ locale, namespace: 'DashboardLayout' });
  return { title: t('meta_title') };
}

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: 'Dashboard' });
  const tLayout = await getTranslations({ locale, namespace: 'DashboardLayout' });
  const user = await currentUser();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {tLayout('meta_title')}
      </h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('stat_counter')}
          </p>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            <CurrentCount />
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('stat_portfolio')}
          </p>
          <div className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
            6 items
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 p-5 dark:border-gray-700">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {t('stat_account')}
          </p>
          <div className="mt-2 text-sm text-gray-900 dark:text-gray-100">
            <p className="font-medium">
              {user?.fullName ?? user?.firstName ?? 'User'}
            </p>
            <p className="text-gray-500 dark:text-gray-400">
              {user?.primaryEmailAddress?.emailAddress ?? ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

```bash
bun run check:types
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/(auth)/dashboard/page.tsx"
git commit -m "feat: redesign Dashboard page with stats cards (NEX-1001)"
```

---

### Task 11: Final validation

**Files:** none (read-only validation pass)

- [ ] **Step 1: Full type-check**

```bash
bun run check:types
```

Expected: no errors.

- [ ] **Step 2: Lint**

```bash
bun run lint
```

Expected: no errors.

- [ ] **Step 3: i18n coverage**

```bash
bun run check:i18n
```

Expected: no missing keys.

- [ ] **Step 4: Unit tests**

```bash
bun run test
```

Expected: all tests pass, including the two new SidebarNav and SidebarLayout test files.

- [ ] **Step 5: Start dev server and verify visually**

```bash
bun run dev
```

Open `http://localhost:3000` and verify each page in both light and dark mode:

| Page | URL | Check |
|---|---|---|
| Home | `/en` | Hero section renders, feature grid shows 9 cards |
| About | `/en/about` | Paragraph in bordered card |
| Counter | `/en/counter` | CounterForm + CurrentCount inside bordered card |
| Portfolio | `/en/portfolio` | 6 tech cards with tags |
| Dashboard | `/en/dashboard` | 3 stat cards (counter value, 6 items, user email) |

Resize to mobile width (375px): hamburger appears, sidebar hidden. Click hamburger — drawer slides in from left.

Switch locale to `/fr` — all nav labels and hero copy appear in French.

- [ ] **Step 6: Commit**

```bash
git commit --allow-empty -m "chore: NEX-1001 validation pass complete"
```
