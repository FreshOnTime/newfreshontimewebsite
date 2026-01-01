import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Review from '@/lib/models/Review';
import EnhancedProduct from '@/lib/models/EnhancedProduct';
import EnhancedOrderModel from '@/lib/models/EnhancedOrder';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

/**
 * GET /api/reviews?productId=X
 * Fetch reviews for a product with rating summary
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        if (!productId) {
            return NextResponse.json(
                { success: false, message: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Fetch reviews with user info
        const reviews = await Review.find({
            product: productId,
            isApproved: true,
        })
            .populate('user', 'name avatar')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        // Get rating summary
        const ratingAggregation = await Review.aggregate([
            { $match: { product: new mongoose.Types.ObjectId(productId), isApproved: true } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratings: { $push: '$rating' },
                },
            },
        ]);

        let summary: {
            averageRating: number;
            totalReviews: number;
            distribution: Record<number, number>;
        } = {
            averageRating: 0,
            totalReviews: 0,
            distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        };

        if (ratingAggregation.length > 0) {
            const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            ratingAggregation[0].ratings.forEach((r: number) => {
                dist[r]++;
            });

            summary = {
                averageRating: Math.round(ratingAggregation[0].averageRating * 10) / 10,
                totalReviews: ratingAggregation[0].totalReviews,
                distribution: dist,
            };
        }

        return NextResponse.json({
            success: true,
            reviews,
            summary,
            pagination: {
                page,
                limit,
                total: summary.totalReviews,
                pages: Math.ceil(summary.totalReviews / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch reviews' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/reviews
 * Submit a review (authenticated users only)
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Please login to leave a review' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, rating, title, comment } = body;

        // Validate input
        if (!productId || !rating || !comment) {
            return NextResponse.json(
                { success: false, message: 'Product ID, rating, and comment are required' },
                { status: 400 }
            );
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json(
                { success: false, message: 'Rating must be between 1 and 5' },
                { status: 400 }
            );
        }

        // Verify product exists
        const product = await EnhancedProduct.findById(productId);
        if (!product) {
            return NextResponse.json(
                { success: false, message: 'Product not found' },
                { status: 404 }
            );
        }

        // Resolve user ObjectId
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

        // Check if user has purchased this product (verified purchase)
        const hasPurchased = await EnhancedOrderModel.exists({
            customerId: userObjectId,
            'items.productId': productId,
            status: { $in: ['delivered', 'completed'] },
        });

        // Check for existing review
        const existingReview = await Review.findOne({
            product: productId,
            user: userObjectId,
        });

        if (existingReview) {
            // Update existing review
            existingReview.rating = rating;
            existingReview.title = title;
            existingReview.comment = comment;
            await existingReview.save();

            return NextResponse.json({
                success: true,
                message: 'Review updated successfully',
                review: existingReview,
            });
        }

        // Create new review
        const review = await Review.create({
            product: productId,
            user: userObjectId,
            rating,
            title,
            comment,
            isVerifiedPurchase: !!hasPurchased,
        });

        return NextResponse.json({
            success: true,
            message: 'Review submitted successfully',
            review,
        });
    } catch (error: unknown) {
        console.error('Error submitting review:', error);

        // Handle duplicate review error
        if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
            return NextResponse.json(
                { success: false, message: 'You have already reviewed this product' },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: 'Failed to submit review' },
            { status: 500 }
        );
    }
}
