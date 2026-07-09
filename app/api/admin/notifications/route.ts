import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyToken } from '@/lib/jwt';

// Helper to get user from token
async function getUser(req: NextRequest) {
    const token = req.cookies.get('accessToken')?.value;
    if (!token) return null;
    try {
        const decoded = verifyToken(token);
        if (decoded.type !== 'access') return null;
        const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
        if (!user || user.isBanned) return null;
        return { ...decoded, role: user.role, secondaryRoles: user.secondaryRoles };
    } catch (err) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const currentUser = await getUser(req);

        if (!currentUser || (currentUser.role !== 'admin' && !currentUser.secondaryRoles?.includes('admin'))) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, message, type, targetUserId, link } = body;

        if (!title || !message) {
            return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
        }

        // If targetUserId is 'all', we create a broadcast (targetUser: null)
        // Or if specific user, find them.
        let targetUserIdToSave: string | null = null;
        if (targetUserId && targetUserId !== 'all') {
            const user = await prisma.user.findUnique({ where: { id: targetUserId } });
            if (!user) {
                return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });
            }
            targetUserIdToSave = user.id;
        }

        const notification = await prisma.notification.create({
            data: {
                title,
                message,
                type: type || 'info',
                targetUserId: targetUserIdToSave,
                link,
            },
        });

        return NextResponse.json({ success: true, data: { ...notification, _id: notification.id } }, { status: 201 });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getUser(req);

        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Fetch notifications for this user OR broadcasts (targetUser: null)
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { targetUserId: currentUser.userId },
                    { targetUserId: null },
                ],
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });

        return NextResponse.json({ success: true, data: notifications.map((n) => ({ ...n, _id: n.id })) }, { status: 200 });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
