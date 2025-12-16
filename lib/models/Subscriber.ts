import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubscriber extends Document {
    email: string;
    subscribedAt: Date;
    source: "homepage" | "checkout" | "popup" | "footer";
    isActive: boolean;
    unsubscribedAt?: Date;
}

const SubscriberSchema = new Schema<ISubscriber>(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        },
        subscribedAt: {
            type: Date,
            default: Date.now,
        },
        source: {
            type: String,
            enum: ["homepage", "checkout", "popup", "footer"],
            default: "homepage",
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        unsubscribedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Index for quick lookups
SubscriberSchema.index({ email: 1 });
SubscriberSchema.index({ isActive: 1 });

export const Subscriber: Model<ISubscriber> =
    mongoose.models.Subscriber ||
    mongoose.model<ISubscriber>("Subscriber", SubscriberSchema);
