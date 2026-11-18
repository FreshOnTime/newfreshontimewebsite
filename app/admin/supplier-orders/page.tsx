import SupplierOrders from '@/components/supplier/SupplierOrders';

export default function AdminSupplierOrdersPage() {
  return <main className="space-y-6 p-5 md:p-8"><header><h1 className="font-serif text-3xl text-brand-green">Partner fulfilment</h1><p className="mt-2 text-sm text-muted-foreground">Manage supplier-specific requests generated from customer orders.</p></header><SupplierOrders admin /></main>;
}
