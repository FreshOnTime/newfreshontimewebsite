import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Category from '@/lib/models/Category';

// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const isActive = searchParams.get('isActive') !== 'false';
    const query = isActive ? { isActive: true } : {};
    // Only select fields needed by frontend
    const categories = await Category.find(query)
      .sort({ sortOrder: 1, name: 1 })
      .select('_id name slug description imageUrl isActive sortOrder')
      .lean();

    return NextResponse.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST - Create a new category
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const body = await request.json();
    const { name, description, imageUrl, slug, parentCategoryId, isActive = true, sortOrder = 0 } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Name and slug are required' },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingCategory = await Category.findOne({ slug });
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Slug already exists' },
        { status: 400 }
      );
    }

    const newCategory = new Category({
      name,
      description,
      imageUrl,
      slug,
      parentCategoryId,
      isActive,
      sortOrder,
    });

    const savedCategory = await newCategory.save();

    return NextResponse.json({
      success: true,
      data: savedCategory
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
