# 🥬 Fresh Pick - Premium Grocery Delivery Platform

**Pick Fresh, Live Easy** — Sri Lanka's premium online grocery delivery service with subscriptions, B2B supply, and diaspora gifting.

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green)](https://mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://typescriptlang.org/)

---

## 🎯 The Problem We Solve

Getting fresh, quality groceries in Sri Lanka is inconvenient and unreliable. We're building the modern infrastructure for food commerce.

## 💡 Our Unique Approach

| Market Segment | Description | Status |
|----------------|-------------|--------|
| **B2C Subscriptions** | Weekly/monthly grocery boxes for families | ✅ Live |


---

## 🚀 Platform Features

### Customer Acquisition
- ✅ **Referral System** — Rs. 200 reward per successful referral
- ✅ **First Order Discount** — Popup with newsletter signup
- ✅ **Social Proof** — Live order counter, "X just purchased" notifications

### Shopping Experience
- ✅ **Curated Bags** — Pre-built grocery bundles
- ✅ **Subscriptions** — Weekly, bi-weekly, monthly plans
- ✅ **Quick Reorder** — One-click repeat from previous orders
- ✅ **Smart Search** — Autocomplete with recent searches
- ✅ **Wishlist** — Save items for later

### Reviews & Trust
- ✅ **Product Reviews** — Star ratings with verified purchase badges
- ✅ **Low Stock Alerts** — "Only 3 left!" urgency indicators
- ✅ **Trust Badges** — Freshness guarantee, secure checkout

### Technical Excellence
- ✅ **PWA Support** — Offline-ready, installable
- ✅ **SEO Optimized** — Schema markup, sitemaps
- ✅ **Mobile-First** — Responsive design with bottom navigation

---

## 🛠️ Tech Stack

```
Frontend:     Next.js 15, React 18, TypeScript, Tailwind CSS
Backend:      Next.js API Routes, MongoDB, Mongoose
Auth:         JWT with HTTP-only cookies, role-based access
Payments:     Integration-ready (Stripe/PayHere)
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
git clone <repo-url>
cd newfreshontimewebsite
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ⚙️ Environment Variables

```bash
# Database
MONGODB_URI=mongodb+srv://...

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

Google accounts are linked using their immutable Google provider ID. A verified Google email that already belongs to a password account will use that same Fresh Pick account; new Google users are created without a phone number and can add it before delivery.

---

## 🏗️ Architecture

```
app/
├── api/           # API routes
│   ├── auth/      # Authentication
│   ├── products/  # Product CRUD
│   ├── bags/      # Shopping bags & reorder
│   ├── reviews/   # Product reviews
│   ├── referrals/ # Referral system
│   └── subscriptions/
├── (pages)/       # Frontend routes
components/
├── home/          # Homepage sections
├── products/      # Product cards, ratings
├── subscriptions/ # Subscription cards
└── layout/        # Navbar, Footer
lib/
├── models/        # Mongoose schemas
├── auth.ts        # JWT verification
└── database.ts    # MongoDB connection
```

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
