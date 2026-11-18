
# FreshPick supplier handbook

## Partner order requests

Visit `/partners` for onboarding, harvest offers, business enquiries or workspace access. Approved suppliers with linked catalogue products receive one supply request for each actual customer order containing their products. The request snapshots only their products, SKUs and quantities; customer contact details and other suppliers' items are not shared. Products with no supplier mapping remain FreshPick-managed. Recurring templates do not generate alerts, but each actual generated order does. Existing historic orders are not backfilled.

In `/dashboard?section=orders`, accept or report unavailable, then mark accepted requests ready. Staff arrange collection and mark ready requests collected in `/admin/supplier-orders`. They can also record a supplier's phone confirmation. All requests must be collected before the order can be shipped or delivered. A cancelled/refunded order closes further supplier actions. Admins can open a WhatsApp draft to contact the supplier; sending it remains a manual action. In-app notifications are generated immediately; verified supplier email alerts enter the existing email outbox and depend on the deployed email worker (`scripts/jobs/run.ts` or the scheduled Netlify function). The partner screen refreshes periodically while visible. Staff record an agreed payment amount and reference only after actual payment and collection; no automatic fund transfer or commission calculation occurs.

Before deploying the feature, run `npm run db:migrate` against the target database and ensure the configured email outbox worker is running. Verify a two-supplier test order and check each account sees only its own lines. Existing inventory reservation still applies; marking a request unavailable does not automatically cancel the customer order. Staff must resolve the exception with the customer.

**Read the complete on-site walkthrough:** [/how-it-works/suppliers](/how-it-works/suppliers). The source of its steps and FAQs is `lib/marketGuides.ts`. FreshPick is a **curated supplier network**, not an instant self-publishing marketplace.

## Weekly harvest offers

Open `/supply` to respond to part of a live buying request or offer another harvest without creating an account. Staff use `/admin/supply` to post demand, propose prices and quantities, record packing, pickup and payment terms, and open WhatsApp drafts. Staff record the grower’s reply before reserving quantity, then record the physical handover. The repeat invitation opens a prefilled, editable offer. These records track procurement only. A handover does not publish stock, trigger a payment or create a customer order.

## Catalogue onboarding

1. **Prepare:** Gather producer/business name, contact details, operating address and product details. Describe quantities, pack sizes, price, stock, seasonality and lead times. For prepared foods, include ingredient, allergen, storage and shelf-life information where applicable.
2. **Register:** Apply at `/auth/signup/supplier?catalogue=1`. A new supplier creates an account first and submits details to `/api/suppliers/register`. An existing signed-in user can apply from the same form. If the account was created but submission fails, retry the application after signing in, **not another account signup**.
3. **Review:** Staff review applications in `/admin/supplier-applications`. Approval and active supplier status gate the catalogue workflow. A pending application is not a product listing.
4. **Commercial agreement:** Agree quality standards, pricing, lead times, packing, pickup/delivery, commissions, settlement, returns and responsibility for losses directly with FreshPick. The platform does **not** establish a standard public payout rate or automatically split and remit payments to suppliers.
5. **Upload catalogue:** In `/dashboard` → Products, download `/templates/product-upload-template.csv`. Submit a CSV or XLSX with SKU, name, price, cost, stock, category, unit and optional images. The supplier upload is **not** publication; administrators review and import products separately.
6. **Monitor:** The supplier dashboard shows linked product/stock exceptions, uploads, sales/order activity and account messages where available. Published catalogue visibility requires valid, non-archived products and stock; coordinate corrections with staff.
7. **Fulfilment:** Customer checkout currently uses cash on delivery. FreshPick operates order records and status. Specific collection, packing, handover, transport, refund and remittance responsibilities must be agreed, not assumed from the dashboard.
8. **Support:** Ask at `/contact?type=question&source=producers` about access, products, applications, orders or commercial matters.

## Frequent questions

- **Can small growers or kitchens apply?** Yes, subject to review.
- **Do I go live once I apply?** No. Approval, activation, catalogue import and product publication are separate stages.
- **Can I upload spreadsheets?** Yes, CSV and XLSX; follow the downloadable CSV template.
- **Who sets the supplier commission?** FreshPick and the supplier should agree it in writing; no standard figure is published.
- **Does the platform automatically send supplier payouts?** No, not by the current feature set.
- **Does the supplier dashboard ship orders independently?** No, it provides linked operational visibility and uploads.

## Maintainer references

`components/auth/SupplierSignupForm.tsx`, `components/supplier/SupplierDashboard.tsx`, `components/supplier/UploadProducts.tsx`, `app/admin/supplier-applications/page.tsx`, `app/admin/supplier-uploads/page.tsx` and `lib/marketGuides.ts`. See [Features](FEATURES.md), [Admin Guide](ADMIN_GUIDE.md) and [Operations](OPERATIONS.md).
