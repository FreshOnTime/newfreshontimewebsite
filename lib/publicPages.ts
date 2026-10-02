import { pageMetadata } from '@/lib/seo';

/** Canonical public pages shared by metadata and the XML sitemap. */
export const PUBLIC_PAGES = [
  { path: '/', title: 'Fresh groceries and local food in Colombo | FreshPick', description: 'Shop fresh groceries, explore recipes and discover local food with FreshPick in Colombo, Sri Lanka.' },
  { path: '/products', title: 'Shop groceries in Colombo', description: 'Browse FreshPick produce, pantry essentials and everyday groceries. Check current prices and availability in the market.' },
  { path: '/categories', title: 'Shop by category', description: 'Explore FreshPick grocery categories, from fresh produce to pantry essentials for your Colombo kitchen.' },
  { path: '/deals', title: 'Grocery offers', description: 'Browse currently discounted FreshPick groceries and check the latest prices and availability.' },
  { path: '/discover', title: 'Discover food in Colombo', description: 'Explore recipes, ready meals, local makers and food collections on FreshPick.' },
  { path: '/recipes', title: 'Shoppable recipes', description: 'Find published FreshPick recipes and add their available ingredients to your basket.' },
  { path: '/collections', title: 'Food collections', description: 'Explore FreshPick food collections for different meals, occasions and everyday routines.' },
  { path: '/creators', title: 'FreshPick creators', description: 'Meet the people publishing recipes and food ideas on FreshPick.' },
  { path: '/blog', title: 'The FreshPick journal', description: 'Ingredient ideas, cooking inspiration and stories from the FreshPick market in Sri Lanka.' },
  { path: '/subscriptions', title: 'Recurring grocery baskets', description: 'Explore FreshPick recurring baskets and available plans for regular grocery deliveries in Colombo.' },
  { path: '/meals', title: 'Ready meals in Colombo', description: 'Browse currently available FreshPick cooked food and explore recurring meal delivery options.' },
  { path: '/meal-kits', title: 'Dinner ideas', description: 'Choose a FreshPick recipe and turn its available ingredients into a shopping basket.' },
  { path: '/homemade', title: 'Local kitchens and homemade food', description: 'Browse FreshPick homemade food and products from independent Sri Lankan makers.' },
  { path: '/farm-to-table', title: 'Our producers and sourcing', description: 'Explore the growers, producers and local makers behind the FreshPick market.' },
  { path: '/diaspora', title: 'Order for family in Sri Lanka', description: 'Shop for family or friends in supported Colombo delivery areas. Confirm delivery arrangements and payment before ordering.' },
  { path: '/b2b', title: 'Partner with FreshPick', description: 'Learn about FreshPick supplier onboarding and business partnerships in Sri Lanka.' },
  { path: '/about', title: 'About FreshPick', description: 'Learn about FreshPick, connecting Colombo homes and businesses with groceries, recipes and local food.' },
  { path: '/contact', title: 'Contact FreshPick', description: 'Contact FreshPick for order questions, delivery arrangements, account support and partnerships.' },
  { path: '/help', title: 'Delivery and ordering help', description: 'Find answers about FreshPick ordering, Colombo delivery areas, cash on delivery, recipes and recurring baskets.' },
  { path: '/help-us', title: 'Share feedback with FreshPick', description: 'Report a FreshPick issue or share an idea to improve your shopping experience.' },
  { path: '/refund', title: 'Refund and replacement policy', description: 'Read FreshPick guidance for reporting damaged items, requesting replacements and returns.' },
  { path: '/privacy', title: 'Privacy policy', description: 'How FreshPick handles personal information used for accounts, orders, delivery and customer support.' },
  { path: '/terms', title: 'Terms of service', description: 'Terms for FreshPick accounts, ordering, delivery and related services.' },
  { path: '/cookies', title: 'Cookie policy', description: 'How FreshPick uses sign-in cookies, browser storage and optional analytics.' },
  { path: '/site-map', title: 'Site map', description: 'Find FreshPick groceries, recipes, journal stories, support and account pages.' },
  { path: '/landing', title: 'Welcome to FreshPick', description: 'Shop the FreshPick market as a customer or learn how to apply as a supplier.' },
] as const;

export function publicPageMetadata(path: string) {
  const page = PUBLIC_PAGES.find(page => page.path === path);
  if (!page) throw new Error(`No public page metadata for ${path}`);
  return pageMetadata(page);
}
