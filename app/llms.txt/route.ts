const SITE_URL = "https://freshpick.lk";

const llmsText = `# Fresh Pick Sri Lanka

Fresh Pick is a Colombo, Sri Lanka-based online food service bringing fresh groceries, homemade favourites, cooked meals, and recurring delivery into one order.

## Core pages
- Home: ${SITE_URL}
- Products: ${SITE_URL}/products
- B2B supply: ${SITE_URL}/b2b
- Subscriptions: ${SITE_URL}/subscriptions
- Farm to table: ${SITE_URL}/farm-to-table
- Homemade: ${SITE_URL}/homemade
- Meals on Deals: ${SITE_URL}/meals
- Meal kits: ${SITE_URL}/meal-kits

## What Fresh Pick offers
Fresh Pick helps households, restaurants, hotels, offices, cafes, and premium residences source fresh groceries and produce in Colombo.

Key services include:
- Fresh grocery delivery in Colombo
- Recurring weekly household grocery plans
- Cooked-food ordering and recurring meal deliveries
- Homemade and small-batch products from Sri Lankan food makers
- One-basket ordering for groceries and meals
- B2B fresh produce supply for restaurants, hotels, offices, and cafes
- Farmer-first sourcing and harvest coordination
- Farm-to-table produce selection
- Same-day and planned delivery support where available

## Service areas
Fresh Pick focuses on Colombo and nearby areas such as Rajagiriya, Battaramulla, Nawala, Nugegoda, Dehiwala, Mount Lavinia, Kollupitiya, Bambalapitiya, Cinnamon Gardens, and Havelock Town.

## Contact
General concierge: concierge@freshpick.lk
B2B supply requests: b2b@freshpick.lk
`;

export function GET() {
    return new Response(llmsText, {
        headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600, s-maxage=86400",
        },
    });
}
