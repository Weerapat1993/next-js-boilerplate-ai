# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
bun run dev              # start dev server (spins up PGlite file DB + Next.js + Spotlight)
bun run build-local      # build with in-memory PGlite (no external DB needed)
bun run lint             # lint + type-check via ultracite
bun run check:types      # TypeScript only
bun run check:deps       # unused deps via knip
bun run check:i18n       # i18n key coverage check
bun run test             # vitest unit tests
bun run test:e2e         # Playwright e2e
bun run storybook:test   # vitest storybook tests
bun run db:generate      # generate Drizzle migration from schema
bun run db:migrate       # run pending migrations
bun run db:studio        # Drizzle Studio UI
```

Run a single test file: `bun run test -- src/utils/Helpers.test.ts`

## Architecture

**Stack**: Next.js 16+ App Router · TypeScript · Tailwind CSS v4 · Clerk (auth) · DrizzleORM + PGlite/Neon (PostgreSQL) · next-intl (i18n) · Arcjet (security) · LogTape (logging) · Sentry (errors) · Vitest · Playwright

**Route groups** under `src/app/[locale]/`:
- `(marketing)/` — public pages (home, about, portfolio, counter)
- `(auth)/` — Clerk-protected pages (dashboard, user-profile)
- `(auth)/(center)/` — centered layout for sign-in / sign-up

**Key lib singletons** (`src/libs/`):
- `Env.ts` — all env vars validated via `@t3-oss/env-nextjs` + Zod; never read `process.env` directly elsewhere
- `DB.ts` — Drizzle connection singleton, cached in `globalThis` during dev to survive HMR
- `Logger.ts` — LogTape logger; use this instead of `console.*`
- `Arcjet.ts` — rate limiting / bot protection middleware
- `I18n.ts` / `I18nNavigation.ts` / `I18nRouting.ts` — next-intl configuration

**Database**: Schema defined in `src/models/Schema.ts`. Migrations land in `migrations/`. Local dev uses PGlite (no Docker needed); production targets Neon. The `db-server:file` script auto-migrates on `dev` start.

**Validation**: Zod schemas in `src/validations/`. Forms use `react-hook-form` + `@hookform/resolvers/zod`.

**i18n**: Locale files in `src/locales/{en,fr}.json`. All user-visible strings must go through `getTranslations` (server) or `useTranslations` (client). Run `check:i18n` to catch missing keys.

**Config**: `src/utils/AppConfig.ts` — app name, supported locales, default locale.
