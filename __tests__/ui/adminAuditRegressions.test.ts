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
    'app/admin/audit-logs/page.tsx',
  ]) {
    expect(source(file)).toContain('authenticatedApiFetch');
  }
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
