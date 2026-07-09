# Settings Appearance — Theme Mode Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a signed-in user pick Light / Dark / System theme on `/dashboard/settings/appearance`, persist it in Postgres per Clerk user, and apply it on every page load with no flash of the wrong theme.

**Architecture:** Add a `userPreferences` Drizzle table (one row per `clerkUserId`). Root layout (`src/app/[locale]/layout.tsx`) resolves the caller's theme server-side and sets the `dark` class directly on `<html>` for explicit choices (zero flash); for `system` (including every anonymous/public visitor) it falls back to a tiny blocking inline script that mirrors OS preference via `matchMedia`. Tailwind's `dark:` variant is switched from its default OS-media strategy to a class-based strategy (`.dark` ancestor) so both paths — server class and script — drive the same utilities. A server action (`updateThemeMode`) upserts the preference and revalidates the root layout.

**Tech Stack:** Next.js 16 App Router, DrizzleORM (Postgres), Clerk, next-intl, Zod, Vitest.

## Global Constraints

- No default exports except Next.js pages (`AGENTS.md`).
- Absolute imports via `@/` unless same directory.
- No `useMemo`/`useCallback`/`useEffect` in React (`AGENTS.md`).
- Single `props` param with inline type, accessed as `props.foo`.
- All user-visible strings via `getTranslations`/`useTranslations`; run `bun run check:i18n` after adding keys.
- `Zod` type-only imports (`import type * as z from 'zod'`) except where the runtime schema itself is needed (validation files import the zod value, not just the type).
- `*.test.ts` co-located with implementation.
- Locales in this repo are **`en` and `th`** (not `fr` — the spec/CLAUDE.md reference to `fr.json` is stale; `AppConfig.ts` and `src/locales/` confirm `en`/`th`).

## Key Architecture Decision (read before starting)

The spec assumes `src/styles/global.css:5` already has `@custom-variant dark (&:where(.dark, .dark *));`. **It does not** — `global.css` currently has no dark variant at all, so all 43 existing `dark:` usages across the app rely on Tailwind's default OS-media-query strategy. Switching to a class-based strategy (required so the DB preference can actually override rendered theme) is a **global** CSS behavior change, not additive.

Also, `src/proxy.ts` only runs `clerkMiddleware` for `/dashboard(.*)`, `/sign-in(.*)`, `/sign-up(.*)` (comment: "Clerk keyless mode doesn't work with i18n"). Calling `auth()` in the shared root layout — which renders for every route including marketing pages — **throws** on routes clerkMiddleware never wrapped.

Resolution used by this plan (Task 3): wrap `auth()` in a `try/catch` inside a single helper (`getThemeMode`), treating the thrown/no-middleware case as anonymous → `'system'`. This is a deliberate, narrow exception to the "no unnecessary try/catch" rule — it exists because Clerk itself throws when middleware didn't run for the current request, not because we're guessing at failure. Do not remove it as "unnecessary" during review.

This means: any authenticated user's explicit `light`/`dark` choice will also apply to marketing pages they visit (not just `/dashboard`). This does not violate the spec's non-goal ("public pages keep OS-only behavior") — that non-goal is about **anonymous** visitors, who always resolve to `'system'` and see unchanged OS-following behavior.

---

### Task 1: `userPreferences` table + migration

**Files:**
- Modify: `src/models/Schema.ts`
- Create: migration via `bun run db:generate` (writes into `migrations/`)

**Interfaces:**
- Produces: `userPreferencesSchema` (Drizzle pg table), columns `id`, `clerkUserId`, `themeMode` (`'light' | 'dark' | 'system'`), `createdAt`, `updatedAt`. Later tasks import this from `@/models/Schema`.

- [ ] **Step 1: Add the table to the schema**

Edit `src/models/Schema.ts`:

```ts
import { integer, pgTable, serial, text, timestamp, uuid } from 'drizzle-orm/pg-core';

// ... existing counterSchema unchanged ...

export const userPreferencesSchema = pgTable('user_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  clerkUserId: text('clerk_user_id').notNull().unique(),
  themeMode: text('theme_mode', { enum: ['light', 'dark', 'system'] })
    .notNull()
    .default('system'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
```

- [ ] **Step 2: Generate the migration**

Run: `bun run db:generate`
Expected: a new file appears under `migrations/` creating the `user_preferences` table. Open it and confirm it matches the columns above (uuid default `gen_random_uuid()`, unique index on `clerk_user_id`, `theme_mode` with a check constraint for the three enum values, defaults as declared).

- [ ] **Step 3: Apply the migration**

Run: `bun run db:migrate`
Expected: exits 0, no pending migrations left.

- [ ] **Step 4: Commit**

```bash
git add src/models/Schema.ts migrations/
git commit -m "feat: add user_preferences table for theme mode"
```

---

### Task 2: Theme mode Zod validation

**Files:**
- Create: `src/validations/ThemeModeValidation.ts`
- Test: `src/validations/ThemeModeValidation.test.ts`

**Interfaces:**
- Produces: `ThemeModeValidation` — `z.object({ themeMode: z.enum(['light', 'dark', 'system']) })`. Consumed by the server action in Task 5.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest';
import { ThemeModeValidation } from './ThemeModeValidation';

describe('ThemeModeValidation', () => {
  it('accepts light, dark, and system', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'light' }).success).toBe(true);
    expect(ThemeModeValidation.safeParse({ themeMode: 'dark' }).success).toBe(true);
    expect(ThemeModeValidation.safeParse({ themeMode: 'system' }).success).toBe(true);
  });

  it('rejects an unsupported value', () => {
    expect(ThemeModeValidation.safeParse({ themeMode: 'neon' }).success).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- src/validations/ThemeModeValidation.test.ts`
Expected: FAIL — cannot find module `./ThemeModeValidation`.

- [ ] **Step 3: Write the implementation**

```ts
import * as z from 'zod';

export const ThemeModeValidation = z.object({
  themeMode: z.enum(['light', 'dark', 'system']),
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- src/validations/ThemeModeValidation.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add src/validations/ThemeModeValidation.ts src/validations/ThemeModeValidation.test.ts
git commit -m "feat: add theme mode zod validation"
```

---

### Task 3: `getThemeMode` helper (auth-aware, middleware-safe)

**Files:**
- Create: `src/libs/ThemeMode.ts`
- Test: `src/libs/ThemeMode.test.ts`

**Interfaces:**
- Consumes: `auth` from `@clerk/nextjs/server`, `db` from `@/libs/DB`, `userPreferencesSchema` from `@/models/Schema` (Task 1).
- Produces: `type ThemeMode = 'light' | 'dark' | 'system'` and `getThemeMode(): Promise<ThemeMode>`. Consumed by root layout (Task 4) and the settings page (Task 6).

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const selectMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('@/libs/DB', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => selectMock(),
      }),
    }),
  },
}));

describe('getThemeMode', () => {
  it('returns system when auth() throws (route not wrapped by clerkMiddleware)', async () => {
    authMock.mockRejectedValueOnce(new Error('clerkMiddleware() was not run'));
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('system');
  });

  it('returns system when signed out', async () => {
    authMock.mockResolvedValueOnce({ userId: null });
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('system');
  });

  it('returns system when signed in with no stored preference', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    selectMock.mockResolvedValueOnce([]);
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('system');
  });

  it('returns the stored preference when signed in', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    selectMock.mockResolvedValueOnce([{ themeMode: 'dark' }]);
    const { getThemeMode } = await import('./ThemeMode');

    await expect(getThemeMode()).resolves.toBe('dark');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- src/libs/ThemeMode.test.ts`
Expected: FAIL — cannot find module `./ThemeMode`.

- [ ] **Step 3: Write the implementation**

```ts
import { auth } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';
import { db } from '@/libs/DB';
import { userPreferencesSchema } from '@/models/Schema';

export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Resolves the current request's theme preference.
 * `auth()` throws on routes clerkMiddleware never wraps (see src/proxy.ts matcher),
 * so those routes — and signed-out visitors — resolve to 'system'.
 */
export const getThemeMode = async (): Promise<ThemeMode> => {
  let userId: string | null = null;

  try {
    ({ userId } = await auth());
  } catch {
    userId = null;
  }

  if (!userId) {
    return 'system';
  }

  const rows = await db
    .select({ themeMode: userPreferencesSchema.themeMode })
    .from(userPreferencesSchema)
    .where(eq(userPreferencesSchema.clerkUserId, userId));

  return rows[0]?.themeMode ?? 'system';
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- src/libs/ThemeMode.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/libs/ThemeMode.ts src/libs/ThemeMode.test.ts
git commit -m "feat: add auth-aware theme mode resolver"
```

---

### Task 4: Class-based dark variant + no-flash root layout

**Files:**
- Modify: `src/styles/global.css`
- Modify: `src/app/[locale]/layout.tsx`

**Interfaces:**
- Consumes: `getThemeMode` from `@/libs/ThemeMode` (Task 3).

- [ ] **Step 1: Switch Tailwind's dark variant to class-based**

Edit `src/styles/global.css` (add the custom variant after the existing import):

```css
@layer theme, base, clerk, components, utilities; /* Ensure Clerk is compatible with Tailwind CSS v4 */

@import 'tailwindcss';

@custom-variant dark (&:where(.dark, .dark *));
```

- [ ] **Step 2: Resolve theme server-side in the root layout**

Edit `src/app/[locale]/layout.tsx`:

```tsx
import type { Metadata, Viewport } from 'next';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getThemeMode } from '@/libs/ThemeMode';
import { routing } from '@/libs/I18nRouting';
import '@/styles/global.css';

// ... existing metadata / viewport / generateStaticParams unchanged ...

const SYSTEM_THEME_SCRIPT = `
if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
  document.documentElement.classList.add('dark');
}
`;

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const themeMode = await getThemeMode();
  const htmlClassName = themeMode === 'dark' ? 'dark' : '';

  return (
    <html lang={locale} className={htmlClassName}>
      <head>
        {themeMode === 'system' && (
          // eslint-disable-next-line react-dom/no-dangerously-set-innerhtml
          <script dangerouslySetInnerHTML={{ __html: SYSTEM_THEME_SCRIPT }} />
        )}
      </head>
      <body>
        <NextIntlClientProvider>
          {props.children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

Note: the `eslint-disable` comment name is a best-effort guess at ultracite's rule id for `dangerouslySetInnerHTML`. If `bun run lint` reports a different rule id, update the comment to match exactly — do not silence lint by disabling a broader rule.

- [ ] **Step 3: Type-check and lint**

Run: `bun run check:types && bun run lint`
Expected: no errors. Fix the disable-comment rule id here if `lint` flags it.

- [ ] **Step 4: Manual verification**

Run: `bun run dev`, then in a browser:
- Visit `/` (marketing) with OS set to light and to dark — confirm it still follows OS (this is the regression-risk check: class-based variant + script must reproduce the old media-based behavior for anonymous visitors).
- Confirm no console errors from the inline script.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css "src/app/[locale]/layout.tsx"
git commit -m "feat: resolve theme mode server-side with no-flash fallback"
```

---

### Task 5: `updateThemeMode` server action

**Files:**
- Create: `src/app/[locale]/(auth)/dashboard/settings/appearance/actions.ts`
- Test: `src/app/[locale]/(auth)/dashboard/settings/appearance/actions.test.ts`

**Interfaces:**
- Consumes: `ThemeModeValidation` (Task 2), `userPreferencesSchema` (Task 1).
- Produces: `type UpdateThemeModeState = { status: 'idle' | 'success' | 'error' }` and `updateThemeMode(prevState: UpdateThemeModeState, formData: FormData): Promise<UpdateThemeModeState>`. Consumed by the client form in Task 6.

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from 'vitest';

const authMock = vi.fn();
const onConflictDoUpdateMock = vi.fn().mockResolvedValue(undefined);
const valuesMock = vi.fn(() => ({ onConflictDoUpdate: onConflictDoUpdateMock }));
const insertMock = vi.fn(() => ({ values: valuesMock }));
const revalidatePathMock = vi.fn();

vi.mock('@clerk/nextjs/server', () => ({
  auth: () => authMock(),
}));

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => revalidatePathMock(...args),
}));

vi.mock('@/libs/DB', () => ({
  db: { insert: (...args: unknown[]) => insertMock(...args) },
}));

describe('updateThemeMode', () => {
  it('rejects an invalid theme mode without touching the database', async () => {
    const { updateThemeMode } = await import('./actions');
    const formData = new FormData();
    formData.set('themeMode', 'neon');

    const result = await updateThemeMode({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('rejects when signed out', async () => {
    authMock.mockResolvedValueOnce({ userId: null });
    const { updateThemeMode } = await import('./actions');
    const formData = new FormData();
    formData.set('themeMode', 'dark');

    const result = await updateThemeMode({ status: 'idle' }, formData);

    expect(result.status).toBe('error');
    expect(insertMock).not.toHaveBeenCalled();
  });

  it('upserts the preference and revalidates on success', async () => {
    authMock.mockResolvedValueOnce({ userId: 'user_1' });
    const { updateThemeMode } = await import('./actions');
    const formData = new FormData();
    formData.set('themeMode', 'dark');

    const result = await updateThemeMode({ status: 'idle' }, formData);

    expect(result.status).toBe('success');
    expect(valuesMock).toHaveBeenCalledWith({ clerkUserId: 'user_1', themeMode: 'dark' });
    expect(revalidatePathMock).toHaveBeenCalledWith('/', 'layout');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `bun run test -- src/app/\[locale\]/\(auth\)/dashboard/settings/appearance/actions.test.ts`
Expected: FAIL — cannot find module `./actions`.

- [ ] **Step 3: Write the implementation**

```ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/libs/DB';
import { userPreferencesSchema } from '@/models/Schema';
import { ThemeModeValidation } from '@/validations/ThemeModeValidation';

export type UpdateThemeModeState = {
  status: 'idle' | 'success' | 'error';
};

export const updateThemeMode = async (
  _prevState: UpdateThemeModeState,
  formData: FormData,
): Promise<UpdateThemeModeState> => {
  const parsed = ThemeModeValidation.safeParse({
    themeMode: formData.get('themeMode'),
  });

  if (!parsed.success) {
    return { status: 'error' };
  }

  const { userId } = await auth();

  if (!userId) {
    return { status: 'error' };
  }

  await db
    .insert(userPreferencesSchema)
    .values({ clerkUserId: userId, themeMode: parsed.data.themeMode })
    .onConflictDoUpdate({
      target: userPreferencesSchema.clerkUserId,
      set: { themeMode: parsed.data.themeMode },
    });

  revalidatePath('/', 'layout');

  return { status: 'success' };
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `bun run test -- src/app/\[locale\]/\(auth\)/dashboard/settings/appearance/actions.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "src/app/[locale]/(auth)/dashboard/settings/appearance/actions.ts" "src/app/[locale]/(auth)/dashboard/settings/appearance/actions.test.ts"
git commit -m "feat: add server action to persist theme mode preference"
```

---

### Task 6: Appearance page, form, nav entry, i18n

**Files:**
- Create: `src/app/[locale]/(auth)/dashboard/settings/appearance/page.tsx`
- Create: `src/components/AppearanceForm.tsx`
- Modify: `src/components/layouts/SidebarNav.tsx`
- Modify: `src/locales/en.json`
- Modify: `src/locales/th.json`

**Interfaces:**
- Consumes: `getThemeMode` (Task 3), `updateThemeMode` + `UpdateThemeModeState` (Task 5).

- [ ] **Step 1: Add i18n keys**

In `src/locales/en.json`, add a new top-level key (keep existing keys untouched) and one nav key inside the existing `"Navigation"` object:

```json
"Navigation": {
  "home": "Home",
  "about": "About",
  "counter": "Counter",
  "portfolio": "Portfolio",
  "dashboard": "Dashboard",
  "settings_appearance": "Appearance"
},
```

```json
"SettingsAppearancePage": {
  "page_title": "Appearance",
  "theme_light": "Light",
  "theme_dark": "Dark",
  "theme_system": "System",
  "save_button": "Save",
  "save_success": "Preference saved"
}
```

In `src/locales/th.json`, same structure:

```json
"Navigation": {
  "home": "หน้าแรก",
  "about": "เกี่ยวกับเรา",
  "counter": "ตัวนับ",
  "portfolio": "ผลงาน",
  "dashboard": "แดชบอร์ด",
  "settings_appearance": "การแสดงผล"
},
```

```json
"SettingsAppearancePage": {
  "page_title": "การแสดงผล",
  "theme_light": "สว่าง",
  "theme_dark": "มืด",
  "theme_system": "ตามระบบ",
  "save_button": "บันทึก",
  "save_success": "บันทึกการตั้งค่าแล้ว"
}
```

(Match the existing keys/values already present in each file for `Navigation` — only add `settings_appearance` and the new `SettingsAppearancePage` block; do not change unrelated keys.)

- [ ] **Step 2: Add the sidebar nav entry**

Edit `src/components/layouts/SidebarNav.tsx`, extend `navEntries`:

```tsx
const navEntries: NavEntry[] = [
  { href: '/', label: t('home') },
  { href: '/about/', label: t('about') },
  { href: '/counter/', label: t('counter') },
  { href: '/portfolio/', label: t('portfolio') },
  { href: '/dashboard/', label: t('dashboard') },
  { href: '/dashboard/settings/appearance/', label: t('settings_appearance') },
];
```

- [ ] **Step 3: Update the sidebar nav test expectation**

`src/components/layouts/SidebarNav.test.tsx` currently asserts `toBeGreaterThanOrEqual(5)` links — this still passes with 6 entries, no change needed. Run it to confirm:

Run: `bun run test -- src/components/layouts/SidebarNav.test.tsx`
Expected: PASS (existing tests, no changes required).

- [ ] **Step 4: Create the client form**

Create `src/components/AppearanceForm.tsx`:

```tsx
'use client';

import { useTranslations } from 'next-intl';
import { useActionState } from 'react';
import {
  type UpdateThemeModeState,
  updateThemeMode,
} from '@/app/[locale]/(auth)/dashboard/settings/appearance/actions';

const initialState: UpdateThemeModeState = { status: 'idle' };

const THEME_OPTIONS = ['light', 'dark', 'system'] as const;

export const AppearanceForm = (props: { currentThemeMode: 'light' | 'dark' | 'system' }) => {
  const t = useTranslations('SettingsAppearancePage');
  const [state, formAction, isPending] = useActionState(updateThemeMode, initialState);

  return (
    <form action={formAction} className="max-w-md space-y-4">
      <fieldset className="space-y-2">
        {THEME_OPTIONS.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
          >
            <input
              className="size-4"
              defaultChecked={props.currentThemeMode === option}
              name="themeMode"
              type="radio"
              value={option}
            />
            {t(`theme_${option}`)}
          </label>
        ))}
      </fieldset>
      <button
        className="rounded-md bg-blue-500 px-4 py-2 text-sm text-white hover:bg-blue-600 disabled:opacity-50"
        disabled={isPending}
        type="submit"
      >
        {t('save_button')}
      </button>
      {state.status === 'success' && (
        <p className="text-sm text-green-600 dark:text-green-400">{t('save_success')}</p>
      )}
    </form>
  );
};
```

- [ ] **Step 5: Create the page**

Create `src/app/[locale]/(auth)/dashboard/settings/appearance/page.tsx`:

```tsx
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AppearanceForm } from '@/components/AppearanceForm';
import { getThemeMode } from '@/libs/ThemeMode';

export default async function SettingsAppearancePage(props: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: 'SettingsAppearancePage' });
  const themeMode = await getThemeMode();

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        {t('page_title')}
      </h1>
      <AppearanceForm currentThemeMode={themeMode} />
    </div>
  );
}
```

No `generateMetadata` here — per existing dashboard convention, meta (title/description) stays defined once in `src/app/[locale]/(auth)/dashboard/layout.tsx` (`DashboardLayout` namespace), same as `user-profile/page.tsx`.

- [ ] **Step 6: Type-check, lint, i18n check**

Run: `bun run check:types && bun run lint && bun run check:i18n`
Expected: no errors, no missing/unused i18n keys.

- [ ] **Step 7: Manual verification**

Run: `bun run dev`, sign in, go to `/dashboard/settings/appearance`:
- Confirm the new sidebar link navigates here.
- Pick "Dark", save, reload the page (hard refresh) — page loads dark with no flash of light.
- Pick "Light", save, reload — loads light with no flash.
- Pick "System", save, reload — matches OS preference via the fallback script.
- Sign out and visit `/` — still follows OS preference (confirms the anonymous/public path is unaffected).

- [ ] **Step 8: Commit**

```bash
git add src/locales/en.json src/locales/th.json src/components/layouts/SidebarNav.tsx src/components/AppearanceForm.tsx "src/app/[locale]/(auth)/dashboard/settings/appearance/page.tsx"
git commit -m "feat: add appearance settings page with theme mode radio form"
```

---

### Task 7: Full validation pass

**Files:** none (verification only)

- [ ] **Step 1: Run the full check suite**

Run: `bun run check:types && bun run lint && bun run check:i18n && bun run test`
Expected: all pass.

- [ ] **Step 2: Build**

Run: `bun run build-local`
Expected: build succeeds (exercises the root layout change against every existing route).

- [ ] **Step 3: Update the ticket**

Mark `obsidian/kanban/tasks/NEX-1002.md` acceptance criteria checked and note in `### Review Notes` (added by `/kanban move-review`) that the sidebar/nav Open Question was resolved by adding `settings_appearance` directly (simple, low-risk copy decision — not left blocking).

---

## Self-Review Notes (for the planner, not a task)

- Spec coverage: domain model (Task 1), read path/no-flash (Task 4), write path (Task 5), page UI (Task 6), i18n (Task 6), out-of-scope items untouched (no new dark-mode styles added, no anonymous persistence, no extra settings). Migration step covered in Task 1.
- Open Question from the ticket ("confirm sidebar/nav entry point") is resolved in Task 6 Step 2 with a concrete, low-risk default rather than left blocking, since it only affects nav copy and can be renamed trivially later.
- Type consistency: `ThemeMode` / `themeMode` / `UpdateThemeModeState` names are identical across Tasks 3, 5, 6 — checked.
