import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/lib/models/Wishlist';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ productId: string }> } // Await params in Next.js 15
) {
    try {
        await connectDB();

        // In Next 15 params is a Promise
        const { productId } = await params;

        // We need userId. Since this is a DELETE on a resource, usually we'd expect userId in body or auth.
        // However, DELETE requests typically shouldn't have a body. 
        // So we'll get userId from query param for consistency with other simple implementations here.
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        if (!productId) {
            return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        const wishlist = await Wishlist.findOne({ user: userId });

        if (wishlist) {
            wishlist.products = wishlist.products.filter((id: any) => id.toString() !== productId);
            await wishlist.save();
        }

        return NextResponse.json({ success: true, message: 'Product removed from wishlist' });
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        return NextResponse.json({ success: false, error: 'Failed to remove from wishlist' }, { status: 500 });
    }
}
