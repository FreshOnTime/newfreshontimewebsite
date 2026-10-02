import MarketCollectionPage from '@/components/templates/MarketCollectionPage';
import type { Product } from '@/models/product';

export default function MealsContent({ products }: { products: Product[] }) {
  return <MarketCollectionPage products={products} eyebrow="From the kitchen" title="Dinner, taken care of." description="For the days you would rather skip the cooking. Explore the current ready-meal selection and add something good to your bag." image="/images/categories/cooked-food.webp" selectionTitle="What is ready today." emptyCopy="Our ready-meal selection is being prepared. Browse groceries and recipes for your next meal in the meantime." notes={[
    { title: 'Choose what suits you', description: 'Order individual meals or put together a bag for the household from what is available.' },
    { title: 'Alongside your groceries', description: 'Add meals to your shopping bag with the other things you need for the week.' },
    { title: 'Make favourites regular', description: 'Enable recurring orders at checkout and manage the schedule from your account.' },
  ]} />;
}
