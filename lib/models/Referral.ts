import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReferral extends Document {
    code: string;
    owner: mongoose.Types.ObjectId;
    referredUsers: Array<{
        user: mongoose.Types.ObjectId;
        appliedAt: Date;
        orderPlaced: boolean;
        rewardPaid: boolean;
    }>;
    totalEarnings: number;
    totalReferrals: number;
    successfulReferrals: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true, // One referral code per user
        },
        referredUsers: [
            {
                user: {
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true,
                },
                appliedAt: {
                    type: Date,
                    default: Date.now,
                },
                orderPlaced: {
                    type: Boolean,
                    default: false,
                },
                rewardPaid: {
                    type: Boolean,
                    default: false,
                },
            },
        ],
        totalEarnings: {
            type: Number,
            default: 0,
            min: 0,
        },
        totalReferrals: {
            type: Number,
            default: 0,
            min: 0,
        },
        successfulReferrals: {
            type: Number,
            default: 0,
            min: 0,
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
ReferralSchema.index({ code: 1 });
ReferralSchema.index({ owner: 1 });

// Generate a unique referral code
ReferralSchema.statics.generateCode = function (): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'FRESH';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const Referral: Model<IReferral> =
    mongoose.models.Referral ||
    mongoose.model<IReferral>('Referral', ReferralSchema);

export default Referral;
