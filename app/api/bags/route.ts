import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Bag from '@/lib/models/Bag';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

// GET - Fetch all bags for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Find user by either ObjectId or userId field
    let userObjectId = userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findOne({ userId: userId });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      userObjectId = user._id.toString();
    }

  const bags = await Bag.find({ user: userObjectId, isActive: true })
      .populate({
        path: 'items.product',
        model: 'EnhancedProduct',
        select: 'name images stockQty price'
      })
      .sort({ createdAt: -1 });

    // Filter out bags with null or invalid products
    type PopulatedBag = { _id: string; items: Array<{ product: unknown }>;
      toObject: () => Record<string, unknown> };
    const validBags = (bags as unknown as PopulatedBag[])
      .filter(bag => bag && bag._id)
      .map((bag) => ({
      ...bag.toObject(),
      items: (bag.items as Array<{ product: unknown }>).filter((item) => {
        const p = item.product as { _id?: string } | null;
        return !!(p && p._id);
      })
      }));

    return NextResponse.json({
      success: true,
      data: validBags
    });
  } catch (error) {
    console.error('Error fetching bags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bags' },
      { status: 500 }
    );
  }
}

// POST - Create a new bag
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { userId, name, description, items, tags } = body;

    if (!userId || !name || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'User ID, name, and items are required' },
        { status: 400 }
      );
    }

    // Validate products exist and calculate prices
    const validatedItems = [];
    for (const item of items) {
      const product = await EnhancedProduct.findById(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product with ID ${item.productId} not found` },
          { status: 400 }
        );
      }
      
  if ((product.stockQty ?? 0) < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for product ${product.name}` },
          { status: 400 }
        );
      }

      validatedItems.push({
        product: product._id,
        quantity: item.quantity,
  // Use product price as the unit price stored in the bag
  price: Number(product.price ?? 0)
      });
    }

    // Ensure user reference is an ObjectId
    let userRef: string = userId;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findOne({ userId });
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }
      userRef = user._id.toString();
    }

    const newBag = new Bag({
      user: userRef,
      name,
      description,
      items: validatedItems,
      tags: tags || []
    });

    const savedBag = await newBag.save();
    
    const populatedBag = await Bag.findById(savedBag._id)
      .populate({
        path: 'items.product',
        model: 'EnhancedProduct',
        select: 'name images stockQty price'
      });

    return NextResponse.json({
      success: true,
      data: populatedBag
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating bag:', error);
    return NextResponse.json(
      { error: 'Failed to create bag' },
      { status: 500 }
    );
  }
}
