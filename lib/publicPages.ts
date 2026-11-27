import { pageMetadata } from '@/lib/seo';

/** Canonical public pages shared by metadata and the XML sitemap. */
export const PUBLIC_PAGES = [
  { path: '/', title: 'Discover Sri Lankan food makers | FreshPick', description: 'Meet bakers, home cooks and growers across Sri Lanka. Explore their food, read their stories and contact them directly.' },
  { path: '/products', title: 'Shop groceries in Colombo', description: 'Browse FreshPick produce, pantry essentials and everyday groceries. Check current prices and availability in the market.' },
  { path: '/categories', title: 'Shop by category', description: 'Explore FreshPick grocery categories, from fresh produce to pantry essentials for your Colombo kitchen.' },
  { path: '/deals', title: 'Grocery offers', description: 'Browse currently discounted FreshPick groceries and check the latest prices and availability.' },
  { path: '/makers', title: 'Fresh near you', description: 'Discover local bakers, cooks, growers and food makers. Explore their latest batches and get in touch directly.' },
  { path: '/discover', title: 'Discover Sri Lankan food', description: 'Explore independent food makers, restaurants, cafés and products.' },
  { path: '/eat-drink', title: 'Eat and drink', description: 'Discover reviewed restaurants, cafés and caterers in Sri Lanka.' },
  { path: '/food-products', title: 'Food products', description: 'Explore independent producers and food products.' },
  { path: '/gifting', title: 'Food gifting', description: 'Discover makers for food gifts and celebrations.' },
  { path: '/food-tools', title: 'Food tools', description: 'Estimate dining bills and compare food unit prices.' },
  { path: '/for-businesses', title: 'For food businesses', description: 'Introduce your food business to FreshPick.' },
  { path: '/collections', title: 'Food collections', description: 'Explore FreshPick food collections for different meals, occasions and everyday routines.' },
  { path: '/blog', title: 'The FreshPick blog', description: 'Explore the FreshPick editorial archive of local food guides, pantry ideas and market stories.' },
  { path: '/subscriptions', title: 'Recurring grocery baskets', description: 'Explore FreshPick recurring baskets and available plans for regular grocery deliveries in Colombo.' },
  { path: '/meals', title: 'Ready meals in Colombo', description: 'Browse currently available FreshPick cooked food and explore recurring meal delivery options.' },
  { path: '/homemade', title: 'Local kitchens and homemade food', description: 'Browse FreshPick homemade food and products from independent Sri Lankan makers.' },
  { path: '/diaspora', title: 'Order for family in Sri Lanka', description: 'Shop for family or friends in supported Colombo delivery areas. Confirm delivery arrangements and payment before ordering.' },
  { path: '/b2b', title: 'FreshPick for business and supplier partnerships', description: 'Explore food sourcing for restaurants and workplaces, and supplier opportunities for Sri Lankan growers, food makers, brands and distributors. Learn how to apply to join FreshPick.' },
  { path: '/about', title: 'About FreshPick', description: 'Meet the people behind FreshPick and discover independent Sri Lankan food makers.' },
  { path: '/contact', title: 'Contact FreshPick', description: 'Get help with your account, a listing, a maker page or a previous FreshPick order.' },
  { path: '/how-it-works', title: 'How FreshPick works', description: 'Learn to discover local food, contact a maker or publish your own items and stories.' },
  { path: '/how-it-works/customers', title: 'Customer guide: shopping with FreshPick', description: 'How to browse, create bags, check out with cash on delivery, manage recurring baskets and get support.' },
  { path: '/how-it-works/suppliers', title: 'Supplier guide: joining FreshPick', description: 'Supplier applications, review, catalogue upload, product publishing and operational responsibilities.' },
  { path: '/help', title: 'FreshPick help', description: 'Get answers about discovering makers, publishing food stories and contacting makers on WhatsApp.' },
  { path: '/help-us', title: 'Share feedback with FreshPick', description: 'Report a FreshPick issue or share an idea to improve your experience with local makers.' },
  { path: '/refund', title: 'Refund and replacement policy', description: 'Get support with a previous FreshPick checkout order or contact a maker about a direct purchase.' },
  { path: '/privacy', title: 'Privacy policy', description: 'How FreshPick handles personal information used for accounts, orders, delivery and customer support.' },
  { path: '/terms', title: 'Terms of service', description: 'Terms for FreshPick accounts, ordering, delivery and related services.' },
  { path: '/cookies', title: 'Cookie policy', description: 'How FreshPick uses sign-in cookies, browser storage and optional analytics.' },
  { path: '/site-map', title: 'Site map', description: 'Find local makers, food stories, support and account pages.' },
  { path: '/landing', title: 'Welcome to FreshPick', description: 'Shop the FreshPick market as a customer or learn how to apply as a supplier.' },
] as const;

/** Search intent groups, chosen for the actual content rather than keyword stuffing. */
const SEARCH_TERMS: Record<string, readonly string[]> = {
  '/': ['FreshPick', 'food makers Sri Lanka', 'local bakeries Sri Lanka'],
  '/products': ['groceries Colombo', 'fresh vegetables', 'online grocery shopping Sri Lanka'],
  '/categories': ['grocery categories', 'fresh produce Colombo', 'pantry staples'],
  '/subscriptions': ['recurring grocery baskets', 'weekly grocery shopping Colombo'],
  '/b2b': ['food supply partnerships Sri Lanka', 'business food sourcing Colombo', 'Sri Lankan food suppliers', 'home growers', 'sell food online'],
  '/about': ['about FreshPick', 'local food market Colombo'],
  '/contact': ['contact FreshPick', 'FreshPick customer support'],
  '/help': ['maker page support', 'food maker enquiries'],
  '/how-it-works': ['FreshPick how it works', 'fresh food business model Sri Lanka'],
  '/how-it-works/customers': ['FreshPick ordering guide', 'customer delivery guide'],
  '/how-it-works/suppliers': ['FreshPick supplier onboarding', 'sell food with FreshPick'],
  '/blog': ['grocery guides Sri Lanka', 'Colombo food shopping tips'],
  '/diaspora': ['groceries for family in Sri Lanka', 'Colombo grocery delivery'],
};

export function publicPageMetadata(path: string) {
  const page = PUBLIC_PAGES.find(page => page.path === path);
  if (!page) throw new Error(`No public page metadata for ${path}`);
  return pageMetadata({ ...page, keywords: SEARCH_TERMS[path] });
}
