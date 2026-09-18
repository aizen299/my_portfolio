"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 01 — Surface particle field: points sampled on the facets of stacked,
 * elongated octahedral shards → crystalline silhouette. Each particle
 * drifts along a precomputed direction (curl-noise-in-shader was ~6
 * simplex evals × 80k verts per frame — it visibly stalled the shared
 * rAF clock and made scroll stutter; trig drift reads the same at this
 * amplitude). A mouse uniform repels particles near the cursor. Whole
 * structure rotates slowly. Count is set by GPU tier (hero-canvas.tsx).
 *
 * Phase 3: each particle also carries a morph target (aTarget) sampled
 * on an abstract bust — head sphere, neck cylinder, shoulder ellipsoid.
 * uMorph (driven by scroll, see particle-field.tsx) blends crystal →
 * bust as the visitor descends into Profile.
 *
 * Theme transition: both dark and light color arrays are precomputed once.
 * uColorMix (0=dark, 1=light) is animated smoothly in useFrame — no
 * geometry rebuild on toggle, blending flips at the 50% midpoint.
 */

const VERTEX = /* glsl */ `
uniform float uTime;
uniform vec3 uMouse;
uniform float uPixelRatio;
uniform float uSize;
uniform float uMorph;
uniform float uColorMix;

attribute vec3 aDarkColor;
attribute vec3 aLightColor;
attribute float aSeed;
attribute vec3 aDrift;
attribute vec3 aTarget;

varying vec3 vColor;
varying float vTwinkle;

void main() {
  vec3 p = mix(position, aTarget, uMorph);

  // gentle per-particle drift along a fixed random direction
  float phase = uTime * (0.3 + aSeed * 0.5) + aSeed * 6.2831;
  p += aDrift * (sin(phase) * 0.1) + aDrift.zxy * (cos(phase * 0.7) * 0.05);

  // cursor repulsion (uMouse in object space)
  vec3 toMouse = p - uMouse;
  float dist = length(toMouse);
  float force = smoothstep(1.6, 0.0, dist);
  p += normalize(toMouse + 0.0001) * force * force * 0.9;

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  gl_PointSize = uSize * uPixelRatio * (1.0 / -mvPosition.z);

  vColor = mix(aDarkColor, aLightColor, uColorMix);
  vTwinkle = 0.65 + 0.35 * sin(uTime * (1.5 + aSeed) + aSeed * 40.0);
}
`;

const FRAGMENT = /* glsl */ `
uniform float uBaseAlpha;
varying vec3 vColor;
varying float vTwinkle;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  float alpha = smoothstep(0.5, 0.05, d) * vTwinkle;
  if (alpha < 0.01) discard;
  // dark mode (additive): keep low so stacked points don't blow out to white
  // light mode (normal):  higher alpha so dark navy particles read on light bg
  gl_FragColor = vec4(vColor, alpha * uBaseAlpha);
}
`;

const SILVER = new THREE.Color("#e8e1d9");
const ICE = new THREE.Color("#f5b14c");
// Light mode: dark navy/blue particles on arctic bg with NormalBlending
const SILVER_LIGHT = new THREE.Color("#4A3320");
const ICE_LIGHT = new THREE.Color("#a4500a");

/** Octahedron face corners for surface sampling. */
const OCTA_FACES: [THREE.Vector3, THREE.Vector3, THREE.Vector3][] = (() => {
  const px = new THREE.Vector3(1, 0, 0);
  const nx = new THREE.Vector3(-1, 0, 0);
  const py = new THREE.Vector3(0, 1, 0);
  const ny = new THREE.Vector3(0, -1, 0);
  const pz = new THREE.Vector3(0, 0, 1);
  const nz = new THREE.Vector3(0, 0, -1);
  return [
    [px, py, pz], [pz, py, nx], [nx, py, nz], [nz, py, px],
    [px, ny, pz], [pz, ny, nx], [nx, ny, nz], [nz, ny, px],
  ];
})();

interface Shard {
  scale: THREE.Vector3;
  rotation: THREE.Quaternion;
  offset: THREE.Vector3;
}

function buildShards(rand: () => number): Shard[] {
  const shards: Shard[] = [];
  const count = 7;
  for (let i = 0; i < count; i++) {
    const main = i === 0;
    const s = main ? 1 : 0.25 + rand() * 0.45;
    shards.push({
      // elongated on y → crystal spire silhouette
      scale: new THREE.Vector3(s * 1.1, s * (2.2 + rand() * 1.2), s * 1.1),
      rotation: new THREE.Quaternion().setFromEuler(
        new THREE.Euler(rand() * 0.5 - 0.25, rand() * Math.PI * 2, rand() * 0.5 - 0.25)
      ),
      offset: main
        ? new THREE.Vector3(0, 0, 0)
        : new THREE.Vector3(
            (rand() - 0.5) * 3.4,
            (rand() - 0.5) * 2.4,
            (rand() - 0.5) * 3.4
          ),
    });
  }
  return shards;
}

/** Deterministic PRNG so the crystal is identical every load. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Scroll → render-loop bridge. ScrollTrigger (particle-field.tsx) writes
 * here; useFrame reads and eases every frame. A mutable module singleton
 * avoids re-rendering the R3F tree on scroll.
 */
export const particleState = { morph: 0 };

/** Sample one point on the abstract bust: head / neck / shoulders. */
function sampleBust(rand: () => number, out: THREE.Vector3) {
  const region = rand();
  if (region < 0.3) {
    // head — sphere
    const y = 2 * rand() - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - y * y);
    out
      .set(Math.cos(phi) * s, y, Math.sin(phi) * s)
      .multiplyScalar(0.6)
      .add(HEAD_CENTER);
  } else if (region < 0.42) {
    // neck — short tapered cylinder bridging head and shoulders
    const phi = rand() * Math.PI * 2;
    out.set(Math.cos(phi) * 0.26, 0.05 + rand() * 0.42, Math.sin(phi) * 0.26);
  } else {
    // shoulders/chest — wide, flat ellipsoid (reads as a torso, not a ball)
    let y = 2 * rand() - 1;
    for (let tries = 0; y < -0.7 && tries < 4; tries++) y = 2 * rand() - 1;
    const phi = rand() * Math.PI * 2;
    const s = Math.sqrt(1 - y * y);
    out
      .set(Math.cos(phi) * s * 1.5, y * 0.75, Math.sin(phi) * s * 0.62)
      .add(TORSO_CENTER);
  }
  out.multiplyScalar(1.18);
  out.x += (rand() - 0.5) * 0.05;
  out.y += (rand() - 0.5) * 0.05;
  out.z += (rand() - 0.5) * 0.05;
}

const HEAD_CENTER = new THREE.Vector3(0, 0.92, 0);
const TORSO_CENTER = new THREE.Vector3(0, -0.5, 0);

function Particles({ count, isLight }: { count: number; isLight: boolean }) {
  const material = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);
  const { gl } = useThree();

  // Both color sets computed once — no rebuild on theme toggle.
  const { positions, darkColors, lightColors, seeds, drift, targets } = useMemo(() => {
    const rand = mulberry32(20260612);
    const bustRand = mulberry32(987654321);
    const shards = buildShards(rand);
    const positions = new Float32Array(count * 3);
    const darkColors = new Float32Array(count * 3);
    const lightColors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const drift = new Float32Array(count * 3);
    const targets = new Float32Array(count * 3);
    const v = new THREE.Vector3();
    const t = new THREE.Vector3();
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const shard = shards[Math.floor(rand() * shards.length)];
      const [a, b, cc] = OCTA_FACES[Math.floor(rand() * 8)];
      // barycentric surface sample
      let u = rand();
      let w = rand();
      if (u + w > 1) {
        u = 1 - u;
        w = 1 - w;
      }
      v.set(0, 0, 0)
        .addScaledVector(a, u)
        .addScaledVector(b, w)
        .addScaledVector(cc, 1 - u - w);
      v.multiply(shard.scale).applyQuaternion(shard.rotation).add(shard.offset);
      // faint surface jitter so facets read as dust, not solid planes
      v.x += (rand() - 0.5) * 0.06;
      v.y += (rand() - 0.5) * 0.06;
      v.z += (rand() - 0.5) * 0.06;

      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;

      // Same roll drives both palettes so ice particles stay ice across themes
      const colorRoll = rand();

      // dark mode: light silver/ice, additive glow; tips brighter
      c.copy(colorRoll < 0.25 ? ICE : SILVER);
      const darkLift = 0.55 + 0.45 * Math.min(1, Math.abs(v.y) / 2.5);
      darkColors[i * 3] = c.r * darkLift;
      darkColors[i * 3 + 1] = c.g * darkLift;
      darkColors[i * 3 + 2] = c.b * darkLift;

      // light mode: dark navy/blue, normal blend — uniform opacity
      c.copy(colorRoll < 0.25 ? ICE_LIGHT : SILVER_LIGHT);
      lightColors[i * 3] = c.r;
      lightColors[i * 3 + 1] = c.g;
      lightColors[i * 3 + 2] = c.b;

      seeds[i] = rand();

      // fixed random unit drift direction per particle
      const dx = rand() - 0.5;
      const dy = rand() - 0.5;
      const dz = rand() - 0.5;
      const len = Math.hypot(dx, dy, dz) || 1;
      drift[i * 3] = dx / len;
      drift[i * 3 + 1] = dy / len;
      drift[i * 3 + 2] = dz / len;

      // morph target on the bust
      sampleBust(bustRand, t);
      targets[i * 3] = t.x;
      targets[i * 3 + 1] = t.y;
      targets[i * 3 + 2] = t.z;
    }
    return { positions, darkColors, lightColors, seeds, drift, targets };
  }, [count]); // isLight removed — colors animate via uColorMix uniform

  // Uniforms initialised once; all mutation happens imperatively in useFrame.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector3(999, 999, 0) },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      uSize: { value: 16 },
      uMorph: { value: 0 },
      uColorMix: { value: isLight ? 1 : 0 },
      uBaseAlpha: { value: isLight ? 0.55 : 0.35 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Smooth transition state — written by useEffect, read by useFrame.
  const isLightRef = useRef(isLight);
  const colorMixCur = useRef(isLight ? 1 : 0);
  const alphaCur = useRef(isLight ? 0.55 : 0.35);
  // Initial blending fixed at mount; theme flips happen imperatively in
  // useFrame at the colour midpoint (refs must not be read during render).
  const [initialBlending] = useState<THREE.Blending>(() =>
    isLight ? THREE.NormalBlending : THREE.AdditiveBlending
  );
  const blendingCur = useRef(initialBlending);

  useEffect(() => {
    isLightRef.current = isLight;
  }, [isLight]);

  // pointer → object-space point on the z=0 plane, lerped for smoothness
  const ndc = useRef(new THREE.Vector2(99, 99));
  const raycaster = useMemo(() => new THREE.Raycaster(), []);
  const plane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0),
    []
  );
  const hit = useMemo(() => new THREE.Vector3(999, 999, 0), []);
  const local = useMemo(() => new THREE.Vector3(999, 999, 0), []);

  useEffect(() => {
    // Cache the canvas rect (it's full-viewport) instead of measuring on
    // every pointermove — getBoundingClientRect in the move handler forces
    // a synchronous layout that competes with the scroll on the rAF clock.
    let rect = gl.domElement.getBoundingClientRect();
    const remeasure = () => {
      rect = gl.domElement.getBoundingClientRect();
    };
    const onMove = (e: PointerEvent) => {
      ndc.current.set(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("resize", remeasure);
    window.addEventListener("scroll", remeasure, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", remeasure);
      window.removeEventListener("scroll", remeasure);
    };
  }, [gl]);

  const morphCur = useRef(0);

  useFrame((state, delta) => {
    if (!material.current || !group.current) return;
    material.current.uniforms.uTime.value += Math.min(delta, 0.1);

    // If delta is large the canvas just resumed after a pause (fast scroll
    // jumped past the morph zone). Snap to the target immediately so the
    // crystal / bust is never stuck mid-morph after a fast scroll.
    if (delta > 0.25) {
      morphCur.current = particleState.morph;
    } else {
      // Frame-rate independent easing (half-life ≈ 87ms at k=8)
      morphCur.current +=
        (particleState.morph - morphCur.current) * (1 - Math.exp(-delta * 8));
    }
    const m = morphCur.current;
    const eased = m * m * (3 - 2 * m);
    material.current.uniforms.uMorph.value = eased;

    // Smooth theme transition — k=5 gives ~140ms half-life, ~400ms to settle.
    const easeF = 1 - Math.exp(-delta * 5);
    const targetMix = isLightRef.current ? 1 : 0;
    const targetAlpha = isLightRef.current ? 0.55 : 0.35;
    colorMixCur.current += (targetMix - colorMixCur.current) * easeF;
    alphaCur.current += (targetAlpha - alphaCur.current) * easeF;
    material.current.uniforms.uColorMix.value = colorMixCur.current;
    material.current.uniforms.uBaseAlpha.value = alphaCur.current;

    // Flip blending at the colour midpoint — least noticeable moment.
    const wantedBlending =
      colorMixCur.current > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
    if (wantedBlending !== blendingCur.current) {
      material.current.blending = wantedBlending;
      blendingCur.current = wantedBlending;
    }

    // bust drifts toward the right column of Profile on desktop and
    // faces forward — rotation slows as the morph completes
    const shiftX = state.size.width >= 1024 ? 1.25 : 0;
    group.current.position.x = eased * shiftX;
    group.current.rotation.y += delta * 0.06 * (1 - 0.75 * eased);

    raycaster.setFromCamera(ndc.current, state.camera);
    if (raycaster.ray.intersectPlane(plane, hit)) {
      // convert to the rotating group's local space so repulsion tracks
      local.copy(hit);
      group.current.worldToLocal(local);
      material.current.uniforms.uMouse.value.lerp(local, 0.15);
    }
  });

  return (
    <group ref={group}>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          <bufferAttribute attach="attributes-aDarkColor" args={[darkColors, 3]} />
          <bufferAttribute attach="attributes-aLightColor" args={[lightColors, 3]} />
          <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
          <bufferAttribute attach="attributes-aDrift" args={[drift, 3]} />
          <bufferAttribute attach="attributes-aTarget" args={[targets, 3]} />
        </bufferGeometry>
        <shaderMaterial
          ref={material}
          vertexShader={VERTEX}
          fragmentShader={FRAGMENT}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={initialBlending}
        />
      </points>
    </group>
  );
}

export default function HeroParticlesScene({
  count,
  paused,
  isLight,
}: {
  count: number;
  paused: boolean;
  isLight: boolean;
}) {
  return (
    <Canvas
      frameloop={paused ? "never" : "always"}
      camera={{ position: [0, 0.4, 7.5], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{
        antialias: false,
        powerPreference: "high-performance",
        alpha: true,
      }}
      style={{ pointerEvents: "none" }}
    >
      <Particles count={count} isLight={isLight} />
    </Canvas>
  );
}
