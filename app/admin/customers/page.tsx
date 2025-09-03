import { Metadata } from 'next';
import { CustomersPage } from '@/components/admin/customers/CustomersPage';

export const metadata: Metadata = {
  title: 'Customers | Admin Dashboard',
  description: 'Manage customers in the admin dashboard',
};

export default function Customers() {
  return <CustomersPage />;
}
