// GLSL for the hero "signal lattice". A slow scan band sweeps across the
// structure, brightening nodes and links it passes — the signature effect.

const COMMON = /* glsl */ `
  uniform float uTime;
  uniform float uFade;
  uniform float uIntro;
  uniform float uPixelRatio;
  uniform vec3 uScanDir;
  uniform vec3 uCyan;
  uniform vec3 uBlue;
  uniform vec3 uViolet;

  float introEase() {
    float x = clamp(uIntro, 0.0, 1.0);
    return 1.0 - pow(1.0 - x, 3.0);
  }

  float scanBand(vec3 p) {
    float s = dot(normalize(p), uScanDir) * 0.5 + 0.5;
    float w = fract(uTime * 0.065);
    float d = abs(s - w);
    d = min(d, 1.0 - d);
    return exp(-d * d * 260.0);
  }

  vec3 breathe(vec3 p, float seed) {
    return p + normalize(p) * sin(uTime * 0.6 + seed * 12.0) * 0.045;
  }
`;

export const NODE_VERT = /* glsl */ `
  ${COMMON}
  attribute float aSize;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float intro = introEase();
    vec3 p = breathe(position, aSeed) * mix(0.55, 1.0, intro);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float band = scanBand(position);
    float tw = 0.6 + 0.4 * sin(uTime * (0.8 + aSeed) + aSeed * 40.0);
    float h = clamp(position.y / 3.2 * 0.5 + 0.5, 0.0, 1.0);
    vec3 col = mix(uBlue, uCyan, smoothstep(0.15, 0.9, h));
    col = mix(col, uViolet, step(0.88, aSeed) * 0.75);
    vColor = col + vec3(0.55, 0.85, 1.0) * band * 0.9;
    float depth = smoothstep(-15.0, -6.5, mv.z);
    vAlpha = ((0.25 + 0.75 * tw) * (0.3 + 0.7 * depth) * uFade + band * 0.55) * intro;
    gl_PointSize = aSize * (1.0 + band * 1.1) * uPixelRatio * (34.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const POINT_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float core = smoothstep(0.2, 0.0, d);
    float halo = pow(1.0 - d * 2.0, 2.4);
    gl_FragColor = vec4(vColor, (core * 0.9 + halo * 0.5) * vAlpha);
  }
`;

export const LINE_VERT = /* glsl */ `
  ${COMMON}
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float intro = introEase();
    vec3 p = breathe(position, aSeed) * mix(0.55, 1.0, intro);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float band = scanBand(position);
    float depth = smoothstep(-15.0, -6.5, mv.z);
    vColor = mix(uBlue, uCyan, 0.35 + band * 0.65);
    vAlpha = (0.06 + 0.09 * depth) * uFade * intro + band * 0.42 * intro;
    gl_Position = projectionMatrix * mv;
  }
`;

export const LINE_FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    gl_FragColor = vec4(vColor, vAlpha);
  }
`;

// Signals: particles that travel along links, computed entirely on the GPU.
export const SIGNAL_VERT = /* glsl */ `
  ${COMMON}
  attribute vec3 aEnd;
  attribute float aSeedA;
  attribute float aSeedB;
  attribute float aPhase;
  attribute float aSpeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float intro = introEase();
    float t = fract(uTime * aSpeed + aPhase);
    vec3 a = breathe(position, aSeedA);
    vec3 b = breathe(aEnd, aSeedB);
    vec3 p = mix(a, b, t) * mix(0.55, 1.0, intro);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float fade = sin(t * 3.14159265);
    vColor = mix(uCyan, vec3(1.0), 0.4);
    vAlpha = fade * uFade * intro;
    gl_PointSize = (2.4 + 1.8 * fade) * uPixelRatio * (34.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

// Orbit beads: one point per ring, position set on the CPU.
export const BEAD_VERT = /* glsl */ `
  uniform float uPixelRatio;
  uniform float uAlpha;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vColor = vec3(0.8, 0.96, 1.0);
    vAlpha = uAlpha;
    gl_PointSize = 5.5 * uPixelRatio * (34.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

export const DUST_VERT = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uIntro;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    float tw = 0.5 + 0.5 * sin(uTime * (0.4 + aSeed * 0.8) + aSeed * 60.0);
    vColor = mix(vec3(0.45, 0.6, 1.0), vec3(0.75, 0.9, 1.0), aSeed);
    vAlpha = (0.12 + 0.38 * tw) * clamp(uIntro, 0.0, 1.0);
    gl_PointSize = (0.8 + aSeed * 1.1) * uPixelRatio * (24.0 / -mv.z) * 2.0;
    gl_Position = projectionMatrix * mv;
  }
`;
