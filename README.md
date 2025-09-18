# Fresh Pick - Full Stack Next.js Application

A complete e-commerce application built with Next.js, MongoDB, and JWT authentication.

## 🚀 Features

- **Full Stack Architecture**: Single Next.js application with API routes
- **MongoDB Integration**: Using Mongoose for data modeling and validation
- **JWT Authentication**: Secure authentication with access and refresh tokens
- **Role-based Authorization**: Support for multiple user roles (admin, customer, etc.)
- **Cookie-based Security**: HTTP-only, secure cookies for token storage
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: Comprehensive validation using Zod
- **Product Management**: Full CRUD operations for products, categories, and brands
- **User Management**: Registration, login, profile management
- **Shopping Cart**: Bag/cart functionality
- **Responsive Design**: Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: JWT, bcryptjs, HTTP-only cookies
- **Validation**: Zod
- **Styling**: Tailwind CSS, shadcn/ui components
- **Rate Limiting**: rate-limiter-flexible
- **Development**: ESLint, TypeScript

## 📋 Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account or local MongoDB installation
- Git

## ⚙️ Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=30d

# API Configuration
NEXT_PUBLIC_API_BASE=/api
NODE_ENV=development

# Azure Storage (for file uploads)
AZURE_STORAGE_ACCOUNT_NAME=your_azure_storage_account
AZURE_STORAGE_ACCOUNT_KEY=your_azure_storage_key
AZURE_STORAGE_CONTAINER_NAME=your_container_name

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd newfreshpick.lk/fot-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## � Email testing

Set the SendGrid env vars (`SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL`, `FRONTEND_URL`) before testing email flows.

During development you can trigger a test email using:

PowerShell (session-only):
```powershell
$env:SENDGRID_API_KEY = 'SG.<your-key>'
$env:SENDGRID_FROM_EMAIL = 'freshpicksllk@gmail.com'
$env:FRONTEND_URL = 'http://localhost:3000'
npm run dev
# Then POST to the test endpoint
Invoke-RestMethod -Uri http://localhost:3000/api/dev/send-test-email -Method POST -Body (@{ to = 'you@domain.com' } | ConvertTo-Json) -ContentType 'application/json' -Headers @{ 'x-dev-email-secret' = $env:DEV_EMAIL_SECRET }
```

Or use the built-in flows:
- Signup sends a verification email
- Use `/auth/forgot` page to request a password reset
- Password reset link uses `/auth/reset-password?token=...`


## �📝 Available Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run tests with Jest
- `npm run test:watch` - Run tests in watch mode
- `npm run test:smoke` - Run smoke tests

## 🔐 Authentication API

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phoneNumber": "+1234567890",
  "password": "SecurePass123",
  "registrationAddress": {
    "addressLine1": "123 Main St",
    "city": "Colombo",
    "province": "Western",
    "postalCode": "10100",
    "country": "Sri Lanka"
  }
}
```

### Login
```bash
POST /api/auth/signin
Content-Type: application/json

{
  "identifier": "john@example.com", // or phone number
  "password": "SecurePass123"
}
```

### Get Current User
```bash
GET /api/auth/me
# Requires authentication cookie
```

### Refresh Token
```bash
POST /api/auth/refresh
# Uses refresh token from cookie
```

### Logout
```bash
POST /api/auth/logout
# Clears authentication cookies
```

## 🛡️ Security Features

- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Tokens**: Short-lived access tokens (15m) and long-lived refresh tokens (30d)
- **Secure Cookies**: HTTP-only, Secure, SameSite=lax
- **Rate Limiting**: 5 attempts per 15 minutes for auth endpoints
- **Input Validation**: Comprehensive validation for all inputs
- **Role-based Access**: Middleware for protecting admin routes
- **Token Revocation**: Refresh tokens stored hashed in database for revocation

## 🔧 Development

### Adding Protected Routes
```typescript
import { requireRoles, AuthenticatedRequest } from '@/lib/middleware/authNew';

async function handleProtectedRoute(req: AuthenticatedRequest) {
  // Route logic here
  // req.user contains authenticated user data
}

export const POST = requireRoles(['admin', 'manager'])(handleProtectedRoute);
```

## 🧪 Testing API Endpoints

### Using curl

**Signup:**
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phoneNumber": "+1234567890",
    "password": "TestPass123",
    "registrationAddress": {
      "addressLine1": "123 Test St",
      "city": "Colombo",
      "province": "Western",
      "postalCode": "10100",
      "country": "Sri Lanka"
    }
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "identifier": "test@example.com",
    "password": "TestPass123"
  }'
```

## 🔄 Migration Notes

This application has been migrated from Firebase Authentication to JWT-based authentication with MongoDB:

- **Old**: Firebase Auth with separate Express backend
- **New**: JWT tokens with HTTP-only cookies in unified Next.js app
- **Benefits**: Better control, no third-party auth dependencies, custom user fields

### Key Route Changes
- `POST /api/users/register` → `POST /api/auth/signup`
- Firebase token verification → JWT cookie verification
- All business logic now in Next.js API routes

## 🚢 Deployment

### Environment Setup
Ensure all environment variables are set in your deployment platform:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secure random string (minimum 32 characters)
- Other optional variables as needed

### Deploying to Netlify

This repo includes a `netlify.toml` and uses the official Next.js Runtime.

Basic settings (Netlify UI → New site from Git):
- Build command: `npm run build`
- Publish directory: `.next`
- Node version: `20`

Environment variables (Site settings → Environment):
- Required: `MONGODB_URI`, `JWT_SECRET`
- Recommended: `AZURE_STORAGE_CONNECTION_STRING` (for uploads), `OPENAI_API_KEY` (if AI features),
  `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`,
  `FRONTEND_URL` (your full site URL), `NEXT_PUBLIC_SITE_URL` (public site URL)
- Optional: `NEXT_PUBLIC_API_URL` (force a specific base URL)

Notes:
- The Next.js runtime/plugin is configured via `netlify.toml` and `@netlify/plugin-nextjs` in devDependencies.
- API routes and middleware run as serverless functions; ensure `MONGODB_URI` points to a production MongoDB (e.g., Atlas).
- If you used older Azure env vars, switch to `AZURE_STORAGE_CONNECTION_STRING` (matches `lib/storage/azureStorage.ts`).

Optional CLI deploy (PowerShell):
```powershell
npm install -g netlify-cli
netlify login
netlify init
netlify env:set NODE_VERSION 20
# Set the rest of your env vars with netlify env:set KEY VALUE
netlify deploy --prod --build
```

## 📄 License

This project is licensed under the MIT License.
