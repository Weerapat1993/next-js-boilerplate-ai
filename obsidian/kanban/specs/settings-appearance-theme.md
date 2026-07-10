# Spec: `/settings/appearance` — Theme mode setting

## Problem

Dark mode currently only follows OS `prefers-color-scheme` via the Tailwind
`@custom-variant dark (&:where(.dark, .dark *))` in `src/styles/global.css:5`.
There is no UI, no persistence, no way for a logged-in user to override it.

## Goals

- New page `/[locale]/(auth)/dashboard/settings/appearance` (behind Clerk auth,
  same group as `dashboard`/`user-profile`).
- User picks one of: `light` / `dark` / `system`.
- Preference persisted per-user in Postgres (Drizzle), not cookie/localStorage.
- No flash-of-wrong-theme on page load (SSR-aware).

## Domain model

New table, `src/models/Schema.ts`:

```ts
export const userPreferences = pgTable('user_preferences', {
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

- `clerkUserId` maps to Clerk's `userId` from `auth()` — one row per user, not
  a generic key-value prefs blob (YAGNI until a second preference exists).
- `themeMode` enum, default `system` (matches current OS-follow behavior, so
  existing users get no visible change until they opt in).

## Read path (no-flash SSR)

1. In `[locale]/(auth)/dashboard/layout.tsx`, server-side: `auth()` →
   `clerkUserId` → query `userPreferences` for `themeMode`
   (or `'system'` if no row yet — first-time user).
2. Resolve to `'light' | 'dark'`:
   - `light` / `dark` → use directly.
   - `system` → read `prefers-color-scheme` — not available server-side, so
     render with no forced class and add a tiny inline
     `<script>` (blocking, before paint) that reads
     `matchMedia('(prefers-color-scheme: dark)')` and toggles `.dark` on
     `<html>`. Only needed for the `system` case; `light`/`dark` are set
     directly server-side via a class on `<html>`, avoiding the script/flash
     entirely for explicit choices.
3. `<html className={resolvedClass}>` in the root layout.

## Write path

- New Server Action or route handler, `src/app/[locale]/(auth)/dashboard/settings/appearance/actions.ts`:
  - `updateThemeMode(themeMode: 'light' | 'dark' | 'system')`
  - `auth()` for `clerkUserId`, upsert into `userPreferences`.
  - Validate `themeMode` with a Zod schema in `src/validations/`.
- On submit: server action updates DB → `revalidatePath` or full navigation so
  the layout re-reads the new value server-side (keeps SSR no-flash guarantee;
  avoids a separate client-side theme context).

## Page UI

`src/app/[locale]/(auth)/dashboard/settings/appearance/page.tsx`:

- `PageProps` with `params: Promise<{ locale: string }>`, `setRequestLocale`.
- Radio group / segmented control: Light / Dark / System, current value
  pre-selected from server-fetched preference.
- Submits via server action (`useActionState` or plain form action) —
  no client-side theme toggling library.
- Meta (title/description) defined once in `dashboard/layout.tsx` per existing
  convention, not per-page.

## i18n

New namespace `SettingsAppearancePage` in `src/locales/en.json` and `fr.json`:
`page_title`, `theme_light`, `theme_dark`, `theme_system`, `save_button`,
`save_success`. Run `check:i18n` after.

## Out of scope

- Per-component theming beyond existing Tailwind `dark:` classes — this spec
  only wires the toggle, not new dark-mode styles.
- Anonymous/public theme preference — public pages keep OS-only behavior.
- Additional appearance settings (font size, accent color, etc.) — table
  and page are scoped to `themeMode` only; extend later if a second setting
  appears.

## Migration

- `bun run db:generate` after schema change → review generated SQL in
  `migrations/` → `bun run db:migrate`.

## Open questions for implementation

- Confirm sidebar/nav entry point to reach `/settings/appearance` (new nav
  item under dashboard, exact copy TBD).
