import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubscription extends Document {
    user: mongoose.Types.ObjectId;
    plan: mongoose.Types.ObjectId;
    status: 'active' | 'paused' | 'cancelled' | 'pending';
    startDate: Date;
    nextDeliveryDate: Date;
    pausedUntil?: Date;
    cancelledAt?: Date;
    cancelReason?: string;
    deliveryAddress: {
        fullName: string;
        phone: string;
        addressLine1: string;
        addressLine2?: string;
        city: string;
        postalCode?: string;
        instructions?: string;
    };
    deliverySlot: {
        day: string; // 'saturday', 'sunday', etc.
        timeSlot: string; // '9am-12pm', '2pm-5pm', etc.
    };
    paymentMethod: 'cod' | 'card' | 'bank_transfer';
    totalDeliveries: number;
    skippedDeliveries: number;
    skippedDates: Date[];
    customizations?: {
        excludeItems?: string[];
        preferences?: string;
    };
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema = new Schema<ISubscription>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        plan: {
            type: Schema.Types.ObjectId,
            ref: 'SubscriptionPlan',
            required: true,
        },
        status: {
            type: String,
            enum: ['active', 'paused', 'cancelled', 'pending'],
            default: 'pending',
        },
        startDate: {
            type: Date,
            required: true,
        },
        nextDeliveryDate: {
            type: Date,
            required: true,
        },
        pausedUntil: Date,
        cancelledAt: Date,
        cancelReason: String,
        deliveryAddress: {
            fullName: { type: String, required: true },
            phone: { type: String, required: true },
            addressLine1: { type: String, required: true },
            addressLine2: String,
            city: { type: String, required: true },
            postalCode: String,
            instructions: String,
        },
        deliverySlot: {
            day: { type: String, required: true },
            timeSlot: { type: String, required: true },
        },
        paymentMethod: {
            type: String,
            enum: ['cod', 'card', 'bank_transfer'],
            default: 'cod',
        },
        totalDeliveries: {
            type: Number,
            default: 0,
        },
        skippedDeliveries: {
            type: Number,
            default: 0,
        },
        skippedDates: [Date],
        customizations: {
            excludeItems: [String],
            preferences: String,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
SubscriptionSchema.index({ user: 1 });
SubscriptionSchema.index({ plan: 1 });
SubscriptionSchema.index({ status: 1 });
SubscriptionSchema.index({ nextDeliveryDate: 1 });

const Subscription: Model<ISubscription> =
    mongoose.models.Subscription ||
    mongoose.model<ISubscription>('Subscription', SubscriptionSchema);

export default Subscription;
