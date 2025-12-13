'use client';

import { useWishlist } from "@/contexts/WishlistContext"; // Assuming this is where it is
import { PageContainer } from "@/components/templates/PageContainer"; // Assuming PageContainer exists
import SectionHeader from "@/components/home/SectionHeader"; // Assuming SectionHeader exists
import ProductGrid from "@/components/products/ProductGrid"; // Assuming ProductGrid exists
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

export default function WishlistPage() {
    const { wishlistItems, loading } = useWishlist();
    const { user, loading: authLoading } = useAuth();

    if (authLoading || loading) {
        return (
            <PageContainer>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
                </div>
            </PageContainer>
        );
    }

    if (!user) {
        return (
            <PageContainer>
                <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                    <h2 className="text-2xl font-bold font-serif text-gray-900">Please Login</h2>
                    <p className="text-gray-500 max-w-md">You need to be logged in to view your wishlist.</p>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/auth/login">Login Now</Link>
                    </Button>
                </div>
            </PageContainer>
        );
    }

    if (wishlistItems.length === 0) {
        return (
            <PageContainer>
                <SectionHeader title="My Wishlist" subtitle="Your saved items" />
                <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/50 p-12 mt-8">
                    <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                        <span className="text-2xl">❤️</span>
                    </div>
                    <h3 className="text-xl font-medium text-gray-900">Your wishlist is empty</h3>
                    <p className="text-gray-500 max-w-md">Start exploring our fresh products and save your favorites here!</p>
                    <Button asChild variant="outline" className="mt-4">
                        <Link href="/">Browse Products</Link>
                    </Button>
                </div>
            </PageContainer>
        );
    }

    return (
        <PageContainer>
            <SectionHeader title="My Wishlist" subtitle={`${wishlistItems.length} items saved`} />
            <div className="mt-8">
                <ProductGrid products={wishlistItems} />
            </div>
        </PageContainer>
    );
}
