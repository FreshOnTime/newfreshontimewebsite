'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

// GSAP is loaded only on public pages with motion targets; no content is hidden in CSS.
export function ModernMotion() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname.startsWith('/admin') || pathname.startsWith('/auth') || pathname.startsWith('/dashboard') || pathname.startsWith('/profile')) return;
    const root = document.querySelector<HTMLElement>('.freshpick-market > main');
    if (!root) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    let disposed = false;
    let cancel: (() => void) | undefined;
    let activating = false;
    async function activate() {
      if (activating || cancel || disposed || preference.matches) return;
      activating = true;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).finally(() => { activating = false; });
      if (disposed || preference.matches || cancel || !root) return;
      gsap.registerPlugin(ScrollTrigger);
      const context = gsap.context(() => {
        const hero = root.querySelector('.studio-hero, .directory-masthead, .fp-join');
        if (hero && hero.getBoundingClientRect().top < innerHeight) {
          const copy = hero.querySelectorAll('[data-studio-intro], .directory-masthead-copy > *, .maker-hero-copy > h1, .maker-hero-copy > p');
          const media = hero.querySelector('.studio-hero-media, .directory-masthead-photo, .maker-hero-photo');
          const timeline = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'opacity,transform' } });
          timeline.from(copy, { opacity: .75, y: 20, duration: .85, stagger: .10 });
          if (media) timeline.from(media, { opacity: .85, y: 16, duration: 1.1 }, .18);
        }
        const chapters = root.querySelectorAll<HTMLElement>('[data-studio-chapter], .fp-band, .journal-storefront, .journal-story-header, .fp-article-head, .fp-item-page .journal-item-info');
        chapters.forEach(chapter => {
          if (chapter.getBoundingClientRect().top < innerHeight * .72) return;
          const copy = chapter.querySelectorAll('h1,h2,.studio-chapter-copy > p');
          if (!copy.length) return;
          gsap.from(copy, { immediateRender: false, opacity: .8, y: 22, stagger: .10, duration: .9, ease: 'power3.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: chapter, start: 'top 88%', once: true } });
        });
        root.querySelectorAll<HTMLElement>('[data-studio-grid], .lux-rail-track').forEach(grid => {
          if (grid.getBoundingClientRect().top < innerHeight * .72) return;
          gsap.from(Array.from(grid.children).slice(0, 8), { immediateRender: false, opacity: .85, y: 16, stagger: .075, duration: .7, ease: 'power2.out', clearProps: 'opacity,transform', scrollTrigger: { trigger: grid, start: 'top 90%', once: true } });
        });
        if (window.matchMedia('(min-width: 1024px) and (pointer: fine)').matches) {
          root.querySelectorAll<HTMLElement>('[data-studio-parallax]').forEach(frame => {
            const image = frame.querySelector('img');
            if (!image) return;
            gsap.fromTo(image, { yPercent: -5, scale: 1.12 }, { yPercent: 5, scale: 1.12, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: .7, invalidateOnRefresh: true } });
          });
        }
      }, root);
      root.dataset.studioMotion = 'active';
      cancel = () => { context.revert(); delete root.dataset.studioMotion; };
    }
    const change = () => { if (preference.matches) { cancel?.(); cancel = undefined; } else if (!cancel) void activate().catch(() => {}); };
    preference.addEventListener('change', change);
    if (!preference.matches) void activate().catch(() => {});
    return () => { disposed = true; preference.removeEventListener('change', change); cancel?.(); };
  }, [pathname]);
  return null;
}
