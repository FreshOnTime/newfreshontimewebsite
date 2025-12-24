import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        await dbConnect();
        const currentUser = await getUser(req);
        // await params
        const { id } = await params;

        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const message = await Message.findById(id);
        if (!message) {
            return NextResponse.json({ success: false, message: 'Message not found' }, { status: 404 });
        }

        // Verify recipient matches current user
        const user = await User.findOne({ userId: currentUser.userId });
        if (!user || message.recipient.toString() !== user._id.toString()) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
        }

        message.isRead = true;
        await message.save();

        return NextResponse.json({ success: true, data: message }, { status: 200 });
    } catch (error) {
        console.error('Error updating message:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
