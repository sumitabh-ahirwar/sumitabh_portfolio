import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../../lib/motion';

// Thousands separators without Intl (toLocaleString is slow on first use).
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

/** Counts up once when scrolled into view. The final value is always in the DOM for screen readers. */
export default function Counter({ value, prefix = '', suffix = '', className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === 'undefined') return undefined;
    let tween;
    el.textContent = fmt(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const obj = { v: 0 };
        tween = gsap.to(obj, {
          v: value,
          duration: value > 100 ? 1.8 : 1.1,
          ease: 'power3.out',
          onUpdate: () => (el.textContent = fmt(obj.v)),
          onComplete: () => (el.textContent = fmt(value)),
        });
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      tween?.kill();
      el.textContent = fmt(value);
    };
  }, [value]);

  return (
    <span className={className}>
      <span className="sr-only">
        {prefix}
        {fmt(value)}
        {suffix}
      </span>
      <span aria-hidden="true">
        {prefix ? <span className="counter__prefix">{prefix}</span> : null}
        <span ref={ref}>{fmt(value)}</span>
        {suffix}
      </span>
    </span>
  );
}
