import { GET as llms } from '@/app/llms.txt/route';
import { PUBLIC_PAGES, publicPageMetadata } from '@/lib/publicPages';
import { absoluteUrl } from '@/lib/config/site';
import { ABOUT_FAQS, BUSINESS_FAQS, DIASPORA_FAQS, PRODUCER_FAQS } from '@/lib/answerContent';

describe('public discovery and citation readiness', () => {
  it.each(PUBLIC_PAGES.map(({ path }) => [path]))('keeps metadata and canonical aligned for %s', (path) => {
    const metadata = publicPageMetadata(path);
    expect(metadata.alternates?.canonical).toBe(absoluteUrl(path));
    expect(metadata.description).toBeTruthy();
    expect(metadata.openGraph).toMatchObject({ url: absoluteUrl(path), type: 'website' });
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' });
  });

  it('uses explicit, well-formed factual answers on public FAQ sections', () => {
    for (const [name, questions] of Object.entries({
      about: ABOUT_FAQS,
      business: BUSINESS_FAQS,
      producers: PRODUCER_FAQS,
      diaspora: DIASPORA_FAQS,
    })) {
      const keys = new Set<string>();
      expect(questions.length).toBeGreaterThan(0);
      for (const item of questions) {
        expect(item.question).toMatch(/\?$/);
        expect(item.answer.split(/\s+/).length).toBeGreaterThanOrEqual(30);
        expect(item.answer).not.toMatch(/Lorem ipsum|TODO|guaranteed next-day delivery/i);
        expect(keys.has(item.question)).toBe(false);
        keys.add(item.question);
      }
      expect(keys.size).toBe(questions.length);
      expect(name).toBeTruthy();
    }
  });

  it('publishes a readable llms.txt pointing to real canonical discovery pages', async () => {
    const body = await llms().text();
    expect(body.split('\n')[0]).toBe('# FreshPick');
    expect(body).toContain('Sri Lanka is the first active market.');
    for (const path of ['/explore/coffee-cafes','/explore/bakeries','/locations/colombo','/help','/blog','/for-businesses','/contact']) {
      expect(body).toContain(absoluteUrl(path));
    }
    expect(body).toContain(absoluteUrl('/sitemap.xml'));
    expect(body).not.toMatch(/Lorem ipsum|TODO|https:\/\/example\.com/);
    expect(body).not.toContain(absoluteUrl('/admin'));
  });
});
