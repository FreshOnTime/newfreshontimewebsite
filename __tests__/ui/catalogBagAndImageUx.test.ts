import fs from 'node:fs';
import path from 'node:path';

function source(file: string) {
  return fs.readFileSync(path.join(process.cwd(), file), 'utf8');
}

it('product cards expose bag selection and create-new-bag actions', () => {
  const card = source('components/products/ProductCardActions.tsx');
  expect(card).toContain('Choose a shopping bag');
  expect(card).toContain('Create new bag & add');
  expect(card).toContain('createBag(trimmedName');
  expect(card).not.toContain('router.push("/bags")');
});

it('product detail create-bag action adds the current product immediately', () => {
  const detail = source('app/products/[id]/AddToBagButton.tsx');
  expect(detail).toContain('Create New Bag & Add');
  expect(detail).toContain('setAddAfterCreate(true)');
});

it('admin product and category forms use direct image uploads without URL inputs', () => {
  const category = source('components/admin/categories/CategoryDialog.tsx');
  const product = source('components/admin/products/ProductDialog.tsx');

  expect(category).toContain("'/api/upload/images/categories'");
  expect(category).toContain('<ImageUpload');
  expect(category).not.toContain('Collection image URL');

  expect(product).toContain("'/api/upload/images/products'");
  expect(product).toContain('<ImageUpload');
  expect(product).not.toContain('or Image URL');
});
