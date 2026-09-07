'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Loader2 } from 'lucide-react';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import ProductGrid from '@/components/products/ProductGrid';

export default function WishlistPage() {
  const { wishlistItems, loading } = useWishlist();
  const { user, loading: authLoading } = useAuth();

  if (authLoading || loading) {
    return <main className="min-h-[70vh] bg-[#f4f5f1] px-5 py-32"><div className="mx-auto flex max-w-6xl items-center gap-3 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading saved food…</div></main>;
  }

  if (!user) {
    return (
      <main className="min-h-[78vh] bg-[#f4f5f1] px-5 py-32 text-zinc-950">
        <section className="mx-auto max-w-3xl rounded-[2rem] border border-zinc-200 bg-white p-10 text-center md:p-14">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-900"><Heart className="h-5 w-5" /></div>
          <span className="mt-6 block text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">Saved for later</span>
          <h1 className="mt-3 font-serif text-5xl font-normal leading-none">Keep your favourites connected.</h1>
          <p className="mx-auto mt-5 max-w-lg text-sm font-light leading-7 text-zinc-500">Sign in to keep products you want to revisit and let those saves become part of your FreshPick recommendations.</p>
          <Link href="/auth/login?redirect=/wishlist" className="mt-7 inline-flex rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-950">Sign in</Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="border-b border-zinc-200 bg-white px-5 pb-12 pt-28 md:px-8 md:pb-14 md:pt-32">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-700"><Heart className="h-3.5 w-3.5" /> Saved</span>
            <h1 className="mt-4 font-serif text-5xl font-normal leading-none tracking-[-0.03em] md:text-7xl">Things worth coming back to.</h1>
            <p className="mt-5 max-w-xl text-sm font-light leading-7 text-zinc-500">Your saved products stay here until you are ready for them—and help FreshPick understand what catches your attention.</p>
          </div>
          <Link href="/discover" className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-zinc-300 bg-white px-5 text-xs font-semibold text-zinc-700 hover:border-emerald-300 hover:text-emerald-800">Discover more <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
        {wishlistItems.length === 0 ? (
          <section className="rounded-[2rem] border border-zinc-200 bg-white p-10 text-center md:p-14">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f4f5f1] text-zinc-400"><Heart className="h-5 w-5" /></div>
            <h2 className="mt-6 font-serif text-4xl font-normal">Nothing saved yet.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm font-light leading-7 text-zinc-500">Save something from the market when it looks worth another look, or start from a recipe and discover ingredients that way.</p>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href="/discover" className="rounded-full bg-zinc-950 px-6 py-3 text-xs font-semibold text-white hover:bg-emerald-950">Open Discover</Link>
              <Link href="/products" className="rounded-full border border-zinc-300 px-6 py-3 text-xs font-semibold text-zinc-700">Browse Market</Link>
            </div>
          </section>
        ) : (
          <section>
            <div className="mb-7 flex items-end justify-between gap-5 border-b border-zinc-300 pb-5">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-emerald-700">Your edit</p>
                <h2 className="mt-2 font-serif text-3xl font-normal">{wishlistItems.length} saved item{wishlistItems.length === 1 ? '' : 's'}</h2>
              </div>
              <Link href="/for-you" className="text-xs font-semibold text-emerald-800">See For You</Link>
            </div>
            <ProductGrid products={wishlistItems} />
          </section>
        )}
      </div>
    </main>
  );
}
