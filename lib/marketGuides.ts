
export type Guide = {
  label: string; title: string; intro: string; caution: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  steps: { id: string; title: string; summary: string; details: string[]; action: { label: string; href: string } }[];
  faqs: { question: string; answer: string }[];
};

/** Keep copy aligned with actual application behavior, not proposed features. */
export const customerGuide: Guide = {
  label: 'Customer walkthrough',
  title: 'Your food, from the market to your door.',
  intro: 'FreshPick lets you discover local food, save a bag, arrange an order and follow the order from your account. This is the complete journey through the current website.',
  caution: 'Availability, delivery eligibility, pricing and timing depend on the live catalogue, configured service areas and order confirmation. This guide is not a guarantee of a particular product or delivery slot.',
  primary: { label: 'Browse the market', href: '/products' },
  secondary: { label: 'Ask customer care', href: '/contact?type=question&source=support' },
  steps: [
    { id: 'browse', title: 'Browse and compare products', summary: 'Start with shop, categories, deals or curated collections.', details: [
      'The product catalogue shows current descriptions, prices, units and available inventory.',
      'Categories help you find products; collections are editorial selections, not pre-reserved stock.',
      'Prices and availability can change. Check current details before you add items to a bag.'
    ], action: { label: 'Explore products', href: '/products' } },
    { id: 'account', title: 'Create or access your account', summary: 'Sign in to save bags, checkout and see your order history.', details: [
      'Explore freely without signing in, then register as a customer when you want to order.',
      'Use your real name, recipient contact number and address to avoid delivery problems.',
      'Your profile and saved addresses can be managed from your signed-in account.'
    ], action: { label: 'Create customer account', href: '/auth/signup/customer' } },
    { id: 'bag', title: 'Build a reusable shopping bag', summary: 'Choose quantities, review your selections and save your regular food list.', details: [
      'Bags contain products and quantities; your wishlist is a separate collection of saved products.',
      'Review quantities before checkout, especially after revisiting an older saved bag.',
      'The server recalculates stock, discounts and prices before an order is placed.'
    ], action: { label: 'Open saved bags', href: '/bags' } },
    { id: 'checkout', title: 'Confirm your cash-on-delivery order', summary: 'Review the delivery address, the order quote and charges before submitting.', details: [
      'Checkout requires a complete delivery address and a supported service area.',
      'The current website supports cash on delivery (COD) in Sri Lankan rupees, not card charging.',
      'If stock, price or address eligibility has changed, adjust your bag and review the new quote.'
    ], action: { label: 'Learn about delivery', href: '/help' } },
    { id: 'order', title: 'Track the order in your account', summary: 'FreshPick operations manage confirmation, fulfilment and delivery status.', details: [
      'See your order reference, items and recorded order status in the account order pages.',
      'A tracking reference or order status is not a live courier GPS service.',
      'For a missed delivery, incorrect address or stock question, contact FreshPick with the order number.'
    ], action: { label: 'Your orders', href: '/orders' } },
    { id: 'repeat', title: 'Set up a recurring basket if you prefer', summary: 'Explore available weekly, fortnightly or monthly plans.', details: [
      'A recurring basket uses the plan price and frequency displayed when you subscribe.',
      'The system supports manual and stock-managed fulfilment modes; it never automatically charges a card.',
      'You can pause, resume, skip a future date or cancel; already queued deliveries may need staff assistance.'
    ], action: { label: 'Explore recurring baskets', href: '/subscriptions' } },
    { id: 'aftercare', title: 'Get support, returns or replacement advice', summary: 'Contact the team if something in an order needs attention.', details: [
      'Include an order number, issue summary and supporting photos for damaged items when possible.',
      'The refund policy describes the 24-hour perishables reporting window and 7-day eligible packaged-item window.',
      'The team handles COD payment adjustments and refund arrangements; no automated card refund exists.'
    ], action: { label: 'Returns and refunds', href: '/refund' } },
  ],
  faqs: [
    { question: 'Do I need an account to browse?', answer: 'No. Browsing is public, but checkout and saved account features require signing in.' },
    { question: 'Can I pay online by card?', answer: 'No. Website checkout currently supports cash on delivery in LKR.' },
    { question: 'Is delivery available throughout Sri Lanka?', answer: 'No. FreshPick operates in supported locations in and around Colombo. Confirm coverage and costs at checkout or through the team.' },
    { question: 'What if my saved item is out of stock?', answer: 'The final server quote checks inventory and pricing again. You may need to remove or reduce unavailable items.' },
    { question: 'Are recurring baskets automatically billed?', answer: 'No. Subscription orders use COD; there is no automatic recurring card payment.' },
    { question: 'What if an order is missing or damaged?', answer: 'Use the contact page with your order reference and check the published refund policy for reporting windows.' },
  ],
};

export const supplierGuide: Guide = {
  label: 'Supplier walkthrough',
  title: 'From your first application to the FreshPick market.',
  intro: 'Growers, makers and distributors can apply to supply FreshPick. Applications, supplier activation, catalogue import and public product publishing are separate steps.',
  caution: 'FreshPick reviews each supplier relationship. Registration and catalogue upload do not guarantee approval, publication, sales, payment settlement or delivery obligations. Agree prices, commissions, logistics and payout terms directly with the team.',
  primary: { label: 'Apply as a supplier', href: '/auth/signup/supplier' },
  secondary: { label: 'Ask the supplier team', href: '/contact?type=question&source=producers' },
  steps: [
    { id: 'prepare', title: 'Prepare your business and product information', summary: 'Start with your supply capability, business details and accurate product information.', details: [
      'Prepare your producer or business name, contact details, location and a short product list.',
      'Record pack sizes, indicative pricing, quantities, seasonality, stock and supply lead times.',
      'For packaged or prepared food, include ingredients, allergens, storage and shelf life when relevant.'
    ], action: { label: 'Who can supply FreshPick?', href: '/farm-to-table' } },
    { id: 'apply', title: 'Register and submit your supplier application', summary: 'Create a supplier login or finish the application using an existing signed-in account.', details: [
      'The application collects operating address, primary contact and the products you can supply.',
      'Optional product notes can include one product per line and expected quantities.',
      'If login creation succeeded but the application failed, sign in and retry the application; do not make a duplicate account.'
    ], action: { label: 'Start supplier registration', href: '/auth/signup/supplier' } },
    { id: 'approval', title: 'Application review and commercial discussion', summary: 'FreshPick administrators review the details before supplier tools are activated.', details: [
      'A pending or inactive supplier cannot assume catalogue publishing access.',
      'Expect questions about product quality, supply capacity, pricing, food handling and packaging.',
      'Agree any commission, delivery responsibility, returns, invoicing and settlement terms directly with FreshPick.'
    ], action: { label: 'Ask about approval', href: '/contact?type=question&source=producers' } },
    { id: 'upload', title: 'Submit a catalogue for administrator review', summary: 'Approved and active suppliers can submit CSV or XLSX product files in their workspace.', details: [
      'Open Dashboard → Products and download the existing CSV product-upload template.',
      'Complete SKU, product name, selling price, stock, unit, category and other appropriate details.',
      'Uploading submits data for administrative review and import. It does not publish products immediately.'
    ], action: { label: 'Open supplier dashboard', href: '/dashboard' } },
    { id: 'catalogue', title: 'Review imported products and availability', summary: 'The supplier dashboard shows imported products and stock-related activity.', details: [
      'After an administrator imports products, check displayed details and stock where available.',
      'Archived, unpublished or out-of-stock products should not be advertised as available.',
      'Report corrections or changes of availability to FreshPick operations.'
    ], action: { label: 'Browse the market', href: '/products' } },
    { id: 'orders', title: 'Coordinate fulfilment and customer orders', summary: 'FreshPick manages customer-facing orders and the checkout lifecycle.', details: [
      'Customers place COD orders with FreshPick; the website does not automatically split or remit payments to suppliers.',
      'Supplier dashboards surface operational metrics, but are not independent shipping or payout services.',
      'Packing, collection, delivery and dispute responsibilities must be agreed for the specific supplier arrangement.'
    ], action: { label: 'Contact producer support', href: '/contact?type=question&source=producers' } },
    { id: 'ongoing', title: 'Keep information and communication up to date', summary: 'Monitor stock exceptions, uploads, messages and supply constraints.', details: [
      'Review any low-stock products or upload issues in the workspace.',
      'Share seasonal changes, delays, inaccurate listings or product safety issues promptly.',
      'Use the supplier contact route for access, payment-term or business disputes.'
    ], action: { label: 'Ask the FreshPick team', href: '/contact?type=question&source=producers' } },
  ],
  faqs: [
    { question: 'Can small producers apply?', answer: 'Yes. Home growers and independent makers may apply, but applications are reviewed individually.' },
    { question: 'Am I approved when I register?', answer: 'No. Registration and submission start the review; an approved, active supplier record is required for the full catalogue workflow.' },
    { question: 'Do uploaded products go live immediately?', answer: 'No. Administrators review and import the catalogue; product availability and publishing status are separate.' },
    { question: 'Can I upload Excel?', answer: 'The supplier screen accepts CSV and XLSX. Use the provided CSV template for the expected column structure.' },
    { question: 'What is the commission or payout schedule?', answer: 'There is no universal public figure in the website. Confirm a written commercial arrangement with the supplier team.' },
    { question: 'Who delivers customer orders?', answer: 'FreshPick handles customer-facing order records. Physical handover, transport, returns and settlement responsibilities depend on agreed supplier arrangements.' },
  ],
};
