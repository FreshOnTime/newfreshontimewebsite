import { NextResponse } from 'next/server';
import { loadStorefrontHome } from '@/lib/storefrontData';

export const revalidate = 300;

export async function GET() {
  try {
    const data = await loadStorefrontHome();
    return NextResponse.json(
      data,
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch (error) {
    console.error('[Storefront Home API] Failed to fetch homepage data:', error);
    return NextResponse.json({ products: [], categories: [] }, { status: 500 });
  }
}
