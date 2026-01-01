import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import EnhancedOrderModel from '@/lib/models/EnhancedOrder';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import Bag from '@/lib/models/Bag';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * POST /api/bags/reorder
 * Creates a new bag from a previous order's items
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        // Verify authenticated user
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { orderId } = body;

        if (!orderId) {
            return NextResponse.json(
                { success: false, message: 'Order ID is required' },
                { status: 400 }
            );
        }

        // Resolve user ObjectId from mongoId or userId
        let userObjectId = user.mongoId;
        if (!userObjectId || !mongoose.Types.ObjectId.isValid(userObjectId)) {
            const userDoc = await User.findOne({ userId: user.userId });
            if (!userDoc) {
                return NextResponse.json(
                    { success: false, message: 'User not found' },
                    { status: 404 }
                );
            }
            userObjectId = userDoc._id.toString();
        }

        // Find the order and verify ownership
        const order = await EnhancedOrderModel.findOne({
            _id: orderId,
            customerId: userObjectId,
        }).lean();

        if (!order) {
            return NextResponse.json(
                { success: false, message: 'Order not found' },
                { status: 404 }
            );
        }

        // Validate products and build bag items
        const validItems: Array<{
            product: mongoose.Types.ObjectId;
            quantity: number;
            price: number;
        }> = [];
        const unavailableItems: Array<{ name: string; reason: string }> = [];

        for (const item of order.items) {
            const product = await EnhancedProduct.findById(item.productId);

            if (!product) {
                unavailableItems.push({
                    name: item.name,
                    reason: 'Product no longer available',
                });
                continue;
            }

            if (!product.isActive) {
                unavailableItems.push({
                    name: item.name,
                    reason: 'Product is currently unavailable',
                });
                continue;
            }

            const requestedQty = item.qty;
            const availableQty = product.stockQty ?? 0;

            if (availableQty < requestedQty) {
                if (availableQty === 0) {
                    unavailableItems.push({
                        name: item.name,
                        reason: 'Out of stock',
                    });
                    continue;
                }
                // Add available quantity
                validItems.push({
                    product: product._id,
                    quantity: availableQty,
                    price: Number(product.price ?? item.price),
                });
                unavailableItems.push({
                    name: item.name,
                    reason: `Only ${availableQty} available (requested ${requestedQty})`,
                });
            } else {
                validItems.push({
                    product: product._id,
                    quantity: requestedQty,
                    price: Number(product.price ?? item.price),
                });
            }
        }

        // If no valid items, return error
        if (validItems.length === 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: 'None of the items from this order are currently available',
                    unavailableItems,
                },
                { status: 400 }
            );
        }

        // Create new bag with the items
        const newBag = await Bag.create({
            user: userObjectId,
            name: `Reorder from #${order.orderNumber}`,
            description: `Quick reorder from order #${order.orderNumber}`,
            items: validItems,
            tags: ['reorder'],
            isActive: true,
        });

        // Populate product details for response
        const populatedBag = await Bag.findById(newBag._id)
            .populate({
                path: 'items.product',
                model: 'EnhancedProduct',
                select: 'name images price stockQty',
            })
            .lean();

        return NextResponse.json({
            success: true,
            message: unavailableItems.length > 0
                ? `Bag created with ${validItems.length} items. Some items were unavailable.`
                : 'All items added to bag successfully!',
            bag: populatedBag,
            unavailableItems: unavailableItems.length > 0 ? unavailableItems : undefined,
        });
    } catch (error) {
        console.error('Error creating reorder bag:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to create reorder bag' },
            { status: 500 }
        );
    }
}
