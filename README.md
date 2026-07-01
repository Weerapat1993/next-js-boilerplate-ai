# Next.js Boilerplate AI

This project was cloned from [ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate).

## Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Weerapat1993/next-js-boilerplate-ai)

## Getting Started

### 1. Install dependencies

```shell
bun install
```

### 2. Set up environment variables

Create `.env.local` (not tracked by Git) and add the required secrets:

```shell
# Clerk authentication — get keys from https://clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Database — local PGlite works out of the box, no Docker needed
# For production use Neon: https://get.neon.com
DATABASE_URL=postgresql://postgres:123456@localhost:5432/next-js

# Optional: Arcjet security — https://arcjet.com
# ARCJET_KEY=ajkey_...
```

### 3. Run database migrations

```shell
bun run db:migrate
```

> Skip this step on first local run — `bun run dev` auto-migrates via PGlite.

### 4. Start dev server

```shell
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Useful Commands

| Command | Description |
| --- | --- |
| `bun run dev` | Start dev server (PGlite + Next.js + Spotlight) |
| `bun run build-local` | Build with local in-memory DB |
| `bun run lint` | Lint + type-check |
| `bun run check:types` | TypeScript check only |
| `bun run test` | Unit tests (Vitest) |
| `bun run test:e2e` | E2E tests (Playwright) |
| `bun run db:generate` | Generate Drizzle migration from schema |
| `bun run db:migrate` | Run pending migrations |
| `bun run db:studio` | Open Drizzle Studio UI |

## Original Source

Full documentation and feature list:
[https://github.com/ixartz/Next-js-Boilerplate](https://github.com/ixartz/Next-js-Boilerplate)
