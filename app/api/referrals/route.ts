import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

const REFERRAL_REWARD = 200; // Rs. 200 per successful referral

/**
 * GET /api/referrals
 * Get current user's referral code and stats (creates one if doesn't exist)
 */
export async function GET(request: NextRequest) {
    try {
        const user = await verifyToken(request);
        if (!user) {
            return NextResponse.json(
                { success: false, message: 'Unauthorized' },
                { status: 401 }
            );
        }

        // The JWT subject is the Postgres user id (mongoId === userId === user.id).
        const userId = user.userId;

        // Find or create referral record for user
        let referral = await prisma.referral.findUnique({ where: { ownerId: userId } });

        if (!referral) {
            // Generate unique code
            let code = '';
            let attempts = 0;
            const maxAttempts = 10;

            do {
                code = 'FRESH' + Math.random().toString(36).substring(2, 8).toUpperCase();
                const exists = await prisma.referral.findUnique({ where: { code } });
                if (!exists) break;
                attempts++;
            } while (attempts < maxAttempts);

            referral = await prisma.referral.create({
                data: {
                    code,
                    ownerId: userId,
                    totalEarnings: 0,
                    totalReferrals: 0,
                    successfulReferrals: 0,
                },
            });
        }

        return NextResponse.json({
            success: true,
            referral: {
                code: referral.code,
                totalEarnings: Number(referral.totalEarnings),
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
        const referral = await prisma.referral.findFirst({
            where: { code: normalizedCode, isActive: true },
        });

        if (!referral) {
            return NextResponse.json(
                { success: false, message: 'Invalid or inactive referral code' },
                { status: 400 }
            );
        }

        // If userId provided, add to referred users
        if (userId) {
            // The provided id is the Postgres user id directly.
            const referredUserId: string = userId;

            // Prevent self-referral
            if (referral.ownerId === referredUserId) {
                return NextResponse.json(
                    { success: false, message: 'Cannot use your own referral code' },
                    { status: 400 }
                );
            }

            // Check if already referred
            const alreadyReferred = await prisma.referredUser.findUnique({
                where: { referralId_userId: { referralId: referral.id, userId: referredUserId } },
            });

            if (!alreadyReferred) {
                await prisma.$transaction([
                    prisma.referredUser.create({
                        data: {
                            referralId: referral.id,
                            userId: referredUserId,
                            orderPlaced: false,
                            rewardPaid: false,
                        },
                    }),
                    prisma.referral.update({
                        where: { id: referral.id },
                        data: { totalReferrals: { increment: 1 } },
                    }),
                ]);
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
        const body = await request.json();
        const { referralCode, userId } = body;

        if (!referralCode || !userId) {
            return NextResponse.json(
                { success: false, message: 'Referral code and user ID are required' },
                { status: 400 }
            );
        }

        const referral = await prisma.referral.findFirst({
            where: { code: referralCode.toUpperCase() },
        });

        if (!referral) {
            return NextResponse.json(
                { success: false, message: 'Referral not found' },
                { status: 404 }
            );
        }

        // Find the referred user entry that hasn't had an order placed yet
        const referredEntry = await prisma.referredUser.findFirst({
            where: { referralId: referral.id, userId, orderPlaced: false },
        });

        if (referredEntry) {
            const ops: Prisma.PrismaPromise<unknown>[] = [
                prisma.referredUser.update({
                    where: { id: referredEntry.id },
                    data: {
                        orderPlaced: true,
                        ...(referredEntry.rewardPaid ? {} : { rewardPaid: true }),
                    },
                }),
            ];

            // Add reward for both parties (only once)
            if (!referredEntry.rewardPaid) {
                ops.push(
                    prisma.referral.update({
                        where: { id: referral.id },
                        data: {
                            totalEarnings: { increment: REFERRAL_REWARD },
                            successfulReferrals: { increment: 1 },
                        },
                    })
                );
            }

            await prisma.$transaction(ops);
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
