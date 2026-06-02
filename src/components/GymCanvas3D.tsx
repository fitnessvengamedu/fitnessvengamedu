"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function GymCanvas3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Dimensions
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 4;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Geometry - Futuristic Torus Knot (Wireframe)
    const geometry = new THREE.TorusKnotGeometry(1.2, 0.35, 120, 16);
    
    // Custom Glow Shader/Basic Line material
    const material = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.8,
    });

    // Mesh
    const torusKnot = new THREE.Mesh(geometry, material);
    scene.add(torusKnot);

    // Inner core sphere (neon pink wireframe)
    const coreGeometry = new THREE.IcosahedronGeometry(0.7, 2);
    const coreMaterial = new THREE.MeshBasicMaterial({
      color: 0xff007f,
      wireframe: true,
      transparent: true,
      opacity: 0.6,
    });
    const core = new THREE.Mesh(coreGeometry, coreMaterial);
    scene.add(core);

    // Particle field
    const particlesCount = 200;
    const positionArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positionArray[i] = (Math.random() - 0.5) * 8;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0x9d00ff,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Lights (not strictly needed for BasicMaterial, but good for depth if we expand)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      // Normalize mouse coordinates (-1 to 1)
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      mouseX = ((event.clientX - rect.left) / width) - 0.5;
      mouseY = ((event.clientY - rect.top) / height) - 0.5;
    };

    window.addEventListener("mousemove", handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 500;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Animation Loop
    const clock = new THREE.Clock();

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse rotation tracking
      targetX = mouseX * 0.5;
      targetY = mouseY * 0.5;

      torusKnot.rotation.y = elapsedTime * 0.15 + (targetX - torusKnot.rotation.y) * 0.1;
      torusKnot.rotation.x = elapsedTime * 0.1 + (targetY - torusKnot.rotation.x) * 0.1;

      core.rotation.y = -elapsedTime * 0.3;
      core.rotation.x = -elapsedTime * 0.2;

      particles.rotation.y = elapsedTime * 0.05;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Clean up
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks/exhaustive-deps
        containerRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      coreGeometry.dispose();
      coreMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[350px] md:h-[500px] relative cursor-pointer"
      style={{ touchAction: "none" }}
    />
  );
}
