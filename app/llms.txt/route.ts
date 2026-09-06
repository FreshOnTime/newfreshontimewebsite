import { SERVICE_AREAS, SITE_URL, SUPPORT_EMAIL } from '@/lib/config/site';

const llmsText = `# Fresh Pick Sri Lanka

Fresh Pick is a Colombo, Sri Lanka-based online food service bringing fresh groceries, homemade favourites, cooked meals, and recurring delivery into one order.

## Core pages
- Home: ${SITE_URL}
- Products: ${SITE_URL}/products
- Supplier partnerships and onboarding: ${SITE_URL}/b2b
- Subscriptions: ${SITE_URL}/subscriptions
- Farm to table: ${SITE_URL}/farm-to-table
- Homemade: ${SITE_URL}/homemade
- Meals on Deals: ${SITE_URL}/meals
- Meal kits: ${SITE_URL}/meal-kits

## What Fresh Pick offers
Fresh Pick serves food shoppers while building a curated partnership network with growers, makers, producers, distributors, and business buyers in Sri Lanka.

Key services and partnership areas include:
- Fresh grocery delivery in Colombo
- Recurring weekly household grocery plans
- Cooked-food ordering and recurring meal deliveries
- Homemade and small-batch products from Sri Lankan food makers
- One-basket ordering for groceries and meals
- Curated supplier onboarding for farms, growers, makers, brands, distributors, and importers
- Business supply partnerships for restaurants, hotels, offices, cafes, and other organisations
- Farmer-first sourcing and harvest coordination
- Farm-to-table produce selection
- Same-day and planned delivery support where available

Fresh Pick is not presented as an open supplier marketplace. Supplier and partnership applications are reviewed for product fit, quality, consistency, commercial suitability, and operational readiness before onboarding.

## Service areas
Fresh Pick currently focuses on ${SERVICE_AREAS.join(', ')}.

## Contact
General concierge: ${SUPPORT_EMAIL}
Partnership applications: ${SITE_URL}/b2b#apply
`;

export function GET() {
    return new Response(llmsText, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
