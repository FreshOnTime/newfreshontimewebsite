const SITE_URL = "https://freshpick.lk";

const llmsText = `# Fresh Pick Sri Lanka

Fresh Pick is a fresh grocery delivery and produce supply service in Colombo, Sri Lanka.

## Core pages
- Home: ${SITE_URL}
- Products: ${SITE_URL}/products
- B2B supply: ${SITE_URL}/b2b
- Subscriptions: ${SITE_URL}/subscriptions
- Farm to table: ${SITE_URL}/farm-to-table
- Homemade: ${SITE_URL}/homemade
- Meal kits: ${SITE_URL}/meal-kits

## What Fresh Pick offers
Fresh Pick helps households, restaurants, hotels, offices, cafes, and premium residences source fresh groceries and produce in Colombo.

Key services include:
- Fresh grocery delivery in Colombo
- Recurring weekly household grocery plans
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
