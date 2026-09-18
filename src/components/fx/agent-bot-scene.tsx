"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const GRAVITY = 20;
const JUMP_FORCE = 6.5;
const ICE = "#f5b14c";
const CYAN = "#ff7a45";

// Camera: [0, 0, 8], fov 60 → halfH = tan(30°) * 8 ≈ 4.62 world units
const HALF_H = Math.tan((30 * Math.PI) / 180) * 8;

// 7 sections map to 7 floor Y positions — rises then falls like a game level:
// hero → about → experience → skills → projects → vault → contact
const FLOORS = [-3.5, -2.0, -0.5, 1.0, -0.5, -2.0, -3.5] as const;

// Overall robot size — scales the whole rig down from its original geometry.
const ROBOT_SCALE = 0.6;

// Robot local foot Y (bottom of legs below group center), scaled to match.
const FOOT_Y = 0.60 * ROBOT_SCALE;

function getFloor(scrollPct: number): { y: number; idx: number } {
  const idx = Math.min(FLOORS.length - 1, Math.floor(scrollPct * FLOORS.length));
  return { y: FLOORS[idx], idx };
}

function Robot() {
  const { size, clock } = useThree();

  const robotRef  = useRef<THREE.Group>(null!);
  const leftLeg   = useRef<THREE.Mesh>(null!);
  const rightLeg  = useRef<THREE.Mesh>(null!);
  const leftArm   = useRef<THREE.Mesh>(null!);
  const rightArm  = useRef<THREE.Mesh>(null!);
  const antTip    = useRef<THREE.Mesh>(null!);
  const light     = useRef<THREE.PointLight>(null!);

  const st = useRef({
    x: 0,
    // jump height above current floor
    y: 0,
    vy: 0,
    // current floor Y (world) — lerps toward targetGroundY
    groundY: FLOORS[0] as number,
    targetGroundY: FLOORS[0] as number,
    floorIdx: 0,
    grounded: true,
    facing: 1,          // 1 = right, -1 = left
    antennaTimer: 0,
    antennaOn: true,
  });

  // scrollHeight forces a synchronous layout read — cache it and only
  // recompute when the page's layout can actually change, not every frame.
  const maxScrollRef = useRef(1);
  useEffect(() => {
    const measure = () => {
      maxScrollRef.current = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
    };
    measure();
    window.addEventListener("resize", measure);
    const ro = new ResizeObserver(measure);
    ro.observe(document.documentElement);
    return () => {
      window.removeEventListener("resize", measure);
      ro.disconnect();
    };
  }, []);

  useFrame((_, delta) => {
    if (!robotRef.current) return;
    const s = st.current;
    const dt = Math.min(delta, 0.05);
    const t  = clock.getElapsedTime();

    // Max X so the robot stays inside the visible canvas width
    const halfW = HALF_H * (size.width / size.height) - 0.5;

    // ── Scroll percentage drives everything — no keyboard input ──────
    const pct = Math.min(1, window.scrollY / maxScrollRef.current);

    // Horizontal position is a direct function of scroll percentage:
    // 0% → far left, 100% → far right.
    const targetX = (pct * 2 - 1) * halfW;
    const prevX = s.x;
    s.x += (targetX - s.x) * Math.min(1, dt * 6);
    const dx = s.x - prevX;
    if (Math.abs(dx) > 0.0008) s.facing = Math.sign(dx);

    // ── Floor from scroll position ──────────────────────────────────
    const { y: newFloorY, idx: newIdx } = getFloor(pct);

    if (newIdx !== s.floorIdx) {
      const goingUp = newFloorY > s.targetGroundY;
      s.floorIdx = newIdx;
      s.targetGroundY = newFloorY;
      // Jump animation when ascending to a higher floor
      if (goingUp && s.grounded) {
        s.vy = JUMP_FORCE;
        s.grounded = false;
      }
    }
    // Smooth ground transition
    s.groundY += (s.targetGroundY - s.groundY) * Math.min(1, dt * 4);

    // ── Gravity / landing ──────────────────────────────────────────
    s.vy -= GRAVITY * dt;
    s.y  += s.vy * dt;
    if (s.y <= 0) { s.y = 0; s.vy = 0; s.grounded = true; }

    // Idle hover bob
    const idle  = s.grounded && Math.abs(dx) < 0.0008;
    const hover = idle ? Math.sin(t * 2) * 0.02 : 0;

    // ── Position robot so feet sit on the floor ─────────────────────
    const r = robotRef.current;
    r.position.set(s.x, s.groundY + FOOT_Y + s.y + hover, 0);
    r.rotation.y = s.facing === -1 ? Math.PI : 0;

    // Lean into direction of travel
    const targetLean = idle ? 0 : Math.sign(dx) * -0.12;
    r.rotation.z += (targetLean - r.rotation.z) * 0.18;

    if (light.current) light.current.position.copy(r.position);

    // ── Limb swing ──────────────────────────────────────────────────
    const swing = Math.sin(t * 9);
    if (!idle) {
      if (leftLeg.current)  leftLeg.current.rotation.x  =  swing * 0.6;
      if (rightLeg.current) rightLeg.current.rotation.x = -swing * 0.6;
      if (leftArm.current)  leftArm.current.rotation.x  = -swing * 0.45;
      if (rightArm.current) rightArm.current.rotation.x =  swing * 0.45;
    } else {
      if (leftLeg.current)  leftLeg.current.rotation.x  *= 0.85;
      if (rightLeg.current) rightLeg.current.rotation.x *= 0.85;
      if (leftArm.current)  leftArm.current.rotation.x  *= 0.85;
      if (rightArm.current) rightArm.current.rotation.x *= 0.85;
    }

    // ── Antenna blink ────────────────────────────────────────────────
    s.antennaTimer += dt;
    if (s.antennaTimer > 0.8) {
      s.antennaTimer = 0;
      s.antennaOn = !s.antennaOn;
      if (antTip.current) {
        (antTip.current.material as THREE.MeshBasicMaterial).color.set(
          s.antennaOn ? CYAN : ICE
        );
      }
    }
  });

  return (
    <>
      <pointLight ref={light} color={CYAN} intensity={2} distance={4} />
      <group ref={robotRef} scale={ROBOT_SCALE}>
        {/* Head */}
        <mesh position={[0, 0.85, 0]}>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
        {/* Antenna stem */}
        <mesh position={[0, 1.22, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 4]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
        {/* Antenna tip — blinks between signal and ice */}
        <mesh ref={antTip} position={[0, 1.38, 0]}>
          <sphereGeometry args={[0.05, 4, 4]} />
          <meshBasicMaterial color={CYAN} />
        </mesh>
        {/* Torso */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.45, 0.6, 0.25]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
        {/* Arms */}
        <mesh ref={leftArm}  position={[-0.37, 0.25, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 5]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
        <mesh ref={rightArm} position={[ 0.37, 0.25, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.45, 5]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
        {/* Legs */}
        <mesh ref={leftLeg}  position={[-0.14, -0.35, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.5, 5]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
        <mesh ref={rightLeg} position={[ 0.14, -0.35, 0]}>
          <cylinderGeometry args={[0.09, 0.07, 0.5, 5]} />
          <meshBasicMaterial color={ICE} wireframe />
        </mesh>
      </group>
    </>
  );
}

export function AgentBotScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 60 }}
      dpr={[1, 1.5]}
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", pointerEvents: "none" }}
    >
      <Robot />
    </Canvas>
  );
}
