import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import EnhancedOrderModel from '@/lib/models/EnhancedOrder';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import mongoose from 'mongoose';
import { requireAuth } from '@/lib/auth';

interface AuthenticatedRequest extends NextRequest {
  user: { userId: string; role: string; mongoId?: string };
}

// GET - fetch single order (owner or admin)
export const GET = requireAuth(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
    const id = context?.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Order ID missing' }, { status: 400 });
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const order = await EnhancedOrderModel.findById(id)
      .populate({ path: 'items.productId', model: 'EnhancedProduct', select: 'name price images stockQty sku' });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

  const user = (request as AuthenticatedRequest).user;
  // Allow owner or admin role. Compare to mongoId (User._id) as orders use that in customerId.
  const ownerId = user.mongoId || user.userId;
  if (String(order.customerId) !== String(ownerId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
});

// PUT - update an order (owner or admin). Allows editing shippingAddress and notes while order is not shipped/delivered.
export const PUT = requireAuth(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
    const id = context?.params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};
    if (body?.shippingAddress && typeof body.shippingAddress === 'object') {
      updates.shippingAddress = body.shippingAddress;
    }
    if (typeof body?.notes === 'string') {
      updates.notes = body.notes;
    }
    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    const order = await EnhancedOrderModel.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const user = (request as unknown as { user: { userId: string; role: string; mongoId?: string } }).user;
    const ownerId = user.mongoId || user.userId;
    if (String(order.customerId) !== String(ownerId) && user.role !== 'admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      return NextResponse.json({ error: `Order cannot be edited in '${order.status}' state` }, { status: 400 });
    }

    const updated = await EnhancedOrderModel.findByIdAndUpdate(id, { $set: updates }, { new: true, runValidators: true })
      .populate({ path: 'items.productId', model: 'EnhancedProduct', select: 'name price images stockQty sku' });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
});

// PATCH - quick actions: cancel (owner), mark-status (admin)
export const PATCH = requireAuth<{ params: { id: string } }>(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
    const id = context?.params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const body = await request.json().catch(() => ({}));
    const action = body?.action as string;
    const user = (request as unknown as { user: { userId: string; role: string; mongoId?: string } }).user;

    const order = await EnhancedOrderModel.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    const ownerId = user.mongoId || user.userId;
    const isOwner = String(order.customerId) === String(ownerId);
    if (!isOwner && user.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    if (action === 'cancel') {
      if (!isOwner && user.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      if (['shipped', 'delivered'].includes(order.status)) {
        return NextResponse.json({ error: 'Cannot cancel after shipment' }, { status: 400 });
      }
      // mark cancelled and restore stock
      await Promise.all((order.items || []).map(async (it) => {
        if (mongoose.Types.ObjectId.isValid(String(it.productId))) {
          await EnhancedProduct.updateOne({ _id: it.productId }, { $inc: { stockQty: it.qty } }).catch(() => null);
        }
      }));
      order.status = 'cancelled';
      await order.save();
      const populated = await EnhancedOrderModel.findById(order._id)
        .populate({ path: 'items.productId', model: 'EnhancedProduct', select: 'name price images stockQty sku' });
      return NextResponse.json({ success: true, data: populated, message: 'Order cancelled' });
    }

    if (user.role === 'admin' && action?.startsWith('status:')) {
      const status = action.split(':')[1] as string;
      if (!['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      const updated = await EnhancedOrderModel.findByIdAndUpdate(id, { $set: { status } }, { new: true })
        .populate({ path: 'items.productId', model: 'EnhancedProduct', select: 'name price images stockQty sku' });
      return NextResponse.json({ success: true, data: updated });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Error patching order:', error);
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
});

// DELETE - admin hard delete (restores stock if not shipped/delivered)
export const DELETE = requireAuth<{ params: { id: string } }>(async (request: NextRequest, context?: { params: { id: string } }) => {
  try {
    await connectDB();
    const id = context?.params?.id;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid order ID' }, { status: 400 });
    }
    const user = (request as unknown as { user: { role: string } }).user;
    if (user.role !== 'admin') return NextResponse.json({ error: 'Access denied' }, { status: 403 });

    const order = await EnhancedOrderModel.findById(id);
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    const restore = !['delivered', 'shipped'].includes(order.status || '');
    if (restore) {
      await Promise.all((order.items || []).map(async (it) => {
        if (mongoose.Types.ObjectId.isValid(String(it.productId))) {
          await EnhancedProduct.updateOne({ _id: it.productId }, { $inc: { stockQty: it.qty } }).catch(() => null);
        }
      }));
    }

    await EnhancedOrderModel.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 });
  }
});
