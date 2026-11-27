import { readFileSync } from 'node:fs';
const source = (path: string) => readFileSync(path,'utf8');
it('installs and locks GSAP and keeps the shared animation lifecycle scoped to public content',()=>{
  const pkg=JSON.parse(source('package.json'));
  const lock=JSON.parse(source('package-lock.json'));
  expect(pkg.dependencies.gsap).toBe(lock.packages['node_modules/gsap'].version);
  const motion=source('components/makers/ModernMotion.tsx');
  expect(motion).toContain("import('gsap')");
  expect(motion).toContain('ScrollTrigger');
  expect(motion).toContain('context.revert()');
  expect(motion).toContain('prefers-reduced-motion');
  expect(motion).toContain('removeEventListener');
  expect(motion).toContain('scrub: .7');
});
it('retains the original chrome and functional discovery',()=>{
  const guard=source('components/layout/AdminChromeGuard.tsx');
  expect(guard).toContain('<Navbar />');
  expect(guard).toContain('<ModernMotion/>');
  expect(source('app/page.tsx')).toContain('<DiscoveryChapters title={section.title}/>');
  expect(source('components/discovery/ExploreSearch.tsx')).toContain('action="/discover"');
});
