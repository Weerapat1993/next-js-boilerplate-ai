# Project Requirements: Next.js Boilerplate AI

## Tech Stack
- Next.js 16+ App Router
- TypeScript
- Tailwind CSS v4
- Clerk (auth)
- DrizzleORM + PGlite (local dev) / Neon (production)
- next-intl (i18n)
- Arcjet (rate limiting / bot protection)
- LogTape (logging)
- Sentry (error tracking)
- Vitest (unit/integration tests)
- Playwright (e2e tests)
- react-hook-form + Zod (forms/validation)
- Bun (package manager + runtime)

## Route Structure

`src/app/[locale]/`:
- `(marketing)/` — public pages (home, about, portfolio, counter)
- `(auth)/` — Clerk-protected pages (dashboard, user-profile)
- `(auth)/(center)/` — centered layout (sign-in / sign-up)

## Functional Requirements
- Auth ผ่าน Clerk — Register / Login / Logout
- SPA routing ผ่าน Next.js App Router (ไม่ใช้ React Router)
- รองรับ CRUD หลักของระบบ
- Validation ทั้งฝั่ง frontend (Zod) และ backend (Zod + server actions)
- แสดง loading, error และ success state ทุก interaction
- i18n รองรับ `en` และ `fr` (เพิ่ม locale ใน `AppConfig.ts`)

## Key Singletons (`src/libs/`)
- `Env.ts` — validate env vars ทุกตัว; ห้ามอ่าน `process.env` โดยตรง
- `DB.ts` — Drizzle connection, cached ใน `globalThis` ระหว่าง HMR
- `Logger.ts` — LogTape logger; แทน `console.*`
- `Arcjet.ts` — rate limiting / bot protection middleware
- `I18n.ts` / `I18nNavigation.ts` / `I18nRouting.ts` — next-intl config

## Database
- Schema ใน `src/models/Schema.ts`
- Migrations ใน `migrations/`
- Local dev: PGlite (ไม่ต้อง Docker) — `dev` script auto-migrate
- Production: Neon (PostgreSQL)
- Generate migration: `bun run db:generate`
- Run migration: `bun run db:migrate`

## Validation
- Zod schemas ใน `src/validations/`
- Forms: `react-hook-form` + `@hookform/resolvers/zod`

## i18n
- Locale files ใน `src/locales/{en,fr}.json`
- Config ใน `src/utils/AppConfig.ts` (app name, locales, default locale)
- Check coverage: `bun run check:i18n`

## Commands
```bash
bun run dev              # start dev server (PGlite + Next.js + Spotlight)
bun run build-local      # build with in-memory PGlite
bun run lint             # lint + type-check via ultracite
bun run check:types      # TypeScript only
bun run check:deps       # unused deps via knip
bun run check:i18n       # i18n key coverage
bun run test             # vitest unit tests
bun run test:e2e         # Playwright e2e
bun run db:generate      # generate Drizzle migration
bun run db:migrate       # run pending migrations
bun run db:studio        # Drizzle Studio UI
```
