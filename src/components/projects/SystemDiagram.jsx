import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMediaQuery, useReducedMotion } from '../../hooks/useMediaQuery';
import { useInView } from '../../hooks/useInView';
import './SystemDiagram.css';

const KIND_LABEL = { llm: 'AI / ML stage', fn: 'Service / step', io: 'Input / output', store: 'Queue / storage' };

const NODE_W = 118;
const NODE_H = 64;
const PAD = 20;

/** Positions nodes on a grid. Horizontal: columns flow left→right. Vertical: flow top→bottom. */
function computeLayout(arch, horizontal) {
  const maxCol = Math.max(...arch.nodes.map((n) => n.col));
  const maxRow = Math.max(...arch.nodes.map((n) => n.row));
  let W;
  let H;
  const pos = {};
  if (horizontal) {
    W = 1120;
    const colGap = (W - PAD * 2 - NODE_W) / maxCol;
    const rowGap = 104;
    H = PAD * 2 + NODE_H + rowGap * maxRow;
    arch.nodes.forEach((n) => (pos[n.id] = { x: PAD + n.col * colGap, y: PAD + n.row * rowGap }));
  } else {
    W = 420;
    const rowGap = maxRow ? (W - PAD * 2 - NODE_W) / maxRow : 0;
    const colGap = 96;
    H = PAD * 2 + NODE_H + colGap * maxCol;
    arch.nodes.forEach((n) => (pos[n.id] = { x: (maxRow ? PAD + n.row * rowGap : (W - NODE_W) / 2), y: PAD + n.col * colGap }));
  }

  const byId = Object.fromEntries(arch.nodes.map((n) => [n.id, n]));
  const edges = arch.edges.map(([a, b], i) => {
    const A = pos[a];
    const B = pos[b];
    const sameLevel = byId[a].col === byId[b].col;
    let d;
    if (horizontal !== sameLevel) {
      // Flow direction is along x
      const forward = A.x <= B.x;
      const x1 = forward ? A.x + NODE_W : A.x;
      const x2 = forward ? B.x : B.x + NODE_W;
      const y1 = A.y + NODE_H / 2;
      const y2 = B.y + NODE_H / 2;
      const mx = (x1 + x2) / 2;
      d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
    } else {
      const down = A.y <= B.y;
      const x1 = A.x + NODE_W / 2;
      const x2 = B.x + NODE_W / 2;
      const y1 = down ? A.y + NODE_H : A.y;
      const y2 = down ? B.y : B.y + NODE_H;
      const my = (y1 + y2) / 2;
      d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
    }
    return { id: i, a, b, d, level: byId[a].col };
  });
  return { W, H, pos, edges };
}

export default function SystemDiagram({ arch, accent = 'cyan', idPrefix }) {
  const horizontal = useMediaQuery('(min-width: 900px)');
  const reduced = useReducedMotion();
  const [sel, setSel] = useState(arch.nodes[0].id);
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const inView = useInView(wrapRef);
  const { W, H, pos, edges } = useMemo(() => computeLayout(arch, horizontal), [arch, horizontal]);

  // Pause SMIL packet animation while off screen.
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg?.pauseAnimations) return;
    if (inView) svg.unpauseAnimations();
    else svg.pauseAnimations();
  }, [inView]);

  const index = arch.nodes.findIndex((n) => n.id === sel);
  const node = arch.nodes[index];
  const neighbours = new Set(edges.filter((e) => e.a === sel || e.b === sel).flatMap((e) => [e.a, e.b]));

  const focusNode = (i) => {
    const n = arch.nodes[(i + arch.nodes.length) % arch.nodes.length];
    setSel(n.id);
    svgRef.current?.querySelector(`[data-node="${n.id}"]`)?.focus();
  };

  const onKey = (e, i) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSel(arch.nodes[i].id);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      focusNode(i + 1);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      focusNode(i - 1);
    }
  };

  return (
    <div className={`sd sd--${accent}${horizontal ? ' sd--h' : ' sd--v'}`} ref={wrapRef}>
      <div className="sd__canvas">
        <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="sd__svg" role="group" aria-label={`${arch.title}. Use arrow keys to move between components and Enter to select.`}>
          <g aria-hidden="true">
            {edges.map((e) => {
              const on = e.a === sel || e.b === sel;
              return <path key={e.id} id={`${idPrefix}-e${e.id}`} d={e.d} className={`sd__edge${on ? ' is-on' : ''}`} />;
            })}
            {!reduced
              ? edges.map((e) => (
                  <circle key={`p${e.id}`} r="3.2" className="sd__packet" opacity="0">
                    <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.85;1" dur="2.6s" begin={`${e.level * 0.42}s`} repeatCount="indefinite" />
                    <animateMotion dur="2.6s" begin={`${e.level * 0.42}s`} repeatCount="indefinite" keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1">
                      <mpath href={`#${idPrefix}-e${e.id}`} />
                    </animateMotion>
                  </circle>
                ))
              : null}
          </g>
          {arch.nodes.map((n, i) => {
            const p = pos[n.id];
            const state = n.id === sel ? ' is-sel' : neighbours.has(n.id) ? ' is-near' : '';
            return (
              <g
                key={n.id}
                data-node={n.id}
                className={`sd__node sd__node--${n.kind}${state}`}
                transform={`translate(${p.x} ${p.y})`}
                role="button"
                tabIndex={0}
                aria-pressed={n.id === sel}
                aria-label={n.label.join(' ')}
                onClick={() => setSel(n.id)}
                onKeyDown={(e) => onKey(e, i)}
              >
                <rect width={NODE_W} height={NODE_H} rx="12" className="sd__box" />
                <circle cx="14" cy="15" r="3.5" className="sd__dot" />
                <text x="14" y={n.label.length > 1 ? 37 : 45} className="sd__label">
                  {n.label.map((l, j) => (
                    <tspan key={j} x="14" dy={j ? 16 : 0}>
                      {l}
                    </tspan>
                  ))}
                </text>
                <text x={NODE_W - 12} y="19" textAnchor="end" className="sd__idx">
                  {String(i + 1).padStart(2, '0')}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="sd__detail">
        <div className="sd__detail-body" aria-live="polite">
          <p className="eyebrow">
            <span className={`sd__kind sd__kind--${node.kind}`} /> {KIND_LABEL[node.kind]} · {index + 1} / {arch.nodes.length}
          </p>
          <h3>{node.label.join(' ')}</h3>
          <p>{node.desc}</p>
        </div>
        <div className="sd__controls">
          <button type="button" className="btn btn--icon btn--sm" onClick={() => setSel(arch.nodes[(index - 1 + arch.nodes.length) % arch.nodes.length].id)} aria-label="Previous component">
            <ChevronLeft size={17} aria-hidden="true" />
          </button>
          <button type="button" className="btn btn--icon btn--sm" onClick={() => setSel(arch.nodes[(index + 1) % arch.nodes.length].id)} aria-label="Next component">
            <ChevronRight size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="sd__foot">
        <ul className="sd__legend">
          {arch.legend.map((l) => (
            <li key={l.kind}>
              <span className={`sd__kind sd__kind--${l.kind}`} />
              {l.label}
            </li>
          ))}
        </ul>
        <p className="illustrative">{arch.caption}</p>
      </div>
    </div>
  );
}
