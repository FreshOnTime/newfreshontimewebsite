import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Customer from '@/lib/models/Customer';
import User from '@/lib/models/User';
import Product from '@/lib/models/EnhancedProduct';
import Order from '@/lib/models/EnhancedOrder';
import { requireAdminSimple } from '@/lib/middleware/adminAuth';

// GET /api/admin/analytics/overview
export const GET = requireAdminSimple(async () => {
  try {
    await connectDB();

    // Determine total customers. If the Customer collection is empty, fall back to counting
    // users with role "customer" (the same behavior as the customers listing endpoint).
    let totalCustomers = 0;
    const customerEstimate = await Customer.estimatedDocumentCount();
    if (customerEstimate === 0) {
      totalCustomers = await User.countDocuments({ role: 'customer' });
    } else {
      totalCustomers = await Customer.countDocuments();
    }

    // Run the remaining analytics queries in parallel
    const [
      totalProducts,
      totalOrders,
      revenueResult,
      lowStockProducts,
      pendingOrders,
      // Recurring-specific metrics
      activeRecurring,
      recurringRevenueResult,
      upcomingRecurring,
    ] = await Promise.all([
      Product.countDocuments({ archived: false }),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $in: ['delivered', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Product.countDocuments({ 
        archived: false,
        $expr: { $lte: ['$stockQty', '$minStockLevel'] }
      }),
      Order.countDocuments({ status: 'pending' }),
      // Active recurring schedules (not ended)
      Order.countDocuments({
        isRecurring: true,
        scheduleStatus: 'active',
        $or: [
          { 'recurrence.endDate': { $exists: false } },
          { 'recurrence.endDate': { $gte: new Date() } },
        ],
      }),
      // Revenue from recurring orders (delivered or marked paid)
      Order.aggregate([
        { $match: { isRecurring: true, status: { $in: ['delivered', 'paid'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      // Next 10 upcoming recurring deliveries in next 14 days
      (async () => {
        const now = new Date();
        const in14 = new Date();
        in14.setDate(in14.getDate() + 14);
        const docs = await Order.find({
          isRecurring: true,
          scheduleStatus: 'active',
          nextDeliveryAt: { $gte: now, $lte: in14 },
        })
          .sort({ nextDeliveryAt: 1 })
          .limit(10)
          .select('orderNumber nextDeliveryAt total customerId')
          .lean();
        return docs;
      })(),
    ]);

    const totalRevenue = revenueResult[0]?.total || 0;
    const recurringRevenue = recurringRevenueResult[0]?.total || 0;

    const stats = {
      totalCustomers,
      totalProducts,
      totalOrders,
      totalRevenue,
      lowStockProducts,
      pendingOrders,
      activeRecurring,
      recurringRevenue,
      upcomingRecurring,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Analytics overview error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
});
