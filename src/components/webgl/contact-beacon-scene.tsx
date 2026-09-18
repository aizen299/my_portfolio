"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 06 — Signal beacon: particles converge on a sphere and pulse like a
 * transmitter. Slow rotation, a breathing radius, and a twinkle. This is
 * the particle journey's terminus (crystal → bust → … → beacon).
 *
 * Theme transition: both dark and light color arrays are precomputed once.
 * uColorMix animates smoothly in useFrame — no geometry rebuild on toggle.
 */

const VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uSize;
  uniform float uColorMix;
  attribute vec3 aDarkColor;
  attribute vec3 aLightColor;
  attribute float aSeed;
  varying vec3 vColor;
  varying float vTwinkle;

  void main() {
    // breathing radius — the beacon "pulses"
    float pulse = 1.0 + 0.06 * sin(uTime * 1.6 + aSeed * 6.2831);
    vec3 p = position * pulse;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z);

    vColor = mix(aDarkColor, aLightColor, uColorMix);
    vTwinkle = 0.6 + 0.4 * sin(uTime * (2.0 + aSeed) + aSeed * 30.0);
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
    gl_FragColor = vec4(vColor, alpha * uBaseAlpha);
  }
`;

const ICE = new THREE.Color("#f5b14c");
const SIGNAL = new THREE.Color("#ff7a45");
const ICE_LIGHT = new THREE.Color("#a4500a");
const SIGNAL_LIGHT = new THREE.Color("#b93c0b");

/** Deterministic PRNG — keeps the beacon pure across re-renders. */
function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function Beacon({ count, isLight }: { count: number; isLight: boolean }) {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const group = useRef<THREE.Group>(null);

  // Both color sets precomputed once — no rebuild on theme toggle.
  const { positions, darkColors, lightColors, seeds } = useMemo(() => {
    const rand = mulberry32(20260613);
    const positions = new Float32Array(count * 3);
    const darkColors = new Float32Array(count * 3);
    const lightColors = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const c = new THREE.Color();
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < count; i++) {
      // fibonacci sphere for even coverage
      const y = 1 - (i / (count - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = golden * i;
      const radius = 1.6;
      positions[i * 3] = Math.cos(theta) * r * radius;
      positions[i * 3 + 1] = y * radius;
      positions[i * 3 + 2] = Math.sin(theta) * r * radius;

      const t = rand() * 0.8 + 0.1;

      // dark mode: teal/ice, additive
      c.copy(SIGNAL).lerp(ICE, t);
      darkColors[i * 3] = c.r;
      darkColors[i * 3 + 1] = c.g;
      darkColors[i * 3 + 2] = c.b;

      // light mode: dark teal/blue, normal blend
      c.copy(SIGNAL_LIGHT).lerp(ICE_LIGHT, t);
      lightColors[i * 3] = c.r;
      lightColors[i * 3 + 1] = c.g;
      lightColors[i * 3 + 2] = c.b;

      seeds[i] = rand();
    }
    return { positions, darkColors, lightColors, seeds };
  }, [count]); // isLight removed — colors animate via uColorMix

  // Uniforms initialised once; mutation happens imperatively in useFrame.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 1.5) },
      uSize: { value: 14 },
      uColorMix: { value: isLight ? 1 : 0 },
      uBaseAlpha: { value: isLight ? 0.6 : 0.5 },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Smooth transition state.
  const isLightRef = useRef(isLight);
  const colorMixCur = useRef(isLight ? 1 : 0);
  const alphaCur = useRef(isLight ? 0.6 : 0.5);
  // Initial blending fixed at mount; theme flips happen imperatively in
  // useFrame at the colour midpoint (refs must not be read during render).
  const [initialBlending] = useState<THREE.Blending>(() =>
    isLight ? THREE.NormalBlending : THREE.AdditiveBlending
  );
  const blendingCur = useRef(initialBlending);

  useEffect(() => {
    isLightRef.current = isLight;
  }, [isLight]);

  useFrame((_, delta) => {
    if (!mat.current || !group.current) return;
    mat.current.uniforms.uTime.value += Math.min(delta, 0.1);
    group.current.rotation.y += delta * 0.12;
    group.current.rotation.x += delta * 0.02;

    // Smooth theme transition — matches hero-particles timing.
    const easeF = 1 - Math.exp(-delta * 5);
    const targetMix = isLightRef.current ? 1 : 0;
    const targetAlpha = isLightRef.current ? 0.6 : 0.5;
    colorMixCur.current += (targetMix - colorMixCur.current) * easeF;
    alphaCur.current += (targetAlpha - alphaCur.current) * easeF;
    mat.current.uniforms.uColorMix.value = colorMixCur.current;
    mat.current.uniforms.uBaseAlpha.value = alphaCur.current;

    // Flip blending at the colour midpoint — least noticeable moment.
    const wantedBlending =
      colorMixCur.current > 0.5 ? THREE.NormalBlending : THREE.AdditiveBlending;
    if (wantedBlending !== blendingCur.current) {
      mat.current.blending = wantedBlending;
      blendingCur.current = wantedBlending;
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
        </bufferGeometry>
        <shaderMaterial
          ref={mat}
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

export default function ContactBeaconScene({
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
      camera={{ position: [0, 0, 6], fov: 50 }}
      dpr={[1, 1.5]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ pointerEvents: "none" }}
    >
      <Beacon count={count} isLight={isLight} />
    </Canvas>
  );
}
