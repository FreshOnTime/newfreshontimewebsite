import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Decode the auth cookie. The cookie is issued as `accessToken` across the app
// (see lib/utils/cookies.ts); the decoded token's `userId` is the user's id.
async function getUser() {
    const token = (await cookies()).get('accessToken')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role?: string; [k: string]: unknown };
        return decoded;
    } catch {
        return null;
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const currentUser = await getUser();
        // await params
        const { id } = await params;

        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const message = await prisma.message.findUnique({ where: { id } });
        if (!message) {
            return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
        }

        // Verify recipient matches current user
        if (message.recipientId !== currentUser.userId) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        const updated = await prisma.message.update({
            where: { id },
            data: { isRead: true },
        });

        return NextResponse.json({ success: true, data: { ...updated, _id: updated.id } }, { status: 200 });
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
