import { mulberry32 } from './random';

/**
 * Procedural "signal lattice": an organic shell of nodes with an inner core,
 * linked to nearest neighbours. A few hubs carry more connections — a visual
 * nod to neural networks and distributed nodes.
 * Shared by the WebGL scene and the 2D canvas fallback so both look alike.
 */
export function buildLattice({ count = 520, seed = 11, radius = 3.2 } = {}) {
  const rand = mulberry32(seed);
  const golden = Math.PI * (3 - Math.sqrt(5));
  const shell = Math.round(count * 0.74);
  const pos = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  const hubs = new Uint8Array(count);

  for (let i = 0; i < count; i++) {
    let x;
    let y;
    let z;
    if (i < shell) {
      y = 1 - ((i + 0.5) / shell) * 2;
      const r = Math.sqrt(1 - y * y);
      const phi = i * golden;
      x = Math.cos(phi) * r;
      z = Math.sin(phi) * r;
      // Low-frequency warp so the shell reads organic rather than a perfect sphere.
      const warp = 1 + 0.13 * Math.sin(3.1 * x + 1.3) * Math.cos(2.3 * y) + 0.07 * Math.sin(4.0 * z);
      const j = warp * (1 + (rand() - 0.5) * 0.16);
      x *= radius * j;
      y *= radius * j * 0.9;
      z *= radius * j;
    } else {
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const d = radius * (0.32 + 0.38 * Math.cbrt(rand()));
      x = Math.cos(t) * r * d;
      y = u * d * 0.9;
      z = Math.sin(t) * r * d;
    }
    pos[i * 3] = x;
    pos[i * 3 + 1] = y;
    pos[i * 3 + 2] = z;
    seeds[i] = rand();
    const isHub = rand() < 0.045;
    hubs[i] = isHub ? 1 : 0;
    sizes[i] = isHub ? 2.6 + rand() * 1.2 : 0.9 + rand() * 1.1;
  }

  // k-nearest-neighbour links (O(n²) once at startup — fine for a few hundred nodes).
  const edgeSet = new Set();
  const edges = [];
  const maxD2 = (radius * 0.62) ** 2;
  const near = [];
  for (let i = 0; i < count; i++) {
    near.length = 0;
    const ax = pos[i * 3];
    const ay = pos[i * 3 + 1];
    const az = pos[i * 3 + 2];
    for (let j = 0; j < count; j++) {
      if (i === j) continue;
      const dx = pos[j * 3] - ax;
      const dy = pos[j * 3 + 1] - ay;
      const dz = pos[j * 3 + 2] - az;
      const d2 = dx * dx + dy * dy + dz * dz;
      if (d2 < maxD2) near.push([d2, j]);
    }
    near.sort((a, b) => a[0] - b[0]);
    const k = hubs[i] ? 7 : 2;
    for (let n = 0; n < Math.min(k, near.length); n++) {
      const j = near[n][1];
      const key = i < j ? i * 100000 + j : j * 100000 + i;
      if (!edgeSet.has(key)) {
        edgeSet.add(key);
        edges.push(i, j);
      }
    }
  }

  return { positions: pos, seeds, sizes, hubs, edges: Uint32Array.from(edges), count };
}

/**
 * Cheap capability check — no throwaway GL context (creating one costs real time on slow devices).
 * If context creation still fails later, NeuralField reports it and the 2D fallback takes over.
 */
export function hasWebGL() {
  return typeof window !== 'undefined' && 'WebGLRenderingContext' in window;
}

export function isLowPowerDevice() {
  const cores = navigator.hardwareConcurrency || 8;
  const mem = navigator.deviceMemory || 8;
  const small = window.matchMedia('(max-width: 768px)').matches;
  return cores <= 4 || mem <= 4 || small;
}
