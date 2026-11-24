'use client';

import { useEffect } from 'react';

// Content is visible by default, including before hydration and without JS.
export function ModernMotion() {
  useEffect(() => {
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.animate(
          [{ opacity: .65, transform: 'translateY(16px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 520, easing: 'cubic-bezier(.2,.7,.25,1)' }
        );
        observer.unobserve(entry.target);
      });
    }, { threshold: .12 });
    document.querySelectorAll('[data-modern-reveal]').forEach(node => observer.observe(node));
    return () => observer.disconnect();
  }, []);
  return null;
}
