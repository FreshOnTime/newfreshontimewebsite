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

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getUser();

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { recipientId, subject, content } = body;

        if (!recipientId || !subject || !content) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
        if (!recipient) {
            return NextResponse.json({ success: false, message: 'Recipient not found' }, { status: 404 });
        }

        const message = await prisma.message.create({
            data: {
                senderId: currentUser.userId,
                recipientId: recipient.id,
                subject,
                content,
            },
        });

        return NextResponse.json({ success: true, data: { ...message, _id: message.id } }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const currentUser = await getUser();

        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: currentUser.userId } });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const messages = await prisma.message.findMany({
            where: { recipientId: user.id },
            include: {
                sender: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        const data = messages.map((m) => {
            const { sender, ...rest } = m;
            return {
                ...rest,
                _id: m.id,
                sender: sender ? { ...sender, _id: sender.id } : null,
            };
        });

        return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
