import { useEffect, useRef } from 'react';
import { buildLattice } from '../../lib/lattice';

/**
 * Lightweight 2D fallback when WebGL is unavailable: the same lattice,
 * projected once onto a canvas (redrawn only on resize). Ambient motion
 * comes from a cheap CSS transform on the canvas.
 */
export default function FieldFallback() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const lattice = buildLattice({ count: 300 });
    const { positions: P, edges, sizes } = lattice;

    const draw = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      const wide = w >= 900;
      const cx = wide ? w * 0.7 : w * 0.5;
      const cy = wide ? h * 0.5 : h * 0.36;
      const scale = (wide ? Math.min(w, h) * 0.105 : Math.min(w, h) * 0.12) * 1;
      const ry = 0.6;
      const rx = 0.25;
      const proj = new Float32Array((P.length / 3) * 3);
      for (let i = 0; i < P.length / 3; i++) {
        let x = P[i * 3];
        let y = P[i * 3 + 1];
        let z = P[i * 3 + 2];
        const x1 = x * Math.cos(ry) + z * Math.sin(ry);
        const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
        const y1 = y * Math.cos(rx) - z1 * Math.sin(rx);
        const z2 = y * Math.sin(rx) + z1 * Math.cos(rx);
        x = x1;
        y = y1;
        z = z2;
        const persp = 10 / (10 - z);
        proj[i * 3] = cx + x * scale * persp;
        proj[i * 3 + 1] = cy - y * scale * persp;
        proj[i * 3 + 2] = (z + 4) / 8; // 0 (far) … 1 (near)
      }
      ctx.lineWidth = 1;
      for (let e = 0; e < edges.length; e += 2) {
        const a = edges[e];
        const b = edges[e + 1];
        const depth = (proj[a * 3 + 2] + proj[b * 3 + 2]) / 2;
        ctx.strokeStyle = `rgba(110, 170, 255, ${0.05 + depth * 0.12})`;
        ctx.beginPath();
        ctx.moveTo(proj[a * 3], proj[a * 3 + 1]);
        ctx.lineTo(proj[b * 3], proj[b * 3 + 1]);
        ctx.stroke();
      }
      for (let i = 0; i < P.length / 3; i++) {
        const depth = proj[i * 3 + 2];
        const r = sizes[i] * (0.6 + depth * 0.8);
        ctx.fillStyle = depth > 0.55 ? `rgba(150, 236, 255, ${0.35 + depth * 0.5})` : `rgba(90, 130, 255, ${0.25 + depth * 0.45})`;
        ctx.beginPath();
        ctx.arc(proj[i * 3], proj[i * 3 + 1], r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    draw();
    const ro = new ResizeObserver(draw);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, []);

  return <canvas ref={ref} className="hero-scene__canvas hero-scene__fallback" aria-hidden="true" />;
}
