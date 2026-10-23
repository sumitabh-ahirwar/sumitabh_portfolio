import { lazy, Suspense, useEffect, useState } from 'react';
import { hasWebGL } from '../../lib/lattice';
import { useReducedMotion } from '../../hooks/useMediaQuery';
import FieldFallback from './FieldFallback';
import './HeroScene.css';

const NeuralField = lazy(() => import('./NeuralField'));

// Append ?webgl=0 to the URL to preview the non-WebGL fallback.
function initialMode() {
  if (typeof window === 'undefined') return 'fallback';
  if (new URLSearchParams(window.location.search).get('webgl') === '0') return 'fallback';
  return hasWebGL() ? 'webgl' : 'fallback';
}

export default function HeroScene({ active }) {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState(initialMode);
  // three.js (~140 KB gzipped) is fetched only after the intro, when the browser is idle,
  // so it never competes with the first paint of the headline.
  const [load, setLoad] = useState(false);
  useEffect(() => {
    if (!active || mode !== 'webgl') return undefined;
    const ric = window.requestIdleCallback || ((cb) => setTimeout(cb, 200));
    const cancel = window.cancelIdleCallback || clearTimeout;
    const id = ric(() => setLoad(true), { timeout: 1200 });
    return () => cancel(id);
  }, [active, mode]);

  return (
    <div className={`hero-scene${active ? ' is-active' : ''}`} aria-hidden="true" data-mode={mode}>
      <div className="hero-scene__glow" />
      {mode === 'webgl' ? (
        load && <Suspense fallback={null}>
          <NeuralField active={active} reduced={reduced} onError={() => setMode('fallback')} />
        </Suspense>
      ) : (
        <FieldFallback />
      )}
      <div className="hero-scene__veil" />
    </div>
  );
}
