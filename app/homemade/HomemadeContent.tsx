import MarketCollectionPage from '@/components/templates/MarketCollectionPage';
import type { Product } from '@/models/product';

export default function HomemadeContent({ products }: { products: Product[] }) {
  return <MarketCollectionPage products={products} eyebrow="Local makers" title="From local kitchens." description="Food and handmade goods from independent Sri Lankan businesses. Find something with a little more character for your everyday table." image="/images/editorial/hands-at-work.webp" selectionTitle="Made with a personal touch." emptyCopy="Our next selection of local maker products is on its way. Explore the rest of the market while you wait." notes={[
    { title: 'Independent businesses', description: 'Discover food and goods from local makers alongside your everyday groceries.' },
    { title: 'Something to share', description: 'Choose a new favourite for your kitchen, or something thoughtful for someone else.' },
    { title: 'Room for discovery', description: 'The selection changes as products become available. Come back to see what is new.' },
  ]} />;
}
