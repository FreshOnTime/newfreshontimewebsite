import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
    product: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    rating: number;
    title?: string;
    comment: string;
    isVerifiedPurchase: boolean;
    helpfulCount: number;
    images?: string[];
    isApproved: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        product: {
            type: Schema.Types.ObjectId,
            ref: 'EnhancedProduct',
            required: true,
            index: true,
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },
        title: {
            type: String,
            trim: true,
            maxlength: 100,
        },
        comment: {
            type: String,
            required: true,
            trim: true,
            maxlength: 1000,
        },
        isVerifiedPurchase: {
            type: Boolean,
            default: false,
        },
        helpfulCount: {
            type: Number,
            default: 0,
            min: 0,
        },
        images: [{
            type: String,
        }],
        isApproved: {
            type: Boolean,
            default: true, // Auto-approve for now
        },
    },
    {
        timestamps: true,
    }
);

// Compound index to prevent duplicate reviews
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Index for fetching reviews sorted by date
ReviewSchema.index({ product: 1, createdAt: -1 });

// Static method to get product rating summary
ReviewSchema.statics.getProductRating = async function (productId: mongoose.Types.ObjectId) {
    const result = await this.aggregate([
        { $match: { product: productId, isApproved: true } },
        {
            $group: {
                _id: '$product',
                averageRating: { $avg: '$rating' },
                totalReviews: { $sum: 1 },
                ratingDistribution: {
                    $push: '$rating',
                },
            },
        },
    ]);

    if (result.length === 0) {
        return { averageRating: 0, totalReviews: 0, distribution: {} };
    }

    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    result[0].ratingDistribution.forEach((rating: number) => {
        distribution[rating]++;
    });

    return {
        averageRating: Math.round(result[0].averageRating * 10) / 10,
        totalReviews: result[0].totalReviews,
        distribution,
    };
};

const Review: Model<IReview> =
    mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
