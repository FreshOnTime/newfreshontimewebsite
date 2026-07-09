import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

/**
 * GET /api/reviews?productId=X
 * Fetch approved reviews for a product with a rating summary.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '10'));

    if (!productId) {
      return NextResponse.json({ success: false, message: 'Product ID is required' }, { status: 400 });
    }

    const [reviewsRaw, agg, grouped] = await Promise.all([
      prisma.review.findMany({
        where: { productId, isApproved: true },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: { select: { firstName: true, lastName: true } } },
      }),
      prisma.review.aggregate({
        where: { productId, isApproved: true },
        _avg: { rating: true },
        _count: { _all: true },
      }),
      prisma.review.groupBy({
        by: ['rating'],
        where: { productId, isApproved: true },
        _count: { rating: true },
      }),
    ]);

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const g of grouped) {
      if (g.rating >= 1 && g.rating <= 5) distribution[g.rating] = g._count.rating;
    }

    const totalReviews = agg._count._all;
    const summary = {
      averageRating: agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0,
      totalReviews,
      distribution,
    };

    const reviews = reviewsRaw.map((r) => ({
      _id: r.id,
      rating: r.rating,
      title: r.title,
      comment: r.comment,
      isVerifiedPurchase: r.isVerifiedPurchase,
      helpfulCount: r.helpfulCount,
      images: r.images,
      createdAt: r.createdAt,
      user: { name: `${r.user.firstName} ${r.user.lastName || ''}`.trim() },
    }));

    return NextResponse.json({
      success: true,
      reviews,
      summary,
      pagination: { page, limit, total: totalReviews, pages: Math.ceil(totalReviews / limit) },
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch reviews' }, { status: 500 });
  }
}

/**
 * POST /api/reviews - submit or update a review (authenticated users only).
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyToken(request);
    if (!user || !user.mongoId) {
      return NextResponse.json({ success: false, message: 'Please login to leave a review' }, { status: 401 });
    }
    const userId = user.mongoId;

    const body = await request.json();
    const { productId, rating, title, comment } = body;

    if (!productId || rating === undefined || !comment) {
      return NextResponse.json(
        { success: false, message: 'Product ID, rating, and comment are required' },
        { status: 400 }
      );
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, message: 'Rating must be a whole number between 1 and 5' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { OR: [{ id: productId }, { sku: productId }, { slug: productId }] },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ success: false, message: 'Product not found' }, { status: 404 });
    }

    // Verified purchase = a delivered order of this product by this user.
    const purchased = await prisma.order.findFirst({
      where: { customerId: userId, status: 'delivered', items: { some: { productId: product.id } } },
      select: { id: true },
    });

    const review = await prisma.review.upsert({
      where: { productId_userId: { productId: product.id, userId } },
      update: { rating, title: title || null, comment },
      create: {
        productId: product.id,
        userId,
        rating,
        title: title || null,
        comment,
        isVerifiedPurchase: Boolean(purchased),
      },
    });

    return NextResponse.json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ success: false, message: 'Failed to submit review' }, { status: 500 });
  }
}
