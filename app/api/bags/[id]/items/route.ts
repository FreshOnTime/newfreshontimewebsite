import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Bag from '@/lib/models/Bag';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import mongoose from 'mongoose';

// POST - Add item to bag
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
  const { id: bagId } = await params;
  const body = await request.json();
  const { productId, quantity } = body;

    if (!productId || !quantity || quantity <= 0) {
      return NextResponse.json(
        { error: 'Product ID and valid quantity are required' },
        { status: 400 }
      );
    }

    const bag = await Bag.findById(bagId);
    if (!bag) {
      return NextResponse.json(
        { error: 'Bag not found' },
        { status: 404 }
      );
    }

    // Look up the actual product from the database by _id, sku, or slug
    interface ProdDoc {
      _id: mongoose.Types.ObjectId;
      price?: number;
      stockQty?: number;
      name?: string;
    }
    let product: ProdDoc | null = null;
    if (mongoose.Types.ObjectId.isValid(productId)) {
      product = await EnhancedProduct.findById(productId).lean<ProdDoc>();
    }
    if (!product) {
      product = await EnhancedProduct.findOne({ $or: [{ sku: productId }, { slug: productId }] }).lean<ProdDoc>();
    }
  if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }
    // From here product is a lean object
  if ((product.stockQty ?? 0) < quantity) {
      return NextResponse.json(
        { error: 'Insufficient stock' },
        { status: 400 }
      );
    }

    // Check if product already exists in bag
    const existingItemIndex = bag.items.findIndex(
      (item: { product: unknown }) => (item.product as unknown as { toString: () => string }).toString() === product!._id.toString()
    );

    if (existingItemIndex >= 0) {
      // Update quantity
      const newQuantity = bag.items[existingItemIndex].quantity + quantity;
  if ((product.stockQty ?? 0) < newQuantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for requested quantity' },
          { status: 400 }
        );
      }
      bag.items[existingItemIndex].quantity = newQuantity;
  bag.items[existingItemIndex].price = Number(product.price ?? 0); // Update price in case it changed
    } else {
      // Add new item
      bag.items.push({
    product: product._id,
        quantity,
  price: Number(product.price ?? 0)
      });
    }

    const updatedBag = await bag.save();
    
    const populatedBag = await Bag.findById(updatedBag._id)
      .populate({
        path: 'items.product',
        model: 'EnhancedProduct',
        select: 'name images stockQty price'
      });

    return NextResponse.json({
      success: true,
      data: populatedBag
    });
  } catch (error) {
    console.error('Error adding item to bag:', error);
    return NextResponse.json(
      { error: 'Failed to add item to bag' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from bag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: bagId } = await params;
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const bag = await Bag.findById(bagId);
    if (!bag) {
      return NextResponse.json(
        { error: 'Bag not found' },
        { status: 404 }
      );
    }

    // Remove item from bag
    bag.items = bag.items.filter(
      (item: { product: unknown }) => (item.product as unknown as { toString: () => string }).toString() !== productId
    );

    const updatedBag = await bag.save();
    
    const populatedBag = await Bag.findById(updatedBag._id)
      .populate({
        path: 'items.product',
        model: 'EnhancedProduct',
        select: 'name images stockQty price'
      });

    return NextResponse.json({
      success: true,
      data: populatedBag
    });
  } catch (error) {
    console.error('Error removing item from bag:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from bag' },
      { status: 500 }
    );
  }
}
