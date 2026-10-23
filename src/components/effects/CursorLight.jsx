import { useEffect, useRef } from 'react';
import { gsap } from '../../lib/motion';
import { useFinePointer, useReducedMotion } from '../../hooks/useMediaQuery';

/**
 * A soft light that trails the pointer on desktop. The native cursor is kept —
 * this only adds atmosphere and never replaces real cursor feedback.
 */
export default function CursorLight() {
  const fine = useFinePointer();
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const enabled = fine && !reduce;

  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el) return undefined;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.9, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.9, ease: 'power3.out' });
    const move = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      el.style.opacity = '1';
    };
    const leave = () => (el.style.opacity = '0');
    window.addEventListener('pointermove', move, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(el);
    };
  }, [enabled]);

  if (!enabled) return null;
  return <div ref={ref} className="cursor-light" aria-hidden="true" />;
}
