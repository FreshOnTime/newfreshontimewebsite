
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { customerGuide, supplierGuide } from '@/lib/marketGuides';
import { PUBLIC_PAGES } from '@/lib/publicPages';

describe('customer and supplier website guides', () => {
  it('has complete, distinctly anchored steps and FAQs for both audiences', () => {
    for (const guide of [customerGuide, supplierGuide]) {
      expect(guide.steps.length).toBeGreaterThanOrEqual(7);
      expect(guide.faqs.length).toBeGreaterThanOrEqual(6);
      expect(new Set(guide.steps.map(step => step.id)).size).toBe(guide.steps.length);
      for (const step of guide.steps) {
        expect(step.details.length).toBeGreaterThanOrEqual(3);
        expect(step.action.href).toMatch(/^\//);
      }
    }
  });
  it('exposes all guide pages through the public metadata/sitemap inventory', () => {
    const paths = new Set(PUBLIC_PAGES.map(page => page.path));
    ['/how-it-works', '/how-it-works/customers', '/how-it-works/suppliers'].forEach(path => expect(paths.has(path)).toBe(true));
  });
  it('does not imply automated card charging or supplier self-publication', () => {
    expect(JSON.stringify(customerGuide).toLowerCase()).toContain('cash on delivery');
    expect(JSON.stringify(supplierGuide).toLowerCase()).toContain('commission');
    expect(JSON.stringify(supplierGuide).toLowerCase()).toContain('import');
  });
  it('aligns refund wording with COD and configured support contact', () => {
    const source = readFileSync(join(process.cwd(), 'app/refund/page.tsx'), 'utf8');
    expect(source).toContain('cash on delivery');
    expect(source).toContain('SUPPORT_EMAIL');
    expect(source).not.toMatch(/credit card company|original payment method|check your bank account again/i);
  });
  it('fixes the producer contact route in the supplier dashboard', () => {
    const source = readFileSync(join(process.cwd(), 'components/supplier/SupplierDashboard.tsx'), 'utf8');
    expect(source).toContain('/contact?type=question&source=producers');
    expect(source).not.toContain('/contact?type=producer');
  });
});
