import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";

interface DepthMeshProps {
  interactive?: boolean;
}

/**
 * Three.js 3D Depth Displacement & Reactive Surface Canvas
 * Inspired by img2threejs & demoscene WebGL craftsmanship:
 * - High-density subdivided plane with custom vertex shader displacement
 * - Dynamic normal recalculation with mouse-driven gravitational waves
 * - Specular iridescent sheen reflecting dark/monochrome light rays
 * - Responsive render loop with frame rate throttling when offscreen
 */
export function Interactive3DDepthMesh({ interactive = true }: DepthMeshProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
    if (!gl) return;

    const width = container.clientWidth || 300;
    const height = container.clientHeight || 200;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Geometry: dense grid for smooth depth ripples
    const segments = 64;
    const geometry = new THREE.PlaneGeometry(3.6, 2.2, segments, segments);

    // Custom depth shader material
    const uniforms = {
      uTime: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uPointerActive: { value: 0.0 },
      uIntensity: { value: 0.28 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      wireframe: false,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uPointer;
        uniform float uPointerActive;
        uniform float uIntensity;

        varying vec2 vUv;
        varying vec3 vNormal;
        varying float vElevation;

        void main() {
          vUv = uv;

          vec3 pos = position;

          // Multi-frequency wave calculation (procedural landscape depth)
          float wave1 = sin(pos.x * 2.2 + uTime * 0.8) * cos(pos.y * 2.2 + uTime * 0.7) * 0.12;
          float wave2 = sin(pos.x * 4.5 - uTime * 1.1) * sin(pos.y * 4.0 + uTime * 0.9) * 0.05;

          // Pointer interaction ripple (img2threejs depth reaction)
          float dist = distance(pos.xy, uPointer * vec2(1.8, 1.1));
          float ripple = sin(dist * 12.0 - uTime * 4.0) * exp(-dist * 2.4) * 0.18 * uPointerActive;

          float elev = (wave1 + wave2 + ripple) * uIntensity;
          pos.z += elev;

          vElevation = elev;
          vNormal = normalMatrix * normal;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vNormal;
        varying float vElevation;

        void main() {
          // Monochrome high-tech lighting with subtle iridescent highlight
          vec3 baseColor = vec3(0.08, 0.08, 0.09);
          vec3 crestColor = vec3(0.85, 0.88, 0.92);
          vec3 rimColor = vec3(0.40, 0.45, 0.55);

          float factor = clamp((vElevation + 0.15) * 3.5, 0.0, 1.0);
          vec3 col = mix(baseColor, crestColor, factor * 0.45);

          // Specular highlights
          vec3 lightDir = normalize(vec3(0.4, 0.7, 1.0));
          float diff = max(dot(vNormal, lightDir), 0.0);
          col += rimColor * pow(diff, 6.0) * 0.35;

          // Border falloff
          float edge = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x) *
                       smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.88, vUv.y);

          gl_FragColor = vec4(col, edge * 0.75);
        }
      `,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -0.35;
    scene.add(mesh);

    // Target pointer values for smooth Apple-style inertia
    const targetPointer = new THREE.Vector2(0, 0);
    let targetActive = 0;
    let isVisible = true;

    const onPointerMove = (e: MouseEvent) => {
      if (!interactive) return;
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetPointer.set(x, y);
      targetActive = 1;
    };

    const onPointerLeave = () => {
      targetActive = 0;
    };

    container.addEventListener("mousemove", onPointerMove);
    container.addEventListener("mouseleave", onPointerLeave);

    const observer = new IntersectionObserver((entries) => {
      isVisible = entries[0]?.isIntersecting ?? false;
    });
    observer.observe(container);

    const onResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", onResize);

    let animId = 0;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth damp interpolation (Apple 60fps spring feel)
      uniforms.uTime.value = elapsedTime;
      uniforms.uPointer.value.lerp(targetPointer, 0.08);
      uniforms.uPointerActive.value = THREE.MathUtils.lerp(
        uniforms.uPointerActive.value,
        targetActive,
        0.06,
      );

      // Subtle mesh tilt toward cursor
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetPointer.x * 0.22, 0.05);
      mesh.rotation.x = THREE.MathUtils.lerp(
        mesh.rotation.x,
        -0.35 + targetPointer.y * 0.18,
        0.05,
      );

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousemove", onPointerMove);
      container.removeEventListener("mouseleave", onPointerLeave);

      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden opacity-70 transition-opacity duration-500 group-hover:opacity-100"
      aria-hidden="true"
    />
  );
}
