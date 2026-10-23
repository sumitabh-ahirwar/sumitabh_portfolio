import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Motion tokens — mirror the CSS custom properties in styles/tokens.css.
export const EASE = {
  out: 'expo.out',
  soft: 'power3.out',
  inOut: 'power3.inOut',
};

export const DUR = {
  fast: 0.35,
  base: 0.8,
  slow: 1.25,
};

export const REDUCED_QUERY = '(prefers-reduced-motion: reduce)';
export const MOTION_OK_QUERY = '(prefers-reduced-motion: no-preference)';

export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia(REDUCED_QUERY).matches;
}

export function isFinePointer() {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export { gsap, ScrollTrigger };
