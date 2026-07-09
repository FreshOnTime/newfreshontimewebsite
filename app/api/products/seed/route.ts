import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    // Sample products matching the frontend mock data
    const sampleProducts = [
      {
        name: 'Araliya Basmathi Rice',
        description: 'Premium Basmathi Rice',
        price: 400,
        stockQty: 100,
        minStockLevel: 10,
        discountPercentage: 10,
        image: '/placeholder.svg',
      },
      {
        name: 'White Sugar',
        description: 'Fine White Sugar',
        price: 200,
        stockQty: 150,
        minStockLevel: 20,
        discountPercentage: 5,
        image: '/placeholder.svg',
      },
      {
        name: 'Table Salt',
        description: 'Pure Table Salt',
        price: 100,
        stockQty: 80,
        minStockLevel: 15,
        discountPercentage: 0,
        image: '/placeholder.svg',
      },
    ];

    // Idempotently upsert the sample products by SKU so re-seeding is safe and
    // never orphans existing order_items (a destructive deleteMany would).
    const createdProducts = [];
    for (let idx = 0; idx < sampleProducts.length; idx++) {
      const p = sampleProducts[idx];
      const sku = `SKU-${idx + 1}`;
      const slug = p.name.toLowerCase().replace(/\s+/g, '-');
      const row = await prisma.product.upsert({
        where: { sku },
        update: {
          name: p.name,
          slug,
          description: p.description,
          price: p.price,
          costPrice: Math.max(0, p.price - 10),
          stockQty: p.stockQty,
          minStockLevel: p.minStockLevel,
          image: p.image,
          images: [p.image],
          discountPercentage: p.discountPercentage,
        },
        create: {
          name: p.name,
          sku,
          slug,
          description: p.description,
          price: p.price,
          costPrice: Math.max(0, p.price - 10),
          categoryId: null,
          supplierId: null,
          stockQty: p.stockQty,
          minStockLevel: p.minStockLevel,
          image: p.image,
          images: [p.image],
          tags: [],
          attributes: {},
          archived: false,
          discountPercentage: p.discountPercentage,
        },
      });
      createdProducts.push({
        ...row,
        _id: row.id,
        price: Number(row.price),
        costPrice: Number(row.costPrice),
        discountPercentage: Number(row.discountPercentage),
      });
    }

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
