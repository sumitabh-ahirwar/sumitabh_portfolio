import { useLayoutEffect } from 'react';
import { prefersReducedMotion } from '../lib/motion';

/**
 * Scroll reveals for anything inside `ref` marked with data-reveal:
 *   heading  → masked word slide-up
 *   fade     → rise + fade
 *   stagger  → children rise in sequence
 *   line     → hairline draws from the left
 *
 * Implemented with IntersectionObserver + CSS keyframes (styles/reveal.css) rather than
 * one ScrollTrigger per element: no layout reads at startup, the work runs on the compositor,
 * and content remains visible if JavaScript or motion is unavailable.
 */
export function useSectionReveal(ref) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return undefined;
    const els = [...root.querySelectorAll('[data-reveal]')];
    els.forEach((el) => {
      const kind = el.dataset.reveal;
      const items = kind === 'heading' ? el.querySelectorAll('.split-inner') : kind === 'stagger' ? el.children : [];
      [...items].forEach((item, i) => item.style.setProperty('--i', i));
      el.classList.add('rv');
    });
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('rv-in');
            io.unobserve(entry.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      els.forEach((el) => el.classList.remove('rv', 'rv-in'));
    };
  }, [ref]);
}
