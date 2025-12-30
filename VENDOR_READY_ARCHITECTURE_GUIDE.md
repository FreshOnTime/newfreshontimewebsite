# Vendor-Ready Architecture Implementation Guide

## Overview

This guide provides technical implementation details for building a standard e-commerce store that's architecturally prepared for future multi-vendor expansion. This approach allows you to launch quickly while minimizing refactoring work when transitioning to a multi-vendor marketplace.

---

## Design Principles

### 1. Modular Ownership
Design data models to support optional vendor ownership from day one.

### 2. Flexible Permissions
Build role-based access control that can extend to vendors without major changes.

### 3. Separable Operations
Ensure order processing, payments, and fulfillment logic can be split by vendor in the future.

### 4. Scalable APIs
Design API endpoints that work for both single-seller and multi-vendor scenarios.

---

## Database Schema Design

### Product Model Enhancement

**Current State** (`lib/models/Product.ts`):
```typescript
export interface IProduct extends Document {
  name: string;
  brand: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;  // Already exists!
  category: mongoose.Types.ObjectId;
  // ... other fields
}
```

**Phase 1 Enhancement** (Vendor-Ready):
```typescript
export interface IProduct extends Document {
  name: string;
  brand: mongoose.Types.ObjectId;
  supplier?: mongoose.Types.ObjectId;
  
  // New fields for vendor support
  vendorId?: mongoose.Types.ObjectId;      // null = platform-owned
  vendorSku?: string;                       // Vendor's internal SKU
  isVendorManaged: boolean;                 // false by default
  vendorCommissionRate?: number;            // % platform takes (null = N/A)
  
  // Existing fields...
  category: mongoose.Types.ObjectId;
  // ...
}
```

### Order Model Enhancement

**Recommended Structure**:
```typescript
export interface IOrder extends Document {
  orderNumber: string;
  customer: mongoose.Types.ObjectId;
  
  // Items with vendor context
  items: Array<{
    product: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
    vendorId?: mongoose.Types.ObjectId;  // Track which vendor owns each item
  }>;
  
  // Financial breakdown
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  
  // Vendor-aware splitting (null in Phase 1, populated in Phase 3)
  vendorSplits?: Array<{
    vendorId: mongoose.Types.ObjectId;
    items: mongoose.Types.ObjectId[];    // References to items above
    subtotal: number;
    commission: number;
    vendorPayout: number;
    payoutStatus: 'pending' | 'processed' | 'failed';
    payoutDate?: Date;
  }>;
  
  // Existing fields...
  status: string;
  createdAt: Date;
}
```

### User/Vendor Model

**Extend User Model**:
```typescript
export interface IUser extends Document {
  email: string;
  firstName: string;
  lastName: string;
  
  // Role system (already exists)
  roles: string[];  // ['customer'], ['admin'], or ['vendor']
  
  // Vendor-specific fields (null for non-vendors)
  vendorProfile?: {
    businessName: string;
    businessEmail: string;
    businessPhone: string;
    taxId?: string;
    commissionRate: number;        // Default platform commission
    payoutMethod: 'bank' | 'paypal' | 'stripe';
    payoutDetails: {
      accountNumber?: string;
      routingNumber?: string;
      paypalEmail?: string;
      stripeAccountId?: string;
    };
    isApproved: boolean;
    approvedAt?: Date;
    approvedBy?: mongoose.Types.ObjectId;
  };
  
  // Existing fields...
}
```

---

## Service Layer Architecture

### Product Service

**Design Pattern**: Single service that handles both admin and vendor products.

```typescript
// lib/services/productService.ts

export class ProductService {
  /**
   * Create product - works for both admin and vendor
   * @param data Product data
   * @param createdBy User ID (admin or vendor)
   */
  async createProduct(data: CreateProductDTO, createdBy: string) {
    const user = await User.findById(createdBy);
    
    const productData = {
      ...data,
      createdBy,
      updatedBy: createdBy,
      // Set vendor ownership if user is a vendor
      vendorId: user.roles.includes('vendor') ? createdBy : null,
      isVendorManaged: user.roles.includes('vendor'),
    };
    
    return await Product.create(productData);
  }

  /**
   * Get products - filtered by vendor if applicable
   * @param filters Query filters
   * @param userId Current user ID
   */
  async getProducts(filters: ProductFilters, userId?: string) {
    const query: any = { isDeleted: false };
    
    // If user is a vendor, only show their products
    const user = userId ? await User.findById(userId) : null;
    if (user?.roles.includes('vendor')) {
      query.vendorId = userId;
    }
    
    // Apply other filters
    if (filters.category) query.category = filters.category;
    if (filters.brand) query.brand = filters.brand;
    
    return await Product.find(query).populate('category brand');
  }

  /**
   * Update product - with ownership check
   */
  async updateProduct(productId: string, data: UpdateProductDTO, userId: string) {
    const product = await Product.findById(productId);
    if (!product) throw new Error('Product not found');
    
    const user = await User.findById(userId);
    
    // Check permissions
    if (user.roles.includes('vendor')) {
      // Vendors can only update their own products
      if (product.vendorId?.toString() !== userId) {
        throw new Error('Unauthorized');
      }
    }
    // Admins can update any product
    
    return await Product.findByIdAndUpdate(
      productId,
      { ...data, updatedBy: userId },
      { new: true }
    );
  }
}
```

### Order Service

**Design Pattern**: Prepare for vendor split calculation.

```typescript
// lib/services/orderService.ts

export class OrderService {
  /**
   * Create order - calculates vendor splits internally
   */
  async createOrder(data: CreateOrderDTO, customerId: string) {
    // Get product details with vendor info
    const itemsWithVendors = await this.enrichItemsWithVendorInfo(data.items);
    
    // Calculate totals
    const subtotal = this.calculateSubtotal(itemsWithVendors);
    const tax = this.calculateTax(subtotal);
    const shipping = this.calculateShipping(itemsWithVendors);
    const total = subtotal + tax + shipping;
    
    // Calculate vendor splits (for future use)
    const vendorSplits = this.calculateVendorSplits(itemsWithVendors);
    
    const order = await Order.create({
      orderNumber: this.generateOrderNumber(),
      customer: customerId,
      items: itemsWithVendors,
      subtotal,
      tax,
      shipping,
      total,
      vendorSplits: vendorSplits.length > 0 ? vendorSplits : null,
      status: 'pending',
    });
    
    // In Phase 3, this would also create vendor notifications
    return order;
  }

  /**
   * Calculate vendor splits - returns empty array in Phase 1
   */
  private calculateVendorSplits(items: EnrichedOrderItem[]) {
    const vendorGroups = this.groupItemsByVendor(items);
    
    return vendorGroups.map(group => {
      const subtotal = group.items.reduce((sum, item) => 
        sum + (item.price * item.quantity), 0
      );
      
      const commissionRate = group.vendor?.commissionRate || 0.15; // 15% default
      const commission = subtotal * commissionRate;
      const vendorPayout = subtotal - commission;
      
      return {
        vendorId: group.vendorId,
        items: group.items.map(i => i._id),
        subtotal,
        commission,
        vendorPayout,
        payoutStatus: 'pending' as const,
      };
    });
  }

  private groupItemsByVendor(items: EnrichedOrderItem[]) {
    const groups: Map<string, any> = new Map();
    
    for (const item of items) {
      const vendorId = item.vendorId?.toString() || 'platform';
      
      if (!groups.has(vendorId)) {
        groups.set(vendorId, {
          vendorId: item.vendorId,
          vendor: item.vendor,
          items: [],
        });
      }
      
      groups.get(vendorId).items.push(item);
    }
    
    return Array.from(groups.values());
  }
}
```

---

## API Route Structure

### Product Endpoints

**Design Pattern**: Unified endpoints with role-based behavior.

```typescript
// app/api/products/route.ts

import { requireAuth } from '@/lib/middleware/authNew';
import { ProductService } from '@/lib/services/productService';

const productService = new ProductService();

export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  const { searchParams } = new URL(req.url);
  
  const filters = {
    category: searchParams.get('category') || undefined,
    brand: searchParams.get('brand') || undefined,
    search: searchParams.get('search') || undefined,
  };
  
  // Service automatically filters by vendor if user is a vendor
  const products = await productService.getProducts(
    filters,
    req.user.id
  );
  
  return NextResponse.json({ products });
});

export const POST = requireAuth(async (req: AuthenticatedRequest) => {
  // Both admins and vendors can create products
  if (!req.user.roles.includes('admin') && !req.user.roles.includes('vendor')) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 403 }
    );
  }
  
  const data = await req.json();
  
  // Service handles vendor assignment automatically
  const product = await productService.createProduct(data, req.user.id);
  
  return NextResponse.json({ product }, { status: 201 });
});
```

### Dashboard Endpoints

**Design Pattern**: Role-aware analytics.

```typescript
// app/api/dashboard/sales/route.ts

export const GET = requireAuth(async (req: AuthenticatedRequest) => {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  
  let query: any = {
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    },
  };
  
  // Vendors only see their own sales
  if (req.user.roles.includes('vendor')) {
    query['vendorSplits.vendorId'] = req.user.id;
  }
  
  const orders = await Order.find(query);
  
  // Calculate metrics based on role
  const metrics = req.user.roles.includes('vendor')
    ? calculateVendorMetrics(orders, req.user.id)
    : calculatePlatformMetrics(orders);
  
  return NextResponse.json({ metrics });
});
```

---

## Frontend Component Structure

### Product Management Dashboard

**Design Pattern**: Shared components with role-based features.

```typescript
// app/admin/products/page.tsx

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { ProductTable } from '@/components/products/ProductTable';
import { CreateProductButton } from '@/components/products/CreateProductButton';

export default function ProductsPage() {
  const { user } = useAuth();
  const isVendor = user?.roles.includes('vendor');
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {isVendor ? 'My Products' : 'All Products'}
        </h1>
        <CreateProductButton />
      </div>
      
      {/* Table automatically filters based on user role via API */}
      <ProductTable />
      
      {/* Vendors see limited features */}
      {!isVendor && (
        <div className="mt-6">
          <h2>Vendor Performance</h2>
          {/* Admin-only vendor analytics */}
        </div>
      )}
    </div>
  );
}
```

---

## Migration Strategy

### Phase 1: Standard E-Commerce (Current)
```javascript
// Products are all platform-owned
{
  vendorId: null,
  isVendorManaged: false
}
```

### Phase 2: Vendor Onboarding
```javascript
// Add vendor role to select users
db.users.updateMany(
  { _id: { $in: selectedVendorIds } },
  { $set: { roles: ['vendor'] } }
);

// Assign existing products to vendors
db.products.updateMany(
  { supplier: vendorSupplierId },
  { $set: { 
    vendorId: vendorId,
    isVendorManaged: true 
  }}
);
```

### Phase 3: Full Multi-Vendor
```javascript
// Enable vendor portals via feature flags
// All new products get vendor assignment automatically
// Order splits calculate automatically based on vendorId
```

---

## Testing Strategy

### Unit Tests

```typescript
// __tests__/services/productService.test.ts

describe('ProductService', () => {
  describe('createProduct', () => {
    it('should create platform product for admin', async () => {
      const admin = await createTestUser({ roles: ['admin'] });
      const product = await productService.createProduct(
        productData,
        admin._id
      );
      
      expect(product.vendorId).toBeNull();
      expect(product.isVendorManaged).toBe(false);
    });
    
    it('should create vendor product for vendor', async () => {
      const vendor = await createTestUser({ roles: ['vendor'] });
      const product = await productService.createProduct(
        productData,
        vendor._id
      );
      
      expect(product.vendorId.toString()).toBe(vendor._id.toString());
      expect(product.isVendorManaged).toBe(true);
    });
  });
  
  describe('getProducts', () => {
    it('should return all products for admin', async () => {
      const admin = await createTestUser({ roles: ['admin'] });
      const products = await productService.getProducts({}, admin._id);
      
      expect(products.length).toBeGreaterThan(0);
    });
    
    it('should return only vendor products for vendor', async () => {
      const vendor = await createTestUser({ roles: ['vendor'] });
      const products = await productService.getProducts({}, vendor._id);
      
      expect(products.every(p => 
        p.vendorId?.toString() === vendor._id.toString()
      )).toBe(true);
    });
  });
});
```

---

## Configuration Management

### Environment Variables

```bash
# .env.local

# Multi-vendor feature flags
ENABLE_VENDOR_REGISTRATION=false     # Phase 1: false, Phase 3: true
ENABLE_VENDOR_PAYOUTS=false          # Phase 1: false, Phase 3: true
DEFAULT_COMMISSION_RATE=0.15         # 15% platform fee

# Vendor limits (for Phase 3)
MAX_PRODUCTS_PER_VENDOR=1000
VENDOR_APPROVAL_REQUIRED=true
```

### Feature Flags

```typescript
// lib/config/features.ts

export const FEATURES = {
  multiVendor: {
    enabled: process.env.ENABLE_VENDOR_REGISTRATION === 'true',
    vendorRegistration: process.env.ENABLE_VENDOR_REGISTRATION === 'true',
    vendorPayouts: process.env.ENABLE_VENDOR_PAYOUTS === 'true',
    splitPayments: process.env.ENABLE_VENDOR_PAYOUTS === 'true',
  },
};

// Usage in code
if (FEATURES.multiVendor.vendorRegistration) {
  // Show vendor registration option
}
```

---

## Summary

This architecture allows you to:

1. **Launch quickly** with standard e-commerce (all features work without vendors)
2. **Scale gradually** by enabling vendor features via config flags
3. **Minimize refactoring** when transitioning to multi-vendor
4. **Test incrementally** with selected vendors before full rollout

The key insight is that **every product can optionally have a vendor**, but when `vendorId` is `null`, the platform owns and manages it. This single design pattern supports both operational modes without major code changes.

---

## Next Steps

1. **Review** this architecture with the team
2. **Implement** Phase 1 enhancements to Product and Order models
3. **Create** role-based service layer
4. **Test** with mock vendor accounts
5. **Document** vendor onboarding process for Phase 3
6. **Plan** payment integration strategy

