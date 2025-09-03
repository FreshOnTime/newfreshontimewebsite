# Fresh Pick Admin Dashboard

A comprehensive admin dashboard for managing Fresh Pick operations, built with Next.js, MongoDB, and JWT authentication.

## Features

- 🔐 **Admin Authentication**: JWT-based authentication with role-based access control
- 👥 **Customer Management**: Complete CRUD operations for customer data
- 🏢 **Supplier Management**: Manage supplier relationships and information
- 📦 **Product Management**: Full product catalog with inventory tracking
- 🏷️ **Category Management**: Hierarchical category system
- 📊 **Order Management**: Track and manage customer orders
- 📈 **Analytics Dashboard**: Real-time insights and reporting
- 🗃️ **Audit Logging**: Track all admin actions for compliance
- 🔒 **Security**: Rate limiting, CSRF protection, and input validation

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **UI**: TailwindCSS, shadcn/ui components
- **Backend**: Next.js API Routes, MongoDB with Mongoose
- **Authentication**: JWT with HTTP-only cookies
- **Charts**: Recharts
- **Tables**: TanStack Table v8
- **Forms**: React Hook Form with Zod validation
- **File Uploads**: Signed URLs (S3/Cloudinary ready)

## Prerequisites

- Node.js 18+ 
- MongoDB database
- Environment variables configured (see below)

## Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/freshpick
# or MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/freshpick

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Frontend URL (for CSRF protection)
FRONTEND_URL=http://localhost:3000

# Dev Features (set to 'true' to enable seeding in development)
DEV_SEED_ENABLED=true

# File Upload (optional - for signed URLs)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Or Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Set up your environment variables** (see above)

3. **Start the development server:**
```bash
npm run dev
```

4. **Create an admin user** (you'll need to do this manually in your database or create a seeder):

```javascript
// In MongoDB or using a script
{
  "firstName": "Admin",
  "lastName": "User", 
  "email": "admin@freshpick.com",
  "passwordHash": "<bcrypt-hashed-password>",
  "role": "admin",
  "phoneNumber": "+1234567890",
  "createdAt": new Date()
}
```

## Admin Dashboard Access

Once your admin user is created:

1. Navigate to `/admin` 
2. You'll be redirected to login if not authenticated
3. Login with your admin credentials
4. Access the full admin dashboard

## API Endpoints

### Authentication
All admin API routes are prefixed with `/api/admin/` and require admin authentication.

### Customers
- `GET /api/admin/customers` - List customers with pagination/search
- `POST /api/admin/customers` - Create new customer
- `GET /api/admin/customers/[id]` - Get customer details
- `PUT /api/admin/customers/[id]` - Update customer
- `DELETE /api/admin/customers/[id]` - Delete customer

### Analytics
- `GET /api/admin/analytics/overview` - Dashboard overview stats

### Example API Usage

```bash
# Get customers (with authentication cookie)
curl -X GET "http://localhost:3000/api/admin/customers?page=1&limit=10&search=john" \
  -H "Cookie: auth-token=your-jwt-token"

# Create a customer
curl -X POST "http://localhost:3000/api/admin/customers" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth-token=your-jwt-token" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zipCode": "10001",
      "country": "USA"
    }
  }'
```

## Database Models

### Customer
```typescript
{
  name: string;
  email: string; // unique
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  createdAt: Date;
}
```

### Supplier  
```typescript
{
  name: string;
  contactName: string;
  email: string; // unique
  phone: string;
  address: AddressSchema;
  paymentTerms: 'net-15' | 'net-30' | 'net-60' | 'net-90' | 'cod' | 'prepaid';
  status: 'active' | 'inactive';
  createdAt: Date;
}
```

### Product
```typescript
{
  name: string;
  sku: string; // unique
  slug: string; // unique  
  description?: string;
  price: number;
  costPrice: number;
  categoryId: ObjectId;
  supplierId: ObjectId;
  stockQty: number;
  minStockLevel: number;
  images: string[];
  tags: string[];
  attributes: Record<string, unknown>;
  archived: boolean;
  createdAt: Date;
}
```

## Security Features

- **JWT Authentication**: Secure token-based auth with HTTP-only cookies
- **Role-Based Access**: Only admin users can access admin routes
- **Rate Limiting**: Prevent abuse of API endpoints
- **Input Validation**: Zod schemas for all API inputs
- **Audit Logging**: Track all admin actions with user, timestamp, and IP
- **CSRF Protection**: Origin validation for state-changing operations

## Performance Optimizations

- **Server-side Pagination**: Never load all records at once
- **Database Indexes**: Optimized queries for common operations
- **Lazy Loading**: Components load as needed
- **Optimistic Updates**: UI updates immediately for better UX

## Development

### Adding New Resources

1. **Create the Mongoose model** in `lib/models/`
2. **Add API routes** in `app/api/admin/[resource]/`
3. **Create admin pages** in `app/admin/[resource]/`
4. **Add to navigation** in `components/admin/AdminSidebar.tsx`

### Testing APIs

Use the provided Postman collection or curl commands. Make sure to:
1. Login first to get the auth cookie
2. Include the cookie in subsequent requests
3. Use proper Content-Type headers for JSON requests

## Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Deploy to your hosting platform** (Vercel, AWS, etc.)

3. **Set environment variables** in your hosting platform

4. **Ensure MongoDB is accessible** from your deployment environment

## Contributing

1. Follow TypeScript and ESLint conventions
2. Add proper error handling for all API routes  
3. Include audit logging for state-changing operations
4. Write descriptive commit messages
5. Test thoroughly before submitting PRs

## License

Private - Fresh Pick Internal Use Only
