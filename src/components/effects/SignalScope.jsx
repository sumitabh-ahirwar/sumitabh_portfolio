import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { prefersReducedMotion } from '../../lib/motion';

/**
 * A quiet oscilloscope line. Hovering or using the contact actions adds energy,
 * which decays back to a calm idle wave. Runs only while on screen.
 */
const SignalScope = forwardRef(function SignalScope(_, ref) {
  const canvasRef = useRef(null);
  const energy = useRef(0);
  const kickRef = useRef(() => {});

  useImperativeHandle(ref, () => ({
    pulse(amount = 0.35) {
      energy.current = Math.min(1.6, energy.current + amount);
      kickRef.current();
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const reduce = prefersReducedMotion();
    let raf = 0;
    let visible = false;
    let t = 0;
    let w = 0;
    let h = 0;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const e = energy.current;
      const mid = h / 2;
      const layers = [
        { amp: 0.16, freq: 1.6, speed: 0.9, color: 'rgba(154,140,255,0.35)', width: 1 },
        { amp: 0.24, freq: 2.3, speed: 1.3, color: 'rgba(77,125,255,0.55)', width: 1.2 },
        { amp: 0.34, freq: 3.1, speed: 1.9, color: 'rgba(94,231,255,0.95)', width: 1.6 },
      ];
      layers.forEach((L, li) => {
        ctx.beginPath();
        for (let x = 0; x <= w; x += 3) {
          const u = x / w;
          const env = Math.sin(u * Math.PI); // taper at the edges
          const a = h * L.amp * (0.12 + e * 0.6) * env;
          const y =
            mid +
            Math.sin(u * Math.PI * 2 * L.freq + t * L.speed + li) * a +
            Math.sin(u * Math.PI * 2 * L.freq * 2.7 - t * L.speed * 1.4) * a * 0.25 * e;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = L.color;
        ctx.lineWidth = L.width;
        if (li === 2) {
          ctx.shadowColor = 'rgba(94,231,255,0.7)';
          ctx.shadowBlur = 8;
        } else ctx.shadowBlur = 0;
        ctx.stroke();
      });
      ctx.shadowBlur = 0;
    };

    const loop = () => {
      t += 0.016;
      energy.current *= 0.975;
      draw();
      raf = visible ? requestAnimationFrame(loop) : 0;
    };
    const start = () => {
      if (!raf && visible && !reduce) raf = requestAnimationFrame(loop);
    };
    kickRef.current = () => (reduce ? draw() : start());

    size();
    draw();
    const io = new IntersectionObserver(([en]) => {
      visible = en.isIntersecting;
      if (visible) start();
      else {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    });
    io.observe(canvas);
    const ro = new ResizeObserver(() => {
      size();
      draw();
    });
    ro.observe(canvas);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="scope" aria-hidden="true" />;
});

export default SignalScope;
