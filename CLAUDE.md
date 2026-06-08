# cv-builder

A resume/cover-letter builder monorepo: NestJS API + Next.js web app, sharing
layout/data definitions for a PDF resume constructor (Puppeteer + react-pdf).

## Layout

```
apps/api/    NestJS backend (Prisma/Postgres, sessions, Google OAuth, AI usage)
apps/web/    Next.js 16 frontend (App Router, Tailwind v4, Lexical editor)
shared/      Source-of-truth resume-constructor layout/data/PDF definitions
scripts/     sync-resume-constructor-layout.mjs — copies shared/ into both apps
```

`shared/resume-constructor/*` is copied into `apps/web/src/shared/` and
`apps/api/src/shared/` by `scripts/sync-resume-constructor-layout.mjs`. This
runs automatically via `predev`/`prebuild`/`prestart:dev` npm hooks — **never
edit the copies in `apps/*/src/shared/` directly**, edit the source under
`shared/` and let the sync script regenerate the copies (or rerun it manually:
`node scripts/sync-resume-constructor-layout.mjs`).

## Commands

Run from repo root unless noted.

- `npm run dev` — runs API and web concurrently (`dev:api` + `dev:web`)
- `npm run dev:api` / `npm run dev:web` — run a single app

Inside `apps/api`:
- `npm run start:dev` — Nest with watch mode
- `npm run lint` — eslint --fix
- `npm test` / `npm run test:watch` / `npm run test:cov` — Jest unit tests
- `npm run test:e2e` — e2e tests (`test/jest-e2e.json`)
- `npm run build` — `nest build`

Inside `apps/web`:
- `npm run dev` — Next dev server (turbopack)
- `npm run lint` — eslint
- `npm run gen:api` — regenerate the typed API client + zod schemas via Orval,
  reading the live OpenAPI spec from `${NEXT_PUBLIC_API_URL}/api-json`
  (**the API must be running** for this to succeed)
- `npm run build` — Next build

## API client generation (Orval)

The web app does not hand-write API types/hooks. `apps/web/orval.config.ts`
generates:
- `src/api/generated.ts` — react-query hooks/client (split mode), via the
  mutator at `src/api/mutator.ts`
- `src/api/models/**/*.zod.ts` — zod schemas (tags-split mode)

These are regenerated from the running API's `/api-json` (Swagger/OpenAPI)
endpoint. After changing API DTOs/controllers, start the API and run
`npm run gen:api` in `apps/web` rather than editing generated files by hand.

## Backend (apps/api)

- NestJS 11, modules under `src/`: `auth`, `user`, `document`, `ai`, `prisma`,
  `prisma-client-exception`, `shared`
- Prisma 7 with the `prisma-client` generator (output to
  `apps/api/generated/prisma`), Postgres via `@prisma/adapter-pg`
- Auth: sessions (`express-session` + `connect-redis` +
  `prisma-session-store`), Google OAuth (`passport-google-oauth20`), local
  strategy with `argon2` password hashing
- Swagger/OpenAPI is served at `/api-json` — this is the contract the web app's
  Orval generation depends on, so keep DTOs and `@nestjs/swagger` decorators
  accurate
- AI features live in `src/ai`, backed by the `openai` SDK with rate-limited
  usage tracked per user (`AiRequestUsage` in the Prisma schema)
- PDF export uses `puppeteer`; Chrome is installed post-install
  (`PUPPETEER_CACHE_DIR=.cache/puppeteer`) — see `.puppeteer.rc` and
  `render-build.sh` for deployment-specific Chrome executable handling

## Frontend (apps/web)

- Next.js 16 App Router under `src/app`, route groups `(protected)` and
  `(admin)` gate authenticated/admin areas; `src/lib/auth/getMeServer.ts`
  fetches the session user server-side
- Styling: Tailwind CSS v4, `radix-ui`/`@base-ui/react` primitives, components
  under `src/components/ui` (shadcn-derived) vs. `src/components/feature`
  (domain features) vs. `src/components/blocks`/`layout`/`editor`
- Forms: `react-hook-form` + `@hookform/resolvers` + `zod`, with
  `@tanstack/react-form-nextjs` for multistep flows
- Data fetching: `@tanstack/react-query`, generated hooks from
  `src/api/generated.ts`, axios mutator in `src/api/mutator.ts`
- Rich text: Lexical (`@lexical/*`, `@lexkit/editor`) — editor experiments live
  in `app/editor-00` and `app/editor-md`
- The resume constructor (`components/feature/document/resume-constructor`)
  renders both an on-screen preview and feeds the PDF export pipeline; layout
  constants must stay in sync with `shared/resume-constructor/*` (see sync
  script above) and with the API's PDF rendering

## Database

- Prisma schema: `apps/api/prisma/schema.prisma`, Postgres
- Core models: `User`, `Credential`, `OAuthAccount`, `Session`, `Document`
  (RESUME / COVER_LETTER), `AiRequestUsage`
- After schema changes: run Prisma migrate/generate from `apps/api` (the
  generated client output path is `apps/api/generated/prisma`, not the default
  `node_modules` location)

## Conventions

- TypeScript strict mode across both apps
- Formatting/linting: Prettier + ESLint (flat config) in `apps/api`;
  eslint-config-next + typescript in `apps/web`. Run `npm run lint` in the
  relevant app before considering a change done
- Path alias `@/*` → `src/*` in `apps/web`
- Don't hand-edit generated files: `apps/web/src/api/generated.ts`,
  `apps/web/src/api/models/**`, `apps/api/generated/prisma/**`,
  `apps/*/src/shared/resume-constructor-*` (see sync note above)
