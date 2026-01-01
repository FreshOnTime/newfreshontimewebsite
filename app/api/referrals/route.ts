import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/database';
import Referral from '@/lib/models/Referral';
import User from '@/lib/models/User';
import { verifyToken } from '@/lib/auth';
import mongoose from 'mongoose';

const REFERRAL_REWARD = 200; // Rs. 200 per successful referral

/**
 * GET /api/referrals
 * Get current user's referral code and stats (creates one if doesn't exist)
 */
export async function GET(request: NextRequest) {
    try {
        await dbConnect();

        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
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

        // Find or create referral record for user
        let referral = await Referral.findOne({ owner: userObjectId });

        if (!referral) {
            // Generate unique code
            let code: string;
            let attempts = 0;
            const maxAttempts = 10;

            do {
                code = 'FRESH' + Math.random().toString(36).substring(2, 8).toUpperCase();
                const exists = await Referral.findOne({ code });
                if (!exists) break;
                attempts++;
            } while (attempts < maxAttempts);

            referral = await Referral.create({
                code,
                owner: userObjectId,
                referredUsers: [],
                totalEarnings: 0,
                totalReferrals: 0,
                successfulReferrals: 0,
            });
        }

        return NextResponse.json({
            success: true,
            referral: {
                code: referral.code,
                totalEarnings: referral.totalEarnings,
                totalReferrals: referral.totalReferrals,
                successfulReferrals: referral.successfulReferrals,
                isActive: referral.isActive,
            },
        });
    } catch (error) {
        console.error('Error fetching referral:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to fetch referral' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/referrals
 * Apply a referral code (used during signup or first order)
 */
export async function POST(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { code, userId } = body;

        if (!code) {
            return NextResponse.json(
                { success: false, message: 'Referral code is required' },
                { status: 400 }
            );
        }

        // Normalize code
        const normalizedCode = code.toUpperCase().trim();

        // Find the referral
        const referral = await Referral.findOne({
            code: normalizedCode,
            isActive: true,
        });

        if (!referral) {
            return NextResponse.json(
                { success: false, message: 'Invalid or inactive referral code' },
                { status: 400 }
            );
        }

        // If userId provided, add to referred users
        if (userId) {
            // Resolve user ObjectId
            let referredUserObjectId = userId;
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                const userDoc = await User.findOne({ userId: userId });
                if (userDoc) {
                    referredUserObjectId = userDoc._id.toString();
                }
            }

            // Prevent self-referral
            if (referral.owner.toString() === referredUserObjectId) {
                return NextResponse.json(
                    { success: false, message: 'Cannot use your own referral code' },
                    { status: 400 }
                );
            }

            // Check if already referred
            const alreadyReferred = referral.referredUsers.some(
                (r) => r.user.toString() === referredUserObjectId
            );

            if (!alreadyReferred) {
                referral.referredUsers.push({
                    user: new mongoose.Types.ObjectId(referredUserObjectId),
                    appliedAt: new Date(),
                    orderPlaced: false,
                    rewardPaid: false,
                });
                referral.totalReferrals += 1;
                await referral.save();
            }
        }

        return NextResponse.json({
            success: true,
            message: 'Referral code applied! You\'ll get Rs. 200 off your first order.',
            discount: REFERRAL_REWARD,
            referrerCode: referral.code,
        });
    } catch (error) {
        console.error('Error applying referral:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to apply referral code' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/referrals
 * Mark a referral as successful (called after first order is placed)
 */
export async function PATCH(request: NextRequest) {
    try {
        await dbConnect();

        const body = await request.json();
        const { referralCode, userId } = body;

        if (!referralCode || !userId) {
            return NextResponse.json(
                { success: false, message: 'Referral code and user ID are required' },
                { status: 400 }
            );
        }

        const referral = await Referral.findOne({ code: referralCode.toUpperCase() });

        if (!referral) {
            return NextResponse.json(
                { success: false, message: 'Referral not found' },
                { status: 404 }
            );
        }

        // Find the referred user entry
        const referredEntry = referral.referredUsers.find(
            (r) => r.user.toString() === userId && !r.orderPlaced
        );

        if (referredEntry) {
            referredEntry.orderPlaced = true;

            // Add reward for both parties
            if (!referredEntry.rewardPaid) {
                referral.totalEarnings += REFERRAL_REWARD;
                referral.successfulReferrals += 1;
                referredEntry.rewardPaid = true;
            }

            await referral.save();
        }

        return NextResponse.json({
            success: true,
            message: 'Referral marked as successful',
        });
    } catch (error) {
        console.error('Error updating referral:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to update referral' },
            { status: 500 }
        );
    }
}
