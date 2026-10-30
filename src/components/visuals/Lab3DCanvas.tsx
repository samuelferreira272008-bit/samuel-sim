import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { motion } from "framer-motion";
import { RotateCw, Eye, Sparkles } from "lucide-react";
import { SegmentedControl } from "./SegmentedControl";

type GeometryType = "knot" | "icosahedron" | "sphere";

/**
 * Three.js Interactive 3D Lab Simulation Canvas
 * Features:
 * - Real-time WebGL rendering with specular lighting and ambient particle constellation
 * - Interactive pointer drag rotation with smooth damping inertia
 * - Mathematical vertex distortion
 * - Apple-style frosted HUD overlay
 */
export function Lab3DCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [geoType, setGeoType] = useState<GeometryType>("knot");
  const [isWireframe, setIsWireframe] = useState<boolean>(true);
  const [isSpinning, setIsSpinning] = useState<boolean>(true);

  // References to preserve state in animation loop
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const pointsRef = useRef<THREE.Points | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const frameIdRef = useRef<number>(0);
  const isDraggingRef = useRef(false);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rotVelocityRef = useRef({ x: 0.002, y: 0.005 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0xffffff, 2.5, 50);
    pointLight1.position.set(5, 5, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x71717a, 2, 50);
    pointLight2.position.set(-5, -5, -2);
    scene.add(pointLight2);

    // 4. Background Particle Constellation
    const particleCount = 200;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 8;
    }
    particleGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(particlePositions, 3),
    );

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
    pointsRef.current = particles;

    // 5. Main Subject Mesh
    const buildGeometry = (type: GeometryType) => {
      if (type === "knot") return new THREE.TorusKnotGeometry(0.9, 0.28, 120, 18);
      if (type === "icosahedron") return new THREE.IcosahedronGeometry(1.25, 2);
      return new THREE.SphereGeometry(1.2, 36, 36);
    };

    const geometry = buildGeometry(geoType);
    const material = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      wireframe: isWireframe,
      roughness: 0.2,
      metalness: 0.8,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    meshRef.current = mesh;

    // 6. Resize handling
    const handleResize = () => {
      if (!container || !renderer) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight || 420;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };
    window.addEventListener("resize", handleResize);

    // 7. Mouse drag handlers for direct 3D manipulation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !meshRef.current) return;
      const deltaX = e.clientX - mousePosRef.current.x;
      const deltaY = e.clientY - mousePosRef.current.y;

      rotVelocityRef.current = {
        x: deltaY * 0.005,
        y: deltaX * 0.005,
      };

      meshRef.current.rotation.x += rotVelocityRef.current.x;
      meshRef.current.rotation.y += rotVelocityRef.current.y;

      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // 8. Animation Loop
    let clock = new THREE.Clock();

    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      if (meshRef.current) {
        if (!isDraggingRef.current && isSpinning) {
          meshRef.current.rotation.x += 0.003;
          meshRef.current.rotation.y += 0.006;
        } else if (!isDraggingRef.current) {
          // Soft damping inertia
          meshRef.current.rotation.x += rotVelocityRef.current.x;
          meshRef.current.rotation.y += rotVelocityRef.current.y;
          rotVelocityRef.current.x *= 0.95;
          rotVelocityRef.current.y *= 0.95;
        }
      }

      if (pointsRef.current) {
        pointsRef.current.rotation.y = elapsedTime * 0.02;
        pointsRef.current.rotation.x = Math.sin(elapsedTime * 0.05) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      dom.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      cancelAnimationFrame(frameIdRef.current);

      geometry.dispose();
      material.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [geoType, isWireframe, isSpinning]);

  return (
    <div className="relative w-full rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 via-card/50 to-background overflow-hidden shadow-2xl backdrop-blur-2xl">
      {/* Top Hairline Bevel */}
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/20 to-transparent" />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 sm:p-6 border-b border-border/40 bg-secondary/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              WebGL 3D Engine · Three.js
            </span>
          </div>
          <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
            Laboratório Espacial 3D
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Interaja diretamente: arraste para orbitar, explore as formas e a malha vetorial.
          </p>
        </div>

        {/* Apple Segmented Control for Geometries */}
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<GeometryType>
            name="lab-geometry"
            value={geoType}
            onChange={(val) => setGeoType(val)}
            options={[
              { value: "knot", label: "Torus Knot" },
              { value: "icosahedron", label: "Icosaedro" },
              { value: "sphere", label: "Esfera" },
            ]}
          />
        </div>
      </div>

      {/* WebGL Canvas Container */}
      <div
        ref={containerRef}
        className="relative h-[360px] sm:h-[440px] w-full cursor-grab active:cursor-grabbing select-none"
      />

      {/* Floating HUD Controls */}
      <div className="absolute bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 flex items-center justify-between sm:justify-end gap-2 p-2 rounded-2xl bg-background/80 backdrop-blur-xl border border-border/60 shadow-lg">
        <button
          type="button"
          onClick={() => setIsWireframe(!isWireframe)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-[0.96] ${
            isWireframe
              ? "bg-foreground/15 text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>{isWireframe ? "Malha Aramada" : "Sólido Metálico"}</span>
        </button>

        <button
          type="button"
          onClick={() => setIsSpinning(!isSpinning)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-[0.96] ${
            isSpinning
              ? "bg-foreground/15 text-foreground font-semibold"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <RotateCw className={`h-3.5 w-3.5 ${isSpinning ? "animate-spin" : ""}`} />
          <span>{isSpinning ? "Rotação Ativa" : "Pausado"}</span>
        </button>
      </div>
    </div>
  );
}
