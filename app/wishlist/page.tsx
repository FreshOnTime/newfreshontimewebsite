'use client';

import Link from 'next/link';
import { useWishlist } from '@/contexts/WishlistContext';
import { useAuth } from '@/contexts/AuthContext';
import ProductGrid from '@/components/products/ProductGrid';
import { AccountPage, AccountState, AccountLoading, accountButton, accountSecondaryButton } from '@/components/account/AccountPage';

export default function WishlistPage() {
  const { wishlistItems, loading, error, retry } = useWishlist();
  const { user, loading: authLoading } = useAuth();
  return (
    <AccountPage title="Wishlist" description="Your saved products, ready when you are." action={<Link href="/products" className={accountSecondaryButton}>Shop the market</Link>}>
      {authLoading || loading ? <AccountLoading label="Loading your wishlist…" /> : !user ? (
        <AccountState title="Save your favourites" description="Sign in to keep your wishlist across visits." action={<Link href="/auth/login?redirect=/wishlist" className={accountButton}>Sign in</Link>} />
      ) : error ? (
        <>
          <AccountState error title="Couldn’t load your wishlist" description={error} action={<button type="button" onClick={() => void retry()} className={accountSecondaryButton}>Try again</button>} />
          {wishlistItems.length > 0 && <div className="mt-8"><ProductGrid products={wishlistItems} /></div>}
        </>
      ) : wishlistItems.length === 0 ? (
        <AccountState title="No saved products yet" description="Tap the heart on a product to save it here." action={<Link href="/products" className={accountButton}>Shop the market</Link>} />
      ) : (
        <section aria-label="Saved products">
          <p className="mb-6 text-sm text-muted-foreground">{wishlistItems.length} saved {wishlistItems.length === 1 ? 'product' : 'products'}</p>
          <ProductGrid products={wishlistItems} />
        </section>
      )}
    </AccountPage>
  );
}
