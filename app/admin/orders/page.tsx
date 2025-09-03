import { Metadata } from 'next';
import { OrdersPage } from '@/components/admin/orders/OrdersPage';

export const metadata: Metadata = {
  title: 'Orders | Admin Dashboard',
  description: 'Manage orders in the admin dashboard',
};

export default function Orders() {
  return <OrdersPage />;
}
