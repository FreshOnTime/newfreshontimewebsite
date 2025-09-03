import { Metadata } from 'next';
import { SuppliersPage } from '@/components/admin/suppliers/SuppliersPage';

export const metadata: Metadata = {
  title: 'Suppliers | Admin Dashboard',
  description: 'Manage suppliers in the admin dashboard',
};

export default function Suppliers() {
  return <SuppliersPage />;
}
