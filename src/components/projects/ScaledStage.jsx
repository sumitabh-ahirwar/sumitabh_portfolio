import { useLayoutEffect, useRef, useState } from 'react';

/**
 * Lays out children at a fixed design size and scales them to the container width,
 * so detailed mockups keep their composition on every screen.
 */
export default function ScaledStage({ width = 880, height = 550, children, className = '' }) {
  const ref = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const update = () => setScale(el.clientWidth / width);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  return (
    <div ref={ref} className={`stage ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
      <div className="stage__inner" style={{ width, height, transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}
