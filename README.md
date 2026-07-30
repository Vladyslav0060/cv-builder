# CV Assistant

CV Assistant is a full-stack resume and cover letter builder designed as a production-style pet project: clear architecture, typed contracts, authenticated user workflows, AI-assisted document creation, subscription limits, and PDF export.

The application helps users create, edit, store, and export professional career documents. It combines a modern Next.js frontend with a NestJS API, PostgreSQL persistence, Prisma ORM, server-side sessions, OpenAPI-generated clients, Stripe subscriptions, and AI-powered resume generation.

## Why This Project Exists

This project is built to demonstrate how I approache a real business product, not just a UI prototype.

It focuses on:

- Delivering a complete user journey from registration to document export.
- Keeping frontend and backend contracts synchronized through OpenAPI generation.
- Treating authentication, user-owned data, validation, and quota limits as first-class concerns.
- Separating product workflows into maintainable application services.
- Building with tools and patterns that can scale into a commercial SaaS product.

## Product Capabilities

- User registration, login, logout, email verification, and password reset.
- Google OAuth authentication.
- Session-based authentication with HTTP-only cookies.
- User profile management with career data such as experience, education, skills, projects, certifications, and contact details.
- AI-generated resumes from structured prompts and optional uploaded CV files.
- AI-generated cover letters.
- Resume constructor with editable structured resume data.
- PDF export for resumes.
- Document storage and document previews.
- Subscription plans powered by Stripe Checkout.
- Stripe webhook handling with idempotency tracking.
- Daily usage limits by tier for AI creation and export operations.
- Swagger/OpenAPI API documentation.
- Generated frontend API clients and schemas.

## Architecture

The repository is organized as a small monorepo:

```text
.
├── apps
│   ├── api       # NestJS backend, Prisma, auth, AI, subscriptions, PDF export
│   └── web       # Next.js frontend, React UI, generated API hooks
├── shared        # Shared resume constructor data/layout utilities
└── scripts       # Build-time synchronization and Prisma helper scripts
```

### Backend

The backend is a NestJS application structured around business modules:

- `auth` handles local auth, Google OAuth, sessions, verification, and password recovery.
- `document` handles resume and cover letter creation, storage, editing, uploads, AI generation, and PDF export.
- `subscription` handles Stripe plans, checkout sessions, subscription state, cancellation, and webhooks.
- `usage` enforces tier-based daily quotas.
- `prisma` centralizes database access.

The API exposes Swagger documentation at `/api` and an OpenAPI JSON document used by the frontend code generator.

### Frontend

The frontend is a Next.js application using React, typed generated API hooks, form validation, modern component primitives, and a resume editing experience.

The web app uses:

- Server and client routes with the Next.js App Router.
- TanStack Query for API state management.
- Orval-generated API clients from the backend OpenAPI schema.
- Zod schemas generated from API contracts.
- Tailwind CSS and component primitives for consistent UI.
- Rich text editing through Lexical-based packages.

## Technology Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- TanStack Query
- React Hook Form
- Zod
- Orval
- Lexical / Lexkit editor tooling
- Radix UI and Base UI primitives
- Lucide and Phosphor icons
- Framer Motion

### Backend

- NestJS 11
- TypeScript
- Prisma 7
- PostgreSQL
- Passport local strategy
- Google OAuth 2.0
- Express sessions
- PostgreSQL-backed session storage
- Argon2 password hashing
- Class Validator / Class Transformer
- Swagger / OpenAPI
- Stripe SDK
- OpenAI SDK-compatible AI integration
- Puppeteer for PDF rendering/export workflows
- Jest and Supertest

### Infrastructure And Tooling

- Monorepo-style application layout.
- Docker Compose support for backend dependencies.
- Prisma migrations.
- ESLint and Prettier.
- Generated API clients to reduce frontend/backend drift.
- Shared resume constructor modules synchronized across apps.

## Data Safety And Security

This project treats user data as sensitive because resumes contain personal identity, contact, career, and employment information.

Implemented safety practices include:

- Passwords are hashed with Argon2 before storage.
- Authentication uses server-side sessions rather than exposing long-lived credentials to browser JavaScript.
- Session cookies are HTTP-only and configured for secure cross-site deployments.
- API routes that operate on user documents require authenticated access.
- Document access is scoped by the current authenticated user.
- Uploaded resume files are restricted by file size and MIME/type checks.
- Global request validation strips unknown properties and rejects non-whitelisted fields.
- Database relations cascade user-owned data consistently.
- Stripe webhook events are persisted to support idempotent processing.
- Usage limits reduce abuse of AI and export endpoints.
- Configuration is environment-driven so secrets stay outside source code.
- Prisma migrations include row-level-security-oriented database changes for user-owned tables.

For a commercial deployment, the next hardening steps would include centralized audit logging, explicit data retention policies, encrypted object storage for uploaded/generated files if persisted outside PostgreSQL, secret rotation, production observability, and periodic security review.

## Engineering Practices Demonstrated

- Modular backend design with clear ownership boundaries.
- Application services for business workflows instead of oversized controllers.
- DTO-based input/output contracts.
- Typed generated frontend clients from OpenAPI.
- Database schema managed through migrations.
- Authentication and authorization checks at route boundaries.
- Guard-based tier enforcement.
- Idempotent webhook design.
- Validation-first API surface.
- User-owned data modeling.
- Focused unit and integration test setup.
- Shared domain modules for resume rendering consistency.

## Getting Started

### Prerequisites

- Node.js 22 or compatible modern Node runtime.
- npm.
- PostgreSQL database.
- Stripe account for subscription flows.
- Google OAuth credentials for Google login.
- AI provider credentials for AI-assisted generation.

### Install Dependencies

```bash
npm install
cd apps/api && npm install
cd ../web && npm install
```

### Configure Environment

Create environment files for the API and web app based on the variables used by the config modules.

Common API variables include:

```env
DATABASE_URL=
DIRECT_URL=
APP_SECRET=
AUTH_SUCCESS_REDIRECT_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Common web variables include:

```env
NEXT_PUBLIC_API_URL=
```

The exact values depend on the target environment and third-party accounts.

### Database Setup

From `apps/api`:

```bash
npm run prisma:generate
npx prisma migrate deploy
```

For local development, use the project Docker Compose file if you want a local database dependency:

```bash
cd apps/api
docker compose up -d
```

### Run The Application

From the repository root:

```bash
npm run dev
```

This starts:

- API: `http://localhost:5050`
- Web: `http://localhost:3000`
- Swagger docs: `http://localhost:5050/api`

## Development Commands

Root:

```bash
npm run dev
npm run dev:api
npm run dev:web
```

Backend:

```bash
cd apps/api
npm run build
npm run test
npm run test:e2e
npm run lint
npm run prisma:generate
```

Frontend:

```bash
cd apps/web
npm run build
npm run lint
npm run gen:api
```

## API Contract Workflow

The backend publishes an OpenAPI document through Swagger. The frontend uses Orval to generate typed API clients and React Query hooks from that contract.

This keeps API integration maintainable:

- Backend DTOs define the contract.
- OpenAPI exposes the contract.
- Orval generates frontend access layers.
- React Query manages client-side request state.

## Business Use Cases

This codebase is relevant for companies or clients looking for:

- SaaS MVP development.
- AI-assisted document workflows.
- Resume, HR, recruiting, or career-tech products.
- Subscription-based web applications.
- Secure user account systems.
- Stripe Checkout and webhook integration.
- Full-stack TypeScript architecture.
- API-first frontend/backend integration.

## Project Status

This is a pet project with production-oriented architecture. It is suitable for portfolio review, technical interviews, client demonstrations, and as a foundation for an MVP. Before production launch, it should receive environment-specific security review, monitoring, backup strategy, CI/CD hardening, and product-specific legal/privacy documentation.
