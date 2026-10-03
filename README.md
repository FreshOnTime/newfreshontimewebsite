# 🥬 Fresh Pick - Premium Grocery Delivery Platform

**Pick Fresh, Live Easy** — Sri Lanka's premium online grocery delivery service with subscriptions, B2B supply, and diaspora gifting.

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Prisma-green)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)

The current implementation and launch gaps are tracked in [platform readiness](docs/PLATFORM_READINESS.md). See [category-first shopping and producer content](docs/CATEGORY_FIRST_MARKET.md), [account design and flow fixes](docs/ACCOUNT_DESIGN_AND_FLOW_FIXES.md) and [public discovery improvements](docs/DISCOVERY_IMPROVEMENTS.md) for the latest verified changes.

Customer and producer questions are saved in the [admin enquiry inbox](docs/ENQUIRY_INBOX.md). Apply `npm run db:migrate` before deploying this feature; the `20261003040000_contact_enquiries` migration creates its storage. Enquiries are managed under `/admin/enquiries`, with private notes and status tracking.

Checkout deployment requires `npm run db:migrate` before the updated app is promoted.
The `20261002090000_checkout_requests` migration stores retry receipts atomically
with order creation. Customer checkout uses cash on delivery; catalogue promotions
are applied on the server, and arbitrary order-level discounts are rejected.

---

## 🎯 The Problem We Solve

Getting fresh, quality groceries in Sri Lanka is inconvenient and unreliable. We're building the modern infrastructure for food commerce.

## 💡 Our Unique Approach

| Market Segment | Description | Status |
|----------------|-------------|--------|
| **B2C Subscriptions** | Weekly/monthly grocery boxes for families | Implemented; staging acceptance required |


---

## 🚀 Platform Features

Implemented application flows include:

- Grocery catalogue, categories, discounted prices, search and saved products.
- Shopping bags, quoted customer checkout, order history and reorder.
- Recurring baskets and subscription management.
- Password signup/sign-in, Google sign-in, password reset and supplier applications.
- Published recipes, collections and the journal, with page metadata and sitemaps.
- Responsive customer pages and separate customer, supplier and admin workspaces.

Production readiness is tracked in the linked document. These are repository capabilities, not a claim that every integration is configured or deployed.

---

## 🛠️ Tech Stack

```
Frontend:     Next.js 16, React 18, TypeScript, Tailwind CSS
Backend:      Next.js API Routes, PostgreSQL, Prisma
Auth:         JWT with HTTP-only cookies, role-based access
Payments:     Cash on delivery in customer checkout
Storage:      Azure Blob Storage
Analytics:    Google Analytics 4
```

---

## 📊 API Endpoints

### Core Commerce
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products with filters |
| GET | `/api/categories` | Category tree |
| POST | `/api/bags/reorder` | Quick reorder from past orders |
| GET/POST | `/api/reviews` | Product reviews & ratings |
| GET/POST | `/api/referrals` | Referral code management |
| GET/POST/PATCH | `/api/subscriptions` | Subscription management |

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/signup` | User registration |
| POST | `/api/auth/signin` | Login |
| POST | `/api/auth/google` | Google sign-in (Firebase ID token) |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/me` | Current user |

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/FreshOnTime/newfreshontimewebsite.git
cd newfreshontimewebsite
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Apply the PostgreSQL migrations
npm run db:migrate

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

```bash
# Database
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# Authentication
JWT_SECRET=your_32_char_secret_key
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# Firebase Admin (required for Google sign-in token verification)
FIREBASE_PROJECT_ID=fresh-on-time
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@fresh-on-time.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Storage (optional)
AZURE_STORAGE_CONNECTION_STRING=...

# Analytics (optional)
NEXT_PUBLIC_GA_ID=G-XXXXXXXX

# Email (optional)
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=hello@freshpick.lk
```

### Google sign-in setup

1. In the Firebase project used by the site, enable **Authentication → Sign-in method → Google**.
2. Add each deployed domain (and `localhost`) to **Authentication → Settings → Authorized domains**.
3. Add the Firebase Admin credentials above to the deployment environment. They are server-only; never expose them with a `NEXT_PUBLIC_` prefix.
4. Apply the Prisma migration before deployment: `npm run db:migrate`.

Firebase client settings read the `NEXT_PUBLIC_FIREBASE_*` variables in `.env.example`; the existing FreshPick project remains the default. Set the complete public client configuration when using another Firebase project, and rebuild the app after changing it.

Google accounts are linked using their immutable Google provider ID. A verified Google email that already belongs to a password account will use that same Fresh Pick account; new Google users are created without a phone number and can add it before delivery.

---

## 🏗️ Architecture

| Area | Location | Responsibility |
| --- | --- | --- |
| Customer and workspace pages | `app/` | Next.js routes and page metadata |
| Application API | `app/api/` | Authentication, catalogue, bags, orders and integrations |
| UI components | `components/` | Market pages, account forms, shared controls and workspaces |
| Client state | `contexts/` | Account session, selected bag and wishlist state |
| Business services | `lib/services/` | Account and operational services |
| Data access | `lib/prisma.ts`, `prisma/schema.prisma` | PostgreSQL client and data model |
| Schema changes | `prisma/migrations/` | Versioned database migrations |
| Scheduled operations | `netlify/functions/` | Deployed recurring operational functions |


---

## 🔒 Security

- Password hashing with bcrypt (12 rounds)
- JWT with short-lived access tokens (15m)
- HTTP-only secure cookies
- Rate limiting on auth endpoints
- Input validation with Zod
- Role-based access control

---

## 📱 Progressive Web App

Fresh Pick is installable on mobile devices:
- Offline product browsing
- Push notification ready
- Add to home screen prompt

---

## 🚢 Deployment

### Netlify (Recommended)
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --build
```

### Environment Setup
Set all required variables in your deployment platform's environment settings.

---

## 📄 License

MIT License — © 2024 Fresh Pick

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

**Built with ❤️ in Sri Lanka**
