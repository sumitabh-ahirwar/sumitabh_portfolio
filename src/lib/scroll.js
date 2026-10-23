import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion';

// One Lenis instance for the whole page, driven by GSAP's ticker so
// ScrollTrigger and smooth scrolling never disagree about scroll position.
let lenis = null;
let lockCount = 0;

export function initSmoothScroll() {
  if (prefersReducedMotion() || lenis) return () => {};

  lenis = new Lenis({ lerp: 0.11, smoothWheel: true, wheelMultiplier: 0.95 });
  lenis.on('scroll', ScrollTrigger.update);
  const tick = (time) => lenis && lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);

  return () => {
    gsap.ticker.remove(tick);
    lenis?.destroy();
    lenis = null;
  };
}

/** Scroll to a section id or element. Sections carry their own top padding, so no extra offset is needed. */
export function scrollToTarget(target, { immediate = false, offset = 0 } = {}) {
  const el = typeof target === 'string' ? document.getElementById(target) : target;
  if (!el) return;
  const reduce = prefersReducedMotion();
  if (lenis) {
    lenis.scrollTo(el, { offset, immediate: immediate || reduce, duration: 1.25, force: true });
  } else {
    const top = el.getBoundingClientRect().top + window.scrollY + offset;
    window.scrollTo({ top, behavior: immediate || reduce ? 'auto' : 'smooth' });
  }
}

/** `measure: false` skips scrollbar compensation (avoids a forced layout) — used by the full-screen loader. */
export function lockScroll({ measure = true } = {}) {
  lockCount += 1;
  if (lockCount === 1) {
    lenis?.stop();
    const gap = measure ? window.innerWidth - document.documentElement.clientWidth : 0;
    document.body.style.paddingRight = gap > 0 ? `${gap}px` : '';
    document.body.classList.add('is-locked');
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    document.body.classList.remove('is-locked');
    document.body.style.paddingRight = '';
    lenis?.start();
  }
}
