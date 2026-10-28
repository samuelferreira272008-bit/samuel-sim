import { Canvas, useFrame } from "@react-three/fiber";
import {
  MeshDistortMaterial,
  MeshWobbleMaterial,
  Float,
  Sphere,
  Torus,
  Icosahedron,
  Sparkles as DreiSparkles,
} from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function LiquidCore() {
  const coreRef = useRef<THREE.Mesh>(null);
  const shellRef = useRef<THREE.Mesh>(null);
  const ring1Ref = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.x = THREE.MathUtils.lerp(
        coreRef.current.rotation.x,
        t * 0.25 + pointer.y * 0.6,
        0.08,
      );
      coreRef.current.rotation.y = THREE.MathUtils.lerp(
        coreRef.current.rotation.y,
        t * 0.32 + pointer.x * 0.6,
        0.08,
      );
      coreRef.current.position.x = THREE.MathUtils.lerp(coreRef.current.position.x, pointer.x * 0.35, 0.06);
      coreRef.current.position.y = THREE.MathUtils.lerp(coreRef.current.position.y, pointer.y * 0.25, 0.06);
    }
    if (shellRef.current) {
      shellRef.current.rotation.x = -t * 0.18 - pointer.y * 0.4;
      shellRef.current.rotation.z = t * 0.22 + pointer.x * 0.4;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x = Math.PI / 2.6 + Math.sin(t * 0.5) * 0.2 + pointer.y * 0.3;
      ring1Ref.current.rotation.y = t * 0.35 + pointer.x * 0.3;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.x = -Math.PI / 3 + Math.cos(t * 0.4) * 0.25 - pointer.y * 0.25;
      ring2Ref.current.rotation.z = -t * 0.28 + pointer.x * 0.3;
    }
  });

  return (
    <group position={[0.2, 0.15, 0]}>
      <Float speed={1.8} rotationIntensity={0.6} floatIntensity={1.1}>
        {/* Inner Iridescent Liquid Glass Core */}
        <Sphere ref={coreRef} args={[1.18, 128, 128]}>
          <MeshDistortMaterial
            color="#e2e8f0"
            emissive="#1e293b"
            emissiveIntensity={0.45}
            distort={0.52}
            speed={2.4}
            roughness={0.08}
            metalness={0.92}
          />
        </Sphere>

        {/* Wireframe Geodesic Glass Cage */}
        <Icosahedron ref={shellRef} args={[1.52, 2]}>
          <MeshWobbleMaterial
            color="#94a3b8"
            wireframe
            transparent
            opacity={0.22}
            factor={0.18}
            speed={1.2}
          />
        </Icosahedron>

        {/* Orbital Liquid Glass Rings */}
        <Torus ref={ring1Ref} args={[1.85, 0.018, 32, 160]}>
          <meshStandardMaterial
            color="#f8fafc"
            emissive="#64748b"
            emissiveIntensity={0.6}
            metalness={0.95}
            roughness={0.1}
            transparent
            opacity={0.65}
          />
        </Torus>

        <Torus ref={ring2Ref} args={[2.15, 0.012, 24, 140]}>
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.7}
            metalness={0.9}
            roughness={0.15}
            transparent
            opacity={0.45}
          />
        </Torus>
      </Float>
    </group>
  );
}

function LiquidParticles() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 85;

  const { basePositions, positions } = useMemo(() => {
    const base = new Float32Array(count * 3);
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = 1.6 + Math.random() * 1.4;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
    }
    return { basePositions: base, positions: pos };
  }, []);

  useFrame(({ clock, pointer }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const geom = pointsRef.current.geometry;
    const attr = geom.getAttribute("position") as THREE.BufferAttribute;
    const px = pointer.x * 2.2;
    const py = pointer.y * 2.2;

    for (let i = 0; i < count; i++) {
      const bx = basePositions[i * 3];
      const by = basePositions[i * 3 + 1];
      const bz = basePositions[i * 3 + 2];

      const dx = bx - px;
      const dy = by - py;
      const distSq = dx * dx + dy * dy;
      const force = Math.max(0, 1.15 - Math.sqrt(distSq)) * 0.3;
      const angle = Math.atan2(dy, dx);

      attr.setXYZ(
        i,
        bx + Math.cos(angle) * force + Math.sin(t * 0.8 + i) * 0.06,
        by + Math.sin(angle) * force + Math.cos(t * 0.7 + i) * 0.06,
        bz + Math.sin(t * 0.6 + i * 0.5) * 0.08,
      );
    }
    attr.needsUpdate = true;
    pointsRef.current.rotation.y = t * 0.08;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.048} color="#94a3b8" transparent opacity={0.85} sizeAttenuation />
    </points>
  );
}

export default function HeroSceneInner() {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.5], fov: 46 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: false }}
      onCreated={(state) => {
        state.gl.setClearColor(0x000000, 0);
      }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[5, 6, 5]} intensity={2.2} color="#ffffff" />
      <directionalLight position={[-5, -4, -3]} intensity={1.4} color="#38bdf8" />
      <pointLight position={[2, -3, 3]} intensity={1.6} color="#a855f7" />
      <LiquidCore />
      <LiquidParticles />
      <DreiSparkles count={45} scale={4.8} size={1.8} speed={0.4} opacity={0.5} color="#38bdf8" />
    </Canvas>
  );
}
