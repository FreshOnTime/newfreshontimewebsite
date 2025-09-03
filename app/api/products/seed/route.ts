import { NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import EnhancedProduct from '@/lib/models/EnhancedProduct';

export async function POST() {
  try {
    await connectDB();

    // Sample products matching the frontend mock data
    const sampleProducts = [
      {
        name: 'Araliya Basmathi Rice',
        image: {
          url: '/placeholder.svg',
          filename: 'rice.jpg',
          contentType: 'image/jpeg',
          path: '/placeholder.svg'
        },
        description: 'Premium Basmathi Rice',
        searchContent: 'basmathi rice araliya premium grain',
        isDisabled: false,
        isDeleted: false,
        baseMeasurementQuantity: 1,
        pricePerBaseQuantity: 400,
        measurementType: 'kg',
        isSoldAsUnit: false,
        minOrderQuantity: 0.5,
        maxOrderQuantity: 80,
        stepQuantity: 0.5,
        stockQuantity: 100,
        lowStockThreshold: 10,
        isOutOfStock: false,
        totalSales: 500,
        discountPercentage: 10,
        brand: '674ad90c123456789abcdef0', // Dummy ObjectId
        category: '674ad90c123456789abcdef1' // Dummy ObjectId
      },
      {
        name: 'White Sugar',
        image: {
          url: '/placeholder.svg',
          filename: 'sugar.jpg',
          contentType: 'image/jpeg',
          path: '/placeholder.svg'
        },
        description: 'Fine White Sugar',
        searchContent: 'white sugar fine sweet granulated',
        isDisabled: false,
        isDeleted: false,
        baseMeasurementQuantity: 1,
        pricePerBaseQuantity: 200,
        measurementType: 'kg',
        isSoldAsUnit: false,
        minOrderQuantity: 0.5,
        maxOrderQuantity: 5,
        stepQuantity: 0.1,
        stockQuantity: 150,
        lowStockThreshold: 20,
        isOutOfStock: false,
        totalSales: 300,
        discountPercentage: 5,
        brand: '674ad90c123456789abcdef0',
        category: '674ad90c123456789abcdef1'
      },
      {
        name: 'Table Salt',
        image: {
          url: '/placeholder.svg',
          filename: 'salt.jpg',
          contentType: 'image/jpeg',
          path: '/placeholder.svg'
        },
        description: 'Pure Table Salt',
        searchContent: 'table salt pure cooking kitchen',
        isDisabled: false,
        isDeleted: false,
        baseMeasurementQuantity: 1,
        pricePerBaseQuantity: 100,
        measurementType: 'kg',
        isSoldAsUnit: false,
        minOrderQuantity: 0.1,
        maxOrderQuantity: 2,
        stepQuantity: 0.1,
        stockQuantity: 80,
        lowStockThreshold: 15,
        isOutOfStock: false,
        totalSales: 200,
        discountPercentage: 0,
        brand: '674ad90c123456789abcdef0',
        category: '674ad90c123456789abcdef1'
      }
    ];

    // Clear existing products
    await EnhancedProduct.deleteMany({});

    // Adapt sample to EnhancedProduct minimal fields
    const enhanced = sampleProducts.map((p, idx) => ({
      name: p.name,
      sku: `SKU-${idx + 1}`,
      slug: p.name.toLowerCase().replace(/\s+/g, '-'),
      description: p.description,
      price: p.pricePerBaseQuantity,
      costPrice: Math.max(0, p.pricePerBaseQuantity - 10),
      categoryId: '000000000000000000000000',
      supplierId: '000000000000000000000000',
      stockQty: p.stockQuantity,
      minStockLevel: p.lowStockThreshold,
      images: [p.image?.url || '/placeholder.svg'],
      tags: [],
      attributes: {},
      archived: false,
    }));

    // Insert sample products
    const createdProducts = await EnhancedProduct.insertMany(enhanced);

    return NextResponse.json({
      success: true,
      message: 'Sample products created successfully',
      data: createdProducts
    });

  } catch (error) {
    console.error('Error seeding products:', error);
    return NextResponse.json(
      { error: 'Failed to seed products' },
      { status: 500 }
    );
  }
}
