import fs from 'node:fs';
import path from 'node:path';

function source(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8');
}

it('keeps real user-backed customers editable in admin', () => {
  const customers = source('components/admin/customers/CustomersPage.tsx');
  expect(customers).not.toContain("customer.source === 'user'");
  expect(customers).not.toContain("customer.source !== 'user'");
  expect(customers).toContain('handleView(customer)');
  expect(customers).toContain('handleEdit(customer)');
  expect(customers).toContain('handleDelete(customer._id)');
});

it('uses Sri Lankan currency in affected admin money views', () => {
  for (const file of [
    'components/admin/products/ProductsPage.tsx',
    'components/admin/customers/CustomersPage.tsx',
    'components/admin/orders/CreateOrderDialog.tsx',
  ]) {
    const code = source(file);
    expect(code).toContain("currency: 'LKR'");
    expect(code).not.toContain("currency: 'USD'");
  }
});

it('uses refresh-aware authenticated fetches on core admin data surfaces', () => {
  for (const file of [
    'components/admin/products/ProductsPage.tsx',
    'components/admin/categories/CategoriesPage.tsx',
    'components/admin/customers/CustomersPage.tsx',
    'components/admin/orders/OrdersPage.tsx',
    'components/admin/orders/CreateOrderDialog.tsx',
    'components/admin/orders/OrderDialog.tsx',
    'components/admin/AdminOverview.tsx',
    'app/admin/analytics/page.tsx',
    'components/admin/NotificationsBell.tsx',
  ]) {
    expect(source(file)).toContain('authenticatedApiFetch');
  }
});

it('does not offer customer notes that the data model cannot persist', () => {
  const dialog = source('components/admin/customers/CustomerDialog.tsx');
  expect(dialog).not.toContain('name="notes"');
  expect(dialog).not.toContain('Additional notes about the customer');
  expect(dialog).toContain('authenticatedApiFetch');
});

it('accepts direct-upload category paths as well as HTTPS image URLs', () => {
  for (const file of [
    'app/api/admin/categories/route.ts',
    'app/api/admin/categories/[id]/route.ts',
  ]) {
    const code = source(file);
    expect(code).toContain("value.startsWith('/')");
    expect(code).toContain("/^https:\\/\\//i.test(value)");
  }
});

it('loads audit summaries only after applying filters and uses bounded workspace reads',()=>{const page=source('app/admin/audit-logs/page.tsx');expect(page).toContain('readWorkspace');expect(page).toContain('const applied=searchParams.toString()');expect(page).not.toContain('Mongo ObjectId');const api=source('app/api/admin/activities/route.ts');expect(api).not.toContain('const log = { ...l');expect(api).toContain("resourceType: z.string()");expect(api).toContain("'Cache-Control':'private, no-store'");});
it('uses account notifications instead of audit activity and hides legacy member and business controls',()=>{const bell=source('components/admin/NotificationsBell.tsx');expect(bell).toContain('/api/notifications?limit=10');expect(bell).not.toContain('localStorage');expect(bell).not.toContain('/api/admin/activities');expect(source('components/account/AccountPage.tsx')).not.toContain('Previous orders');expect(source('components/makers/MakerStudio.tsx')).not.toContain('Start from your catalogue');expect(source('app/api/suppliers/maker/route.ts')).not.toContain('prisma.product.findMany');});
