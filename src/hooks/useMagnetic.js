import { useEffect } from 'react';
import { gsap, isFinePointer, prefersReducedMotion } from '../lib/motion';

/** Gently pulls an element toward the cursor while hovered (desktop, motion allowed only). */
export function useMagnetic(ref, { strength = 0.28, enabled = true } = {}) {
  useEffect(() => {
    const el = ref.current;
    if (!enabled || !el || !isFinePointer() || prefersReducedMotion()) return undefined;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.6, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.6, ease: 'power3.out' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * strength);
      yTo((e.clientY - (r.top + r.height / 2)) * strength);
    };
    const leave = () => {
      xTo(0);
      yTo(0);
    };
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);
    return () => {
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [ref, strength, enabled]);
}
