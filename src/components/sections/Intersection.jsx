/**
 * Three tilted orbits — AI, software engineering, distributed systems —
 * sharing one centre. Pure SVG + CSS; animation pauses for reduced motion.
 */
import { useRef } from 'react';
import { useInView } from '../../hooks/useInView';

const orbits = [
  { label: 'AI & ML', rot: 0, color: 'var(--cyan)' },
  { label: 'Software Engineering', rot: 60, color: 'var(--blue)' },
  { label: 'Distributed Systems', rot: 120, color: 'var(--violet)' },
];

export default function Intersection() {
  const ref = useRef(null);
  const live = useInView(ref); // SVG transforms repaint on the main thread, so pause off-screen
  return (
    <figure ref={ref} className={`isect${live ? ' is-live' : ''}`} aria-label="Where my work sits: the intersection of AI and machine learning, software engineering, and distributed systems.">
      <svg viewBox="-200 -200 400 400" className="isect__svg" aria-hidden="true">
        <defs>
          <radialGradient id="isect-core">
            <stop offset="0" stopColor="#5ee7ff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5ee7ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle r="150" className="isect__guide" />
        <circle r="100" className="isect__guide" />
        {orbits.map((o, i) => (
          <g key={o.label} transform={`rotate(${o.rot})`}>
            <g className="isect__orbit" style={{ '--d': `${18 + i * 4}s`, '--c': o.color }}>
              <ellipse rx="150" ry="58" className="isect__ring" />
              <circle cx="150" cy="0" r="4.5" className="isect__bead" />
              <circle cx="-150" cy="0" r="2.5" className="isect__bead isect__bead--sm" />
            </g>
          </g>
        ))}
        <circle r="54" fill="url(#isect-core)" />
        <circle r="5" className="isect__core" />
      </svg>
      <figcaption className="isect__labels mono">
        {orbits.map((o) => (
          <span key={o.label} style={{ '--c': o.color }}>
            {o.label}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
