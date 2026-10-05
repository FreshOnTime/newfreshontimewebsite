import fs from 'node:fs';
import path from 'node:path';

const serviceWorker = fs.readFileSync(path.join(process.cwd(), 'public/sw.js'), 'utf8');

it('does not cache retired storefront routes', () => {
  expect(serviceWorker).not.toContain('"/meal-kits"');
});

it('keeps private Next.js RSC requests out of the dynamic cache', () => {
  expect(serviceWorker).toContain('if (request.headers.get("RSC") === "1")');
  expect(serviceWorker).toContain('if (isCacheablePublicPage(url))');
  expect(serviceWorker).toContain('Everything else stays network-only');
});

it('rotates service-worker cache names after the privacy fix', () => {
  expect(serviceWorker).toContain('freshpick-static-v4');
  expect(serviceWorker).toContain('freshpick-dynamic-v4');
});
