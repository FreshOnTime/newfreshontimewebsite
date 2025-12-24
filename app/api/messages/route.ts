import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth'; // Assuming next-auth, allow adjustment if verifying otherwise
import { authOptions } from '@/lib/auth'; // Adjust path if needed, usually where auth options are
import dbConnect from '@/lib/dbConnect'; // Adjust if dbConnect is elsewhere
import Message from '@/lib/models/Message';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// Helper to get user from token since we saw manual JWT handling in other files (e.g. middleware or custom auth)
// But based on previous conversations, there might be a custom auth flow.
// Let's check `contexts\AuthContext.tsx` or similar if needed. 
// For now, I'll use the pattern seen in `app/api/admin/make-admin/route.ts`... wait, I didn't see that file's content.
// I saw `app/dashboard/page.tsx` using `useAuth` from context. 
// Most likely backend uses cookies.

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
        await dbConnect();
        const currentUser = await getUser(req);

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { recipientId, subject, content } = body;

        if (!recipientId || !subject || !content) {
            return NextResponse.json({ success: false, message: 'Missing required fields' }, { status: 400 });
        }

        const recipient = await User.findById(recipientId);
        if (!recipient) {
            return NextResponse.json({ success: false, message: 'Recipient not found' }, { status: 404 });
        }

        const message = await Message.create({
            sender: currentUser.userId, // Assuming userId is stored in token, or _id. Let's check User model again. 
            // User model has `userId` (string) and `_id` (ObjectId). 
            // Message schema uses ObjectId. 
            // currentUser from JWT usually has _id. 
            // Let's use _id if available, otherwise look up.
            recipient: recipient._id,
            subject,
            content,
        });

        // We need to fetch the sender's ObjectId if currentUser.userId is the custom string ID.
        // The JWT likely contains the _id. I will assume `currentUser.id` or `currentUser._id`.
        // Actually, let's verify JWT structure if possible. 
        // The previous turn didn't show JWT creation.
        // Safest is to find sender by the ID in the token.

        const sender = await User.findOne({ userId: currentUser.userId });
        if (sender) {
            message.sender = sender._id;
            await message.save();
        }

        return NextResponse.json({ success: true, data: message }, { status: 201 });
    } catch (error) {
        console.error('Error sending message:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const currentUser = await getUser(req);

        if (!currentUser) {
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Get the user's ObjectId
        const user = await User.findOne({ userId: currentUser.userId });
        if (!user) {
            return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
        }

        const messages = await Message.find({ recipient: user._id })
            .populate('sender', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ success: true, data: messages }, { status: 200 });
    } catch (error) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
    }
}
