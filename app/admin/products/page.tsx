import { Metadata } from 'next';
import { ProductsPage } from '@/components/admin/products/ProductsPage';

export const metadata: Metadata = {
  title: 'Products | Admin Dashboard',
  description: 'Manage products in the admin dashboard',
};

export default function Products() {
  return <ProductsPage />;
}
