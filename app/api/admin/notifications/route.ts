import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/database';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Helper to get user from token
async function getUser(req: NextRequest) {
    const token = (await cookies()).get('token')?.value;
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        return decoded;
    } catch (err) {
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const currentUser = await getUser(req);

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { title, message, type, targetUserId, link } = body;

        if (!title || !message) {
            return NextResponse.json({ success: false, message: 'Title and message are required' }, { status: 400 });
        }

        // If targetUserId is 'all', we create a broadcast (targetUser: null)
        // Or if specific user, find them.
        let targetUser = null;
        if (targetUserId && targetUserId !== 'all') {
            const user = await User.findById(targetUserId);
            if (!user) {
                return NextResponse.json({ success: false, message: 'Target user not found' }, { status: 404 });
            }
            targetUser = user._id;
        }

        const notification = await Notification.create({
            title,
            message,
            type: type || 'info',
            targetUser,
            link,
        });

        return NextResponse.json({ success: true, data: notification }, { status: 201 });
    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await connectDB();
        const currentUser = await getUser(req);

        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Find the user's ObjectId
        const user = await User.findOne({ userId: currentUser.userId });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        // Fetch notifications for this user OR broadcasts (targetUser: null)
        const notifications = await Notification.find({
            $or: [
                { targetUser: user._id },
                { targetUser: null }
            ]
        }).sort({ createdAt: -1 }).limit(50);

        return NextResponse.json({ success: true, data: notifications }, { status: 200 });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
