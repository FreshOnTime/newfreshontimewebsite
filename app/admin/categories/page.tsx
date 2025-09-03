import { Metadata } from 'next';
import { CategoriesPage } from '@/components/admin/categories/CategoriesPage';

export const metadata: Metadata = {
  title: 'Categories | Admin Dashboard',
  description: 'Manage categories in the admin dashboard',
};

export default function Categories() {
  return <CategoriesPage />;
}
