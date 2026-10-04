import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { editorialGuides, findEditorialGuide, guidePath } from '@/lib/editorialGuides';
import { blogImageSource, normalizeBlogImage, BLOG_IMAGE_FALLBACK } from '@/lib/blogImages';

it('publishes four unique guides with real local images, substantive text and valid internal guide links', () => {
  expect(editorialGuides).toHaveLength(4);
  expect(new Set(editorialGuides.map(g => g.slug)).size).toBe(4);
  for (const guide of editorialGuides) {
    expect(findEditorialGuide(guide.slug)).toBe(guide);
    expect(guide.content.split(/\s+/).length).toBeGreaterThan(300);
    expect(existsSync(join(process.cwd(), 'public', guide.featuredImage.url))).toBe(true);
    expect(guide.featuredImage.alt.length).toBeGreaterThan(10);
    expect(guide.excerpt.length).toBeLessThanOrEqual(180);
    expect(guidePath(guide.slug)).toBe(`/blog/guides/${guide.slug}`);
    for (const match of guide.content.matchAll(/\]\(\/blog\/guides\/([^)]*)\)/g)) {
      expect(findEditorialGuide(match[1])).toBeDefined();
    }
  }
  expect(findEditorialGuide('not-a-guide')).toBeUndefined();
});

it.each([undefined, '', '//external.test/image.jpg', 'javascript:alert(1)', 'data:image/png;base64,123', 'http://unsafe.test/a.jpg', 'https://user:password@example.com/image.jpg'])('rejects malformed or unsafe blog image sources (%s)', src => {
  expect(blogImageSource(src)).toBe(BLOG_IMAGE_FALLBACK);
});
it('supports legacy string images, uploaded image objects and local paths', () => {
  expect(normalizeBlogImage('https://images.unsplash.com/photo-123')).toEqual({ url: 'https://images.unsplash.com/photo-123', alt: '' });
  expect(normalizeBlogImage({ url: '/images/editorial/market-crates.webp', alt: 'Market' })).toEqual({ url: '/images/editorial/market-crates.webp', alt: 'Market' });
  expect(normalizeBlogImage(['invalid']).url).toBe(BLOG_IMAGE_FALLBACK);
});
