import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Wishlist from '@/lib/models/Wishlist';
import Product from '@/lib/models/Product';
// import { verifyAuth } from '@/lib/auth/verifyAuth'; // Assuming you have some auth verification helper, or we rely on client sending userId for now based on BagContext pattern.
// Based on BagContext, it seems we might fetch by userId query param or rely on session.
// Looking at BagContext: fetch(`/api/bags?userId=${userId}`)
// So I will follow that pattern for GET, but for POST maybe body.

// Ideally we should extract user from token/session.
// For now, I'll assume we pass userId in query or body to match existing patterns if any, 
// but best practice is getting it from the request headers/cookies.
// Let's implement getting userId from the request body or query param for now, 
// assuming the client sends it, similar to BagContext usage.

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get userId from query param
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        let wishlist = await Wishlist.findOne({ user: userId }).populate({
            path: 'products',
            model: Product, // Explicitly model to ensure correct population
            select: 'name image pricePerBaseQuantity measurementType discountPercentage isOutOfStock stockQuantity slug brand', // Select fields needed for card
            populate: { path: 'brand', select: 'name' }
        });

        if (!wishlist) {
            return NextResponse.json({ success: true, data: [] });
        }

        return NextResponse.json({ success: true, data: wishlist.products });
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch wishlist' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const { userId, productId } = body;

        console.log('Wishlist POST received:', { userId, productId, body });

        if (!userId) {
            return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
        }

        if (!productId) {
            return NextResponse.json({ success: false, error: 'Product ID is required' }, { status: 400 });
        }

        let wishlist = await Wishlist.findOne({ user: userId });

        if (!wishlist) {
            wishlist = new Wishlist({ user: userId, products: [] });
        }

        // Check if product already exists
        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        return NextResponse.json({ success: true, message: 'Product added to wishlist' });
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        return NextResponse.json({ success: false, error: 'Failed to add to wishlist' }, { status: 500 });
    }
}
