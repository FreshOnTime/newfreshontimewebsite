import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Bag from '@/lib/models/Bag';
import EnhancedProduct from '@/lib/models/EnhancedProduct';

// GET - Fetch a specific bag
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: bagId } = await params;
    
    const bag = await Bag.findById(bagId)
      .populate({
        path: 'items.product',
        model: 'EnhancedProduct',
        select: 'name images stockQty price'
      });

    if (!bag) {
      return NextResponse.json(
        { error: 'Bag not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: bag
    });
  } catch (error) {
    console.error('Error fetching bag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bag' },
      { status: 500 }
    );
  }
}

// PUT - Update a bag
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: bagId } = await params;
    const body = await request.json();
    const { name, description, items, tags } = body;

    const bag = await Bag.findById(bagId);
    if (!bag) {
      return NextResponse.json(
        { error: 'Bag not found' },
        { status: 404 }
      );
    }

    // Validate products if items are being updated
    if (items) {
      const validatedItems = [];
      for (const item of items) {
  const product = await EnhancedProduct.findById(item.productId || item.product);
        if (!product) {
          return NextResponse.json(
            { error: `Product with ID ${item.productId || item.product} not found` },
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
          price: Number(product.price ?? 0)
        });
      }
      bag.items = validatedItems;
    }

    if (name) bag.name = name;
    if (description !== undefined) bag.description = description;
    if (tags) bag.tags = tags;

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
    console.error('Error updating bag:', error);
    return NextResponse.json(
      { error: 'Failed to update bag' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a bag
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    
    const { id: bagId } = await params;
    
    const bag = await Bag.findById(bagId);
    if (!bag) {
      return NextResponse.json(
        { error: 'Bag not found' },
        { status: 404 }
      );
    }

    // Soft delete by setting isActive to false
    bag.isActive = false;
    await bag.save();

    return NextResponse.json({
      success: true,
      message: 'Bag deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting bag:', error);
    return NextResponse.json(
      { error: 'Failed to delete bag' },
      { status: 500 }
    );
  }
}
