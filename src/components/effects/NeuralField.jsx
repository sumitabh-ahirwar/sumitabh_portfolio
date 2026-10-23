import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { buildLattice, isLowPowerDevice } from '../../lib/lattice';
import { mulberry32 } from '../../lib/random';
import { NODE_VERT, POINT_FRAG, LINE_VERT, LINE_FRAG, SIGNAL_VERT, BEAD_VERT, DUST_VERT } from './shaders';

/**
 * WebGL hero centrepiece. Loaded lazily (three.js lives in its own chunk).
 * - Adaptive quality: fewer nodes + lower pixel ratio on low-power / small devices.
 * - Renders only while the hero is on screen and the tab is visible.
 * - Reduced motion: renders still frames only (on resize), no animation loop.
 * - Disposes every GPU resource on unmount.
 */
export default function NeuralField({ active, reduced, onError }) {
  const mountRef = useRef(null);
  const state = useRef({ active, reduced, introStart: null, onError });

  useEffect(() => {
    state.current.onError = onError;
  }, [onError]);

  useEffect(() => {
    state.current.active = active;
    state.current.reduced = reduced;
    state.current.kick?.();
  }, [active, reduced]);

  useEffect(() => {
    const mount = mountRef.current;
    const s = state.current;
    const low = isLowPowerDevice();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: !low, alpha: true, powerPreference: 'high-performance' });
    } catch {
      s.onError?.();
      return undefined;
    }
    const dpr = Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75);
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    const canvas = renderer.domElement;
    canvas.setAttribute('aria-hidden', 'true');
    mount.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 120);
    camera.position.set(0, 0, 10);

    const uniforms = {
      uTime: { value: 0 },
      uFade: { value: 1 },
      uIntro: { value: 0 },
      uPixelRatio: { value: dpr },
      uScanDir: { value: new THREE.Vector3(0.55, 0.65, 0.25).normalize() },
      uCyan: { value: new THREE.Color('#5ee7ff') },
      uBlue: { value: new THREE.Color('#3f6dff') },
      uViolet: { value: new THREE.Color('#9a8cff') },
    };
    const additive = { uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
    const disposables = [];
    const track = (...items) => {
      disposables.push(...items);
      return items[0];
    };

    const lattice = buildLattice({ count: low ? 300 : 560 });
    const group = new THREE.Group();
    scene.add(group);

    // Nodes
    const nodeGeo = track(new THREE.BufferGeometry());
    nodeGeo.setAttribute('position', new THREE.BufferAttribute(lattice.positions, 3));
    nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(lattice.sizes, 1));
    nodeGeo.setAttribute('aSeed', new THREE.BufferAttribute(lattice.seeds, 1));
    const nodeMat = track(new THREE.ShaderMaterial({ ...additive, vertexShader: NODE_VERT, fragmentShader: POINT_FRAG }));
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    nodes.frustumCulled = false;
    group.add(nodes);

    // Links
    const { edges, positions: P, seeds } = lattice;
    const E = edges.length / 2;
    const linePos = new Float32Array(E * 6);
    const lineSeed = new Float32Array(E * 2);
    for (let e = 0; e < E; e++) {
      const a = edges[e * 2];
      const b = edges[e * 2 + 1];
      linePos.set([P[a * 3], P[a * 3 + 1], P[a * 3 + 2], P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], e * 6);
      lineSeed[e * 2] = seeds[a];
      lineSeed[e * 2 + 1] = seeds[b];
    }
    const lineGeo = track(new THREE.BufferGeometry());
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3));
    lineGeo.setAttribute('aSeed', new THREE.BufferAttribute(lineSeed, 1));
    const lineMat = track(new THREE.ShaderMaterial({ ...additive, vertexShader: LINE_VERT, fragmentShader: LINE_FRAG }));
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lines.frustumCulled = false;
    group.add(lines);

    // Signals travelling along random links
    const rand = mulberry32(3);
    const S = Math.min(low ? 90 : 220, E);
    const sStart = new Float32Array(S * 3);
    const sEnd = new Float32Array(S * 3);
    const sSeedA = new Float32Array(S);
    const sSeedB = new Float32Array(S);
    const sPhase = new Float32Array(S);
    const sSpeed = new Float32Array(S);
    for (let i = 0; i < S; i++) {
      const e = Math.floor(rand() * E);
      const flip = rand() < 0.5;
      const a = edges[e * 2 + (flip ? 1 : 0)];
      const b = edges[e * 2 + (flip ? 0 : 1)];
      sStart.set([P[a * 3], P[a * 3 + 1], P[a * 3 + 2]], i * 3);
      sEnd.set([P[b * 3], P[b * 3 + 1], P[b * 3 + 2]], i * 3);
      sSeedA[i] = seeds[a];
      sSeedB[i] = seeds[b];
      sPhase[i] = rand();
      sSpeed[i] = 0.18 + rand() * 0.35;
    }
    const sigGeo = track(new THREE.BufferGeometry());
    sigGeo.setAttribute('position', new THREE.BufferAttribute(sStart, 3));
    sigGeo.setAttribute('aEnd', new THREE.BufferAttribute(sEnd, 3));
    sigGeo.setAttribute('aSeedA', new THREE.BufferAttribute(sSeedA, 1));
    sigGeo.setAttribute('aSeedB', new THREE.BufferAttribute(sSeedB, 1));
    sigGeo.setAttribute('aPhase', new THREE.BufferAttribute(sPhase, 1));
    sigGeo.setAttribute('aSpeed', new THREE.BufferAttribute(sSpeed, 1));
    const sigMat = track(new THREE.ShaderMaterial({ ...additive, vertexShader: SIGNAL_VERT, fragmentShader: POINT_FRAG }));
    const signals = new THREE.Points(sigGeo, sigMat);
    signals.frustumCulled = false;
    group.add(signals);

    // Two faint orbital rings, each with a bead
    const rings = [];
    [
      { a: 4.6, b: 4.6, tiltX: 1.25, tiltZ: 0.35, speed: 0.16, opacity: 0.16 },
      { a: 5.4, b: 5.4, tiltX: 1.42, tiltZ: -0.55, speed: -0.1, opacity: 0.1 },
    ].forEach((cfg) => {
      const pts = new THREE.EllipseCurve(0, 0, cfg.a, cfg.b).getPoints(160).map((p) => new THREE.Vector3(p.x, p.y, 0));
      const geo = track(new THREE.BufferGeometry().setFromPoints(pts));
      const mat = track(
        new THREE.LineBasicMaterial({ color: '#7fb4ff', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }),
      );
      const ring = new THREE.LineLoop(geo, mat);
      const pivot = new THREE.Group();
      pivot.rotation.set(cfg.tiltX, 0, cfg.tiltZ);
      pivot.add(ring);
      const beadGeo = track(new THREE.BufferGeometry());
      beadGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3));
      const beadMat = track(
        new THREE.ShaderMaterial({
          uniforms: { uPixelRatio: uniforms.uPixelRatio, uAlpha: { value: 0 } },
          vertexShader: BEAD_VERT,
          fragmentShader: POINT_FRAG,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      );
      const bead = new THREE.Points(beadGeo, beadMat);
      bead.frustumCulled = false;
      pivot.add(bead);
      group.add(pivot);
      rings.push({ cfg, mat, beadMat, beadGeo });
    });

    // Distant dust
    const D = low ? 450 : 1000;
    const dustPos = new Float32Array(D * 3);
    const dustSeed = new Float32Array(D);
    for (let i = 0; i < D; i++) {
      const u = rand() * 2 - 1;
      const t = rand() * Math.PI * 2;
      const r = Math.sqrt(1 - u * u);
      const d = 12 + rand() * 22;
      dustPos.set([Math.cos(t) * r * d, u * d * 0.6, Math.sin(t) * r * d - 8], i * 3);
      dustSeed[i] = rand();
    }
    const dustGeo = track(new THREE.BufferGeometry());
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3));
    dustGeo.setAttribute('aSeed', new THREE.BufferAttribute(dustSeed, 1));
    const dustMat = track(new THREE.ShaderMaterial({ ...additive, vertexShader: DUST_VERT, fragmentShader: POINT_FRAG }));
    const dust = new THREE.Points(dustGeo, dustMat);
    dust.frustumCulled = false;
    scene.add(dust);

    // Layout: sit to the right of the headline on wide screens, centred and smaller on narrow ones.
    const base = { x: 0, y: 0, scale: 1 };
    const layout = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = mount.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      const halfW = Math.tan(THREE.MathUtils.degToRad(21)) * 10 * camera.aspect;
      if (w >= 900) {
        base.x = Math.min(halfW * 0.5, 4.1);
        base.y = 0.05;
        base.scale = 0.8;
      } else {
        base.x = 0;
        base.y = 1.1;
        base.scale = Math.max(0.62, Math.min(0.85, halfW / 4.2));
      }
      group.scale.setScalar(base.scale);
    };
    layout();

    // Pointer parallax (fine pointers only)
    const pointer = { x: 0, y: 0, sx: 0, sy: 0 };
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const onPointer = (e) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    if (fine) window.addEventListener('pointermove', onPointer, { passive: true });

    // Render loop with visibility gating
    const clock = new THREE.Clock(false);
    let time = 6; // start mid-cycle so the scan band is already on screen
    let raf = 0;
    let onScreen = true;

    const frame = (dt) => {
      time += dt;
      uniforms.uTime.value = time;
      if (s.active && s.introStart === null) s.introStart = time;
      const intro = s.introStart === null ? 0 : Math.min(1, (time - s.introStart) / 2.6);
      uniforms.uIntro.value = s.reduced ? (s.active ? 1 : 0) : intro;

      pointer.sx += (pointer.x - pointer.sx) * 0.035;
      pointer.sy += (pointer.y - pointer.sy) * 0.035;

      const p = Math.min(window.scrollY / Math.max(1, window.innerHeight), 1.4);
      group.rotation.y += dt * 0.055;
      group.rotation.x = 0.22 + pointer.sy * 0.16 + p * 0.25;
      group.rotation.z = -pointer.sx * 0.05;
      group.position.set(base.x + pointer.sx * 0.25, base.y - pointer.sy * 0.18 + p * 1.6, 0);
      camera.position.x = pointer.sx * 0.45;
      camera.position.y = -pointer.sy * 0.3;
      camera.position.z = 10 + p * 1.8;
      camera.lookAt(0, 0, 0);
      uniforms.uFade.value = 1 - Math.min(p, 1) * 0.55;
      dust.rotation.y = time * 0.006;

      const ringAlpha = uniforms.uIntro.value * uniforms.uFade.value;
      rings.forEach(({ cfg, mat, beadMat, beadGeo }) => {
        mat.opacity = cfg.opacity * ringAlpha;
        beadMat.uniforms.uAlpha.value = 0.95 * ringAlpha;
        const a = time * cfg.speed;
        const arr = beadGeo.attributes.position.array;
        arr[0] = Math.cos(a) * cfg.a;
        arr[1] = Math.sin(a) * cfg.b;
        beadGeo.attributes.position.needsUpdate = true;
      });

      renderer.render(scene, camera);
    };

    // Low-power devices render at ~30 fps: the motion is slow, so the difference is invisible.
    const minFrame = low ? 1 / 31 : 0;
    let acc = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      acc += Math.min(clock.getDelta(), 0.05);
      if (acc < minFrame) return;
      frame(acc);
      acc = 0;
    };
    const running = () => raf !== 0;
    let compiled = false;
    const start = () => {
      if (!compiled || running() || s.reduced || !onScreen || document.hidden) return;
      clock.start();
      clock.getDelta();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      clock.stop();
    };
    // Re-evaluate after prop changes (reduced motion / intro start)
    s.kick = () => {
      if (!compiled) return;
      if (s.reduced) {
        stop();
        frame(0);
      } else start();
    };

    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      if (onScreen) start();
      else stop();
    });
    io.observe(mount);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);
    const ro = new ResizeObserver(() => {
      layout();
      if (compiled && !running()) frame(0);
    });
    ro.observe(mount);

    const onLost = (e) => {
      e.preventDefault();
      stop();
      s.onError?.();
    };
    canvas.addEventListener('webglcontextlost', onLost);

    // Compile shaders off the main thread where supported (KHR_parallel_shader_compile),
    // then start rendering.
    let disposed = false;
    const begin = () => {
      if (disposed) return;
      compiled = true;
      frame(0);
      s.kick();
    };
    if (renderer.compileAsync) renderer.compileAsync(scene, camera).then(begin, begin);
    else begin();

    return () => {
      disposed = true;
      stop();
      s.kick = null;
      io.disconnect();
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('pointermove', onPointer);
      canvas.removeEventListener('webglcontextlost', onLost);
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  return <div ref={mountRef} className="hero-scene__canvas" />;
}
