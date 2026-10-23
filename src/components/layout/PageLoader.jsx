import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap, EASE, prefersReducedMotion } from '../../lib/motion';
import { lockScroll, unlockScroll } from '../../lib/scroll';
import './PageLoader.css';

/**
 * Short intro: the mark draws itself while fonts load, then the curtain lifts.
 * It waits for real readiness (fonts) with a minimum time for the choreography,
 * is shorter on repeat visits in the same session, and is skipped for reduced motion.
 */
export default function PageLoader({ onReveal, onDone }) {
  const rootRef = useRef(null);
  const cb = useRef({ onReveal, onDone });
  useEffect(() => {
    cb.current = { onReveal, onDone };
  }, [onReveal, onDone]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const reduce = prefersReducedMotion();
    let visited = false;
    try {
      visited = sessionStorage.getItem('sa-visited') === '1';
      sessionStorage.setItem('sa-visited', '1');
    } catch {
      /* storage unavailable — fine */
    }

    let locked = true;
    lockScroll({ measure: false });
    const release = () => {
      if (locked) {
        locked = false;
        unlockScroll();
      }
    };

    if (reduce) {
      release();
      cb.current.onReveal?.();
      cb.current.onDone?.();
      return release;
    }

    const minTime = visited ? 350 : 850;
    const start = performance.now();
    let cancelled = false;
    let timer;

    const ctx = gsap.context(() => {
      const intro = gsap.timeline();
      intro
        .fromTo('.loader__mark path', { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 1.1, ease: EASE.inOut })
        .from('.loader__mark circle', { scale: 0, transformOrigin: '50% 50%', stagger: 0.12, duration: 0.6, ease: 'back.out(2)' }, 0.35)
        .from('.loader__char', { yPercent: 110, stagger: 0.025, duration: 0.8, ease: EASE.out }, 0.2)
        .fromTo('.loader__bar i', { scaleX: 0 }, { scaleX: 0.82, duration: minTime / 1000, ease: 'power1.inOut' }, 0);
    }, root);

    const exit = () => {
      if (cancelled) return;
      ctx.add(() => {
        gsap
          .timeline({
            onComplete: () => {
              if (!cancelled) cb.current.onDone?.();
            },
          })
          .to('.loader__bar i', { scaleX: 1, duration: 0.3, ease: EASE.soft })
          .to('.loader__inner', { y: -24, autoAlpha: 0, duration: 0.5, ease: EASE.soft })
          .add(() => {
            release();
            cb.current.onReveal?.();
          }, '-=0.25')
          .to(root, { clipPath: 'inset(0% 0% 100% 0%)', duration: 1, ease: 'expo.inOut' }, '-=0.3');
      });
    };

    const fontsReady = document.fonts?.ready ?? Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, 2500))]).then(() => {
      const wait = Math.max(0, minTime - (performance.now() - start));
      timer = setTimeout(exit, wait);
    });

    return () => {
      cancelled = true;
      clearTimeout(timer);
      ctx.revert();
      release();
    };
  }, []);

  const name = 'SUMITABH AHIRWAR';
  return (
    <div className="loader" ref={rootRef} role="status" aria-label="Loading portfolio">
      <div className="loader__inner">
        <svg className="loader__mark" viewBox="0 0 32 32" width="64" height="64" aria-hidden="true">
          <path d="M9 22.5 16 8.5l7 14M11.6 17.3h8.8" pathLength="60" />
          <circle cx="16" cy="8.5" r="2.2" fill="#5ee7ff" />
          <circle cx="9" cy="22.5" r="1.9" fill="#4d7dff" />
          <circle cx="23" cy="22.5" r="1.9" fill="#9a8cff" />
        </svg>
        <p className="loader__name" aria-hidden="true">
          {[...name].map((c, i) => (
            <span key={i} className="loader__char">
              {c === ' ' ? ' ' : c}
            </span>
          ))}
        </p>
        <div className="loader__bar" aria-hidden="true">
          <i />
        </div>
      </div>
      <p className="loader__foot mono" aria-hidden="true">
        <span>AI · Software · Systems</span>
        <span>MNNIT Allahabad</span>
      </p>
    </div>
  );
}
