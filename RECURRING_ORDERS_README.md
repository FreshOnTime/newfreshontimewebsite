# Recurring Orders CRUD Implementation

This implementation provides comprehensive CRUD operations for recurring orders that both users and administrators can perform. The system includes automated processing, flexible scheduling, and complete management capabilities.

## Features Overview

### User Capabilities
- **Create** recurring orders from existing orders
- **Read** their own recurring orders with filtering and pagination
- **Update** recurring order settings (schedules, addresses, notes)
- **Delete** recurring orders (ends schedule for users, actual deletion for admins)
- **Control** recurring orders (pause, resume, end)

### Admin Capabilities
- **Advanced filtering** and search across all recurring orders
- **Bulk operations** on multiple recurring orders
- **Full CRUD operations** with audit logging
- **Special actions** like force delivery, skip delivery, duplicate orders
- **Analytics and statistics** dashboard
- **Manual processing** trigger for recurring orders

## API Endpoints

### User Endpoints

#### Recurring Orders Collection
- `GET /api/orders/recurring` - List user's recurring orders
- `POST /api/orders/recurring` - Create new recurring order from existing order

**Query Parameters for GET:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `status` - Filter by schedule status (active, paused, ended)
- `sortBy` - Sort field (createdAt, nextDeliveryAt, updatedAt)
- `sortOrder` - Sort direction (asc, desc)

#### Individual Recurring Order
- `GET /api/orders/recurring/[id]` - Get single recurring order
- `PUT /api/orders/recurring/[id]` - Update recurring order
- `DELETE /api/orders/recurring/[id]` - End recurring order schedule
- `PATCH /api/orders/recurring/[id]` - Quick actions (pause, resume, end)

### Admin Endpoints

#### Admin Recurring Orders Collection
- `GET /api/admin/orders/recurring` - List all recurring orders with advanced filtering
- `POST /api/admin/orders/recurring` - Bulk actions on multiple orders

**Additional Query Parameters for Admin GET:**
- `customerId` - Filter by specific customer
- `orderStatus` - Filter by order status
- `search` - Search in order number, customer name, address, notes
- `dateFrom` - Filter orders created after this date
- `dateTo` - Filter orders created before this date

**Bulk Actions (POST):**
- `pause` - Pause multiple recurring orders
- `resume` - Resume multiple recurring orders
- `end` - End multiple recurring orders
- `delete` - Delete multiple recurring orders

#### Admin Individual Recurring Order
- `GET /api/admin/orders/recurring/[id]` - Get recurring order with related orders
- `PUT /api/admin/orders/recurring/[id]` - Comprehensive update of recurring order
- `DELETE /api/admin/orders/recurring/[id]` - Delete recurring order completely
- `PATCH /api/admin/orders/recurring/[id]` - Special admin actions

**Admin Special Actions (PATCH):**
- `pause` - Pause the recurring order
- `resume` - Resume the recurring order
- `end` - End the recurring order
- `force_next_delivery` - Set specific next delivery date
- `skip_next_delivery` - Skip the next scheduled delivery
- `duplicate` - Create a copy of the recurring order

#### Admin Statistics
- `GET /api/admin/orders/recurring/stats` - Get recurring order analytics

### System Endpoints

#### Automated Processing
- `GET /api/cron/recurring-orders` - Process due recurring orders (cron job)
- `POST /api/cron/recurring-orders` - Manual trigger for processing

## Data Models

### Recurring Order Fields
```typescript
{
  isRecurring: boolean;
  recurrence: {
    startDate?: Date;
    endDate?: Date;
    daysOfWeek?: number[]; // 0-6 (Sun-Sat)
    includeDates?: Date[];
    excludeDates?: Date[];
    selectedDates?: Date[];
    notes?: string;
  };
  nextDeliveryAt?: Date;
  scheduleStatus: 'active' | 'paused' | 'ended';
}
```

### Recurrence Patterns Supported
1. **Weekly Pattern**: Specify days of week (0=Sunday, 6=Saturday)
2. **Specific Dates**: Array of exact delivery dates
3. **Include Dates**: Specific dates to include in delivery schedule
4. **Exclude Dates**: Dates to skip in regular pattern
5. **Date Range**: Start and end dates for the recurring schedule

## Services and Utilities

### RecurringOrderService
- `calculateNextDelivery()` - Calculate next delivery date based on pattern
- `createNextOrderInstance()` - Create new order from recurring pattern
- `processRecurringOrders()` - Process all due recurring orders
- `validateRecurrencePattern()` - Validate recurring order configuration
- `getRecurringOrderStats()` - Get system-wide statistics

## Security and Permissions

### User Permissions
- Can only access their own recurring orders
- Can modify basic settings (schedule, address, notes)
- Cannot delete orders completely (only end scheduling)
- Cannot modify financial or status fields

### Admin Permissions
- Full access to all recurring orders
- Can perform any CRUD operation
- Can execute bulk actions
- Can force delivery dates and skip deliveries
- All actions are logged for audit trail

## Validation and Error Handling

### Input Validation
- All API endpoints use Zod schemas for validation
- Comprehensive error messages for invalid data
- Date validation for recurrence patterns
- Business logic validation (e.g., start date before end date)

### Error Responses
- Consistent error format across all endpoints
- Detailed validation errors when applicable
- Appropriate HTTP status codes
- Descriptive error messages

## Automated Processing

### Cron Job Integration
- Processes due recurring orders automatically
- Creates new order instances when deliveries are due
- Handles stock availability checks
- Updates next delivery dates
- Ends completed recurring schedules

### Stock Management
- Checks product availability before creating orders
- Reserves stock for confirmed orders
- Handles out-of-stock scenarios gracefully
- Restores stock when orders are cancelled

## Analytics and Reporting

### User Dashboard
- Order count by status
- Next delivery dates
- Order history and patterns
- Scheduling controls

### Admin Dashboard
- System-wide recurring order statistics
- Revenue metrics
- Customer engagement data
- Upcoming deliveries overview
- Performance metrics

## Usage Examples

### Creating a Recurring Order (User)
```javascript
POST /api/orders/recurring
{
  "sourceOrderId": "order_id_here",
  "recurrence": {
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "daysOfWeek": [1, 3, 5], // Monday, Wednesday, Friday
    "notes": "Weekly fresh produce delivery"
  },
  "nextDeliveryAt": "2024-01-01T10:00:00Z",
  "scheduleStatus": "active"
}
```

### Updating Recurring Order (User)
```javascript
PUT /api/orders/recurring/[id]
{
  "scheduleStatus": "paused",
  "recurrence": {
    "notes": "Temporarily paused - vacation"
  }
}
```

### Admin Bulk Actions
```javascript
POST /api/admin/orders/recurring
{
  "action": "pause",
  "orderIds": ["id1", "id2", "id3"]
}
```

### Quick Actions
```javascript
PATCH /api/orders/recurring/[id]
{
  "action": "pause"
}
```

## Environment Variables

Required environment variables:
- `CRON_SECRET_TOKEN` - Secret token for cron job authentication
- `MONGODB_URI` - Database connection string

## File Structure

```
app/api/
├── orders/
│   ├── recurring/
│   │   ├── route.ts (User CRUD)
│   │   └── [id]/
│   │       └── route.ts (User individual order)
│   └── [id]/
│       └── route.ts (Enhanced with recurring support)
├── admin/
│   └── orders/
│       ├── recurring/
│       │   ├── route.ts (Admin CRUD & bulk actions)
│       │   ├── [id]/
│       │   │   └── route.ts (Admin individual order)
│       │   └── stats/
│       │       └── route.ts (Analytics)
│       └── [id]/
│           └── route.ts (Enhanced admin route)
└── cron/
    └── recurring-orders/
        └── route.ts (Automated processing)

lib/
└── services/
    └── recurringOrderService.ts (Core business logic)
```

This implementation provides a complete, production-ready solution for recurring order management with proper security, validation, and scalability considerations.
