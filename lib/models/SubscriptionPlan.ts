import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscriptionPlan extends Document {
    name: string;
    slug: string;
    description: string;
    shortDescription: string;
    price: number;
    originalPrice?: number;
    frequency: 'weekly' | 'biweekly' | 'monthly';
    contents: {
        name: string;
        quantity: string;
        category: string;
    }[];
    image: string;
    icon: string;
    color: string;
    features: string[];
    isActive: boolean;
    isFeatured: boolean;
    maxSubscribers?: number;
    currentSubscribers: number;
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionPlanSchema = new Schema<ISubscriptionPlan>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        slug: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
        },
        description: {
            type: String,
            required: true,
        },
        shortDescription: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        originalPrice: {
            type: Number,
            min: 0,
        },
        frequency: {
            type: String,
            enum: ['weekly', 'biweekly', 'monthly'],
            default: 'weekly',
        },
        contents: [
            {
                name: { type: String, required: true },
                quantity: { type: String, required: true },
                category: { type: String, required: true },
            },
        ],
        image: {
            type: String,
            default: '/images/subscription-default.jpg',
        },
        icon: {
            type: String,
            default: '📦',
        },
        color: {
            type: String,
            default: 'emerald',
        },
        features: [String],
        isActive: {
            type: Boolean,
            default: true,
        },
        isFeatured: {
            type: Boolean,
            default: false,
        },
        maxSubscribers: {
            type: Number,
        },
        currentSubscribers: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
SubscriptionPlanSchema.index({ slug: 1 });
SubscriptionPlanSchema.index({ isActive: 1 });

const SubscriptionPlan: Model<ISubscriptionPlan> =
    mongoose.models.SubscriptionPlan ||
    mongoose.model<ISubscriptionPlan>('SubscriptionPlan', SubscriptionPlanSchema);

export default SubscriptionPlan;
