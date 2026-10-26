import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { CheckoutError, prepareCheckout } from '@/lib/checkoutService';
import { DeliveryPolicyError } from '@/lib/deliveryPolicy';
import { extractShoppingTerms, hasUnverifiableDietaryConstraint, proposeShoppingBag } from '@/lib/agents/shoppingPlan';

export const dynamic = 'force-dynamic';

const input = z.object({
  query: z.string().trim().min(3).max(300),
  budgetLkr: z.number().finite().min(10).max(500000),
  maxItems: z.number().int().min(1).max(10).default(6),
}).strict();

const privateHeaders = { 'Cache-Control': 'private, no-store' };

export const POST = requireAuth(async (request: NextRequest) => {
  try {
    const body = await request.json().catch(() => null);
    const parsed = input.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter a shopping request, an LKR budget and up to 10 items.' },
        { status: 400, headers: privateHeaders });
    }
    const { query, budgetLkr, maxItems } = parsed.data;
    if (hasUnverifiableDietaryConstraint(query)) {
      return NextResponse.json({
        error: 'This assistant cannot verify allergies or ingredient exclusions yet. Please select products and inspect their labels manually.',
      }, { status: 422, headers: privateHeaders });
    }

    const terms = extractShoppingTerms(query);
    const where: Prisma.ProductWhereInput = {
      archived: false,
      stockQty: { gt: 0 },
      ...(terms.length ? {
        OR: terms.flatMap((term) => [
          { name: { contains: term, mode: 'insensitive' as const } },
          { sku: { contains: term, mode: 'insensitive' as const } },
          { description: { contains: term, mode: 'insensitive' as const } },
        ]),
      } : {}),
    };
    // Bound every DB query. Broad requests select from a limited catalogue slice;
    // the response is explicitly a suggestion, never a complete nutrition plan.
    const products = await prisma.product.findMany({
      where,
      select: {
        id: true, name: true, sku: true, description: true,
        price: true, discountPercentage: true, stockQty: true,
      },
      orderBy: { name: 'asc' },
      take: 120,
    });
    const proposal = proposeShoppingBag(products, terms, budgetLkr, maxItems);
    if (!proposal.items.length) {
      return NextResponse.json({
        success: true,
        data: { items: [], quote: null, budgetLkr, mode: 'catalogue-guided',
          message: proposal.matched
            ? 'No available combination fits the budget and current delivery policy.'
            : 'No in-stock products matched. Try specific product names.' },
      }, { headers: privateHeaders });
    }

    // A live checkout quote, not model arithmetic, is the final authority.
    const { quote } = await prepareCheckout(
      proposal.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    );
    if (quote.total > budgetLkr) {
      return NextResponse.json({ error: 'Catalogue prices changed. Generate a fresh bag to stay within your budget.' },
        { status: 409, headers: privateHeaders });
    }
    return NextResponse.json({
      success: true,
      data: {
        items: quote.items.map((item) => ({
          ...item,
          sku: proposal.items.find((candidate) => candidate.productId === item.productId)?.sku || '',
          unitPrice: item.price,
          lineTotal: item.total,
        })),
        quote, budgetLkr, mode: 'catalogue-guided',
        message: 'Suggestions use currently listed products. Confirm the items and review the price again at checkout.',
      },
    }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof CheckoutError || error instanceof DeliveryPolicyError) {
      return NextResponse.json({ error: error.message },
        { status: error.status, headers: privateHeaders });
    }
    console.error('[Shopping assistant] Planning failed', error);
    return NextResponse.json({ error: 'Could not prepare a shopping bag. Please try again.' },
      { status: 500, headers: privateHeaders });
  }
});
