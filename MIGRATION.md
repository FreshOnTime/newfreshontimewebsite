# FreshPick Backend Migration to Next.js

This document outlines the migration process from the standalone Express.js backend to Next.js API routes within the same repository.

## Migration Overview

### What Was Migrated

✅ **Completed (Phase 1 - ~50% of endpoints)**
- User registration and user existence check endpoints
- Product CRUD operations (GET, POST, PUT, DELETE)
- Database models (User, Product, Brand, ProductCategory, Permission, Role)
- Authentication middleware with Firebase Admin
- Error handling utilities
- API response utilities
- Database connection singleton for serverless
- Basic testing setup with Jest
- CI/CD pipeline with GitHub Actions

⏳ **In Progress/Pending (Phase 2)**
- File upload endpoints (storage routes)
- AI enhancement endpoints
- Brand and category CRUD operations
- Role and permission management
- Rate limiting implementation
- Complete test coverage

### Architecture Changes

**Before:**
```
Express Server (Port 8000)
├── Routes
├── Controllers
├── Services
├── Models (Mongoose)
├── Middleware
└── Utils
```

**After:**
```
Next.js App
├── app/api/
│   ├── users/
│   ├── products/
│   ├── brands/
│   ├── categories/
│   └── ...
├── lib/
│   ├── models/
│   ├── services/
│   ├── middleware/
│   ├── utils/
│   └── db.ts (singleton)
```

## Database Configuration

### Connection Pooling
The app uses a singleton pattern for MongoDB connections to prevent connection storms in serverless environments:

```typescript
// lib/db.ts
- Maintains single connection across function invocations
- Optimized settings for Vercel's serverless functions
- Connection caching using global variables
```

### Recommended Production Setup
- **Development**: Direct MongoDB connection
- **Production**: MongoDB Atlas with connection pooling
- **Alternative**: PlanetScale or similar serverless-friendly databases

## File Upload Strategy

### Current Implementation
- Express used `multer` for multipart form handling
- Azure Blob Storage for file storage

### Migration Strategy
1. **Phase 1**: Implement direct client-to-S3 signed URLs
2. **Phase 2**: Fallback API route for file streaming (disabled bodyParser)

```typescript
// For routes that handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
}
```

## Authentication & Authorization

### Firebase Admin Integration
- Migrated from Express middleware to Next.js helper functions
- Token verification maintained for all protected routes
- Role-based access control preserved

### Usage Example
```typescript
// In API route
import { checkUserRoles } from '@/lib/middleware/auth';

export async function POST(req: NextRequest) {
  const checkAuth = checkUserRoles(['admin', 'inventory_manager']);
  await checkAuth(req); // Throws error if unauthorized
  
  // Protected logic here
}
```

## Rate Limiting

### Development
- Simple in-memory rate limiting for development
- Location: `lib/middleware/rateLimiter.ts`

### Production Recommendations
- **Option 1**: Upstash Redis for serverless rate limiting
- **Option 2**: Vercel Edge Functions with KV storage
- **Option 3**: External service like Redis Cloud

## Testing

### Setup
- Jest with TypeScript support
- Separate test environment configuration
- MongoDB test database
- Mocked external dependencies

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:smoke    # Run smoke tests (production)
```

### Test Structure
```
__tests__/
├── api/
│   ├── users/
│   ├── products/
│   └── ...
└── smoke/
    └── api.smoke.test.ts
```

## Deployment

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your values

# 3. Start development server
npm run dev
```

### Environment Variables
```env
# Required for all environments
MONGODB_URI=your_mongodb_connection_string
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key

# Optional for development
AZURE_STORAGE_ACCOUNT_NAME=your_azure_storage_account
AZURE_STORAGE_ACCOUNT_KEY=your_azure_storage_key
OPENAI_API_KEY=your_openai_api_key
```

### Vercel Deployment

#### Prerequisites
1. Vercel account with Hobby plan
2. Environment variables configured in Vercel dashboard
3. MongoDB Atlas database (or compatible)

#### Deployment Steps
1. Connect repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### GitHub Actions CI/CD
- Automated testing on PRs
- Preview deployments for PRs
- Production deployment on main branch merge
- Smoke tests after production deployment

## API Endpoints Status

### ✅ Migrated
- `POST /api/users/register` - User registration
- `GET /api/users/exists/:userId` - Check user existence
- `GET /api/products` - Get all products (with filtering)
- `POST /api/products` - Create product
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Soft delete product
- `DELETE /api/products/:id/permanent` - Permanent delete product

### ⏳ Pending Migration
- `POST /api/storage/upload/images/products` - Upload product images
- `POST /api/storage/upload/images/banners` - Upload banner images
- `DELETE /api/storage/images/products/:path` - Delete product images
- `DELETE /api/storage/images/banners/:path` - Delete banner images
- `POST /api/ai/enhance-product` - AI product enhancement
- All brand endpoints (`/api/brands/*`)
- All category endpoints (`/api/categories/*`)
- All role endpoints (`/api/roles/*`)
- All permission endpoints (`/api/permissions/*`)

## Migration Challenges & Solutions

### 1. Database Connections
**Challenge**: Express maintains persistent connection; serverless needs connection per request
**Solution**: Singleton pattern with connection caching

### 2. File Uploads
**Challenge**: `multer` middleware not available in Next.js
**Solution**: Custom multipart parser or direct S3 uploads

### 3. Middleware Chain
**Challenge**: Express middleware stack vs Next.js function-based approach
**Solution**: Helper functions that can be called within route handlers

### 4. Error Handling
**Challenge**: Global Express error handler vs per-route handling
**Solution**: Standardized error response utilities and try-catch patterns

## Performance Considerations

### Serverless Optimizations
- Connection pooling for database
- Code splitting for reduced bundle size
- Proper error handling to prevent cold start penalties
- Environment variable caching

### Monitoring Recommendations
- Vercel Analytics for performance monitoring
- MongoDB monitoring for database performance
- Error tracking (Sentry recommended)

## Security Considerations

### Maintained Security Features
- Firebase Authentication token verification
- Role-based access control
- Input validation with Mongoose schemas
- CORS handling (built into Next.js)

### Additional Recommendations
- Rate limiting in production
- Request validation middleware
- Audit logging for sensitive operations

## Next Steps

### Phase 2 Migration (Week 2)
1. Migrate file upload endpoints
2. Implement AI enhancement endpoint
3. Migrate brand and category CRUD operations
4. Migrate role and permission management
5. Implement production-ready rate limiting
6. Complete test coverage (aim for >80%)

### Production Readiness Checklist
- [ ] All endpoints migrated and tested
- [ ] Environment variables configured in Vercel
- [ ] Production database set up (MongoDB Atlas)
- [ ] Rate limiting implemented
- [ ] Error monitoring set up
- [ ] Backup strategy for database
- [ ] Performance monitoring enabled

### Monitoring & Maintenance
- Set up alerts for API errors
- Monitor database performance
- Regular security updates
- Performance optimization based on usage patterns

## Support & Troubleshooting

### Common Issues
1. **Cold Start Delays**: Normal for serverless; monitor and optimize
2. **Database Connection Errors**: Check connection string and network access
3. **Authentication Failures**: Verify Firebase credentials and token format

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linter
npm run test:smoke   # Run smoke tests
```

## Architecture Decisions

### Why Next.js API Routes?
- Unified codebase (frontend + backend)
- Automatic serverless deployment on Vercel
- Better DX with TypeScript integration
- Built-in optimizations for serverless

### Database Choice
- Kept MongoDB for compatibility
- Mongoose for familiar schema validation
- Singleton connection pattern for serverless

### Authentication Strategy
- Maintained Firebase Admin for consistency
- Role-based access control preserved
- Token-based authentication continues

This migration provides a solid foundation for the unified FreshPick application while maintaining all existing functionality and improving deployment and development experience.
