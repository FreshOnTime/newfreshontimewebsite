
# FreshPick customer handbook

**Read the complete on-site walkthrough:** [/how-it-works/customers](/how-it-works/customers). The source of the on-site steps and FAQs is `lib/marketGuides.ts`. This handbook explains the operational boundaries and supporting pages.

## Customer journey

1. **Browse:** Visit `/products`, `/categories`, `/deals` and `/collections`. Browse current stock, unit information and prices. Collections are editorial and do not reserve products.
2. **Account:** Sign up at `/auth/signup/customer`, or sign in. An account is required at checkout. Manage profile and saved delivery address at `/profile`.
3. **Save items:** Create a grocery bag at `/bags`. A saved bag is different from `/wishlist`. Saved prices are not an accepted checkout quote.
4. **Checkout:** Review quantities, recipient details, address, delivery fee and current LKR totals. FreshPick recalculates product stock and prices on the server. **Payment is cash on delivery (COD); no website card charge is implemented.**
5. **Fulfilment:** View orders at `/orders` and individual order pages. FreshPick operations handle order confirmations and delivery states; there is no live GPS courier service.
6. **Recurring baskets:** Select an available plan at `/subscriptions`, then manage pause/resume/skip/cancel at `/profile/subscriptions`. Plans may be weekly, fortnightly or monthly. Automatic card billing is not implemented. An already queued delivery might require separate staff intervention.
7. **Help:** Use `/help`, `/contact?type=issue&source=support` or `/refund`. Contact submissions are stored in the team's enquiry inbox; submitting does not automatically send a staff reply. Retain the order number and photo evidence.

## Delivery and pricing

Orders depend on supported areas around Colombo, valid address and contact data, live product stock and approved delivery fee configuration. A quoted delivery date is not a universal guaranteed time. If quantities, stock or charges change, revise the bag before placement. Ordering for another person requires a valid recipient phone and confirmed COD arrangement.

## Reporting issues and payment adjustments

The published returns page describes reporting perishables issues within 24 hours of delivery and eligible unopened packaged goods within 7 days. FreshPick reviews each request. Cash-on-delivery payment adjustments or refunds are arranged with the team. There is no card-provider, automatic supplier-split or instant-refund capability.

## Common questions

- **Can I browse anonymously?** Yes, but you need an account to order.
- **Does every area in Sri Lanka qualify for delivery?** No. Check service areas and delivery details before ordering.
- **Does a basket reserve stock?** A saved bag does not guarantee stock. Checkout validates again.
- **Are regular plans charged to a card?** No. COD is the current payment mechanism.
- **Is order status live courier tracking?** No, it represents the recorded order lifecycle.

## Maintenance

Update this handbook and the on-site `lib/marketGuides.ts` content whenever checkout, delivery policy or subscription behavior changes. Also review [Subscriptions](SUBSCRIPTIONS.md), [Features](FEATURES.md) and [Operations](OPERATIONS.md).
