# Fresh Pick - Premium Grocery Delivery Platform

**Pick Fresh, Live Easy** — Sri Lanka's premium online grocery delivery service with subscriptions, supplier operations, and recurring order flows.

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![Postgres](https://img.shields.io/badge/Postgres-Supabase-green)
![Prisma](https://img.shields.io/badge/ORM-Prisma-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## What this platform does

Fresh Pick is a commerce platform for fresh products, private client ordering, subscriptions, supplier uploads, dashboards, and customer ordering flows.

The current codebase has moved toward a relational backend using **Prisma + Postgres**. Authentication is still handled by the app through **JWT access/refresh tokens stored in HTTP-only cookies**.

---

## Platform features

### Customer experience
- Product browsing with category sections and featured product cards
- Recurring order and subscription flows
- Private client call-to-action sections
- Mobile-first storefront UI
- SEO-friendly Next.js pages

### Commerce and operations
- Product, category, supplier, order, subscription, wishlist, review, and notification data models
- Supplier upload support
- Customer and supplier dashboard work in progress
- Email verification and password reset email hooks through SendGrid

### Security and auth
- Password hashing with bcrypt
- JWT access and refresh tokens
- Refresh tokens stored as hashed database rows
- HTTP-only auth cookies
- Rate-limited auth endpoints
- Role-based user model

---

## Tech stack

```txt
Frontend:       Next.js App Router, React, TypeScript, Tailwind CSS
Backend:        Next.js API Routes
Database:       Supabase Postgres / PostgreSQL
ORM:            Prisma
Auth:           JWT with HTTP-only cookies, bcrypt password hashing
Email:          SendGrid optional integration
Storage:        Azure Blob Storage optional integration
Testing:        Jest
Deployment:     Netlify-ready Next.js setup
```

---

## Core API endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | Register a user and set auth cookies |
| POST | `/api/auth/signin` | Sign in with email/phone and password |
| POST | `/api/auth/logout` | Log out current session |
| GET | `/api/auth/me` | Return current authenticated user |

### Commerce

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products with filters |
| GET | `/api/categories` | List active categories |
| GET/POST/PATCH | `/api/subscriptions` | Subscription management |
| GET/POST | `/api/reviews` | Product reviews |
| GET/POST | `/api/referrals` | Referral management |

---

## Quick start

```bash
# Clone and install
git clone <repo-url>
cd newfreshontimewebsite
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your real values

# Generate Prisma client
npx prisma generate

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment variables

Use `.env.example` as the starting point.

```bash
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public"

# Authentication
JWT_SECRET="replace-with-a-long-random-secret"
JWT_ACCESS_EXPIRES="7d"
JWT_REFRESH_EXPIRES="30d"

# App URL
FRONTEND_URL="http://localhost:3000"

# Email, optional
SENDGRID_API_KEY=""
SENDGRID_FROM_EMAIL="hello@freshpick.lk"

# Storage, optional
AZURE_STORAGE_CONNECTION_STRING=""
AZURE_STORAGE_CONTAINER_NAME=""

# Analytics, optional
NEXT_PUBLIC_GA_ID=""
```

---

## Database

The Prisma schema is stored in `prisma/schema.prisma` and targets PostgreSQL through `DATABASE_URL`.

Useful commands:

```bash
npm run db:migrate       # apply migrations in deployed/stable environments
npm run db:migrate:dev   # create/apply migrations during development
npm run db:seed          # seed database data
npm run db:studio        # open Prisma Studio
```

---

## Architecture

```txt
app/
├── api/                 # Next.js API routes
│   ├── auth/            # Signup, signin, logout, current user
│   ├── products/        # Product APIs
│   ├── categories/      # Category APIs
│   ├── subscriptions/   # Subscription APIs
│   └── referrals/       # Referral APIs
components/
├── home/                # Homepage sections
├── products/            # Product display components
├── ui/                  # Shared UI primitives
lib/
├── services/            # Auth, mail, and domain services
├── utils/               # Validation, cookies, rate limiting
├── jwt.ts               # Token signing and verification
└── prisma.ts            # Prisma client
prisma/
└── schema.prisma        # Relational schema
```

---

## Current product roadmap links

Open GitHub issues currently track the next platform moves:

- Authentication migration planning
- Supabase/Postgres migration work
- Customer and supplier dashboard views
- Mobile application development
- Wider marketplace / Pola model direction

---

## Deployment

The production build currently runs:

```bash
npm run build
npm run start
```

`npm run build` generates Prisma client code, initializes upload directories, and runs the Next.js build.

---

## Contributing

1. Create a feature branch.
2. Keep changes small and reviewable.
3. Run the relevant checks locally.
4. Open a pull request with a clear summary and test notes.

---

Built in Sri Lanka.