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
    camera.position.z = 3.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Dumbbell Group
    const dumbbell = new THREE.Group();

    // Materials
    const limeNeonMaterial = new THREE.MeshBasicMaterial({
      color: 0xDFFF11, // Electric Lime
      wireframe: true,
      transparent: true,
      opacity: 0.85,
    });

    const crimsonNeonMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF003C, // Apex Crimson
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });

    // 1. Handle (Middle Bar)
    const handleGeom = new THREE.CylinderGeometry(0.08, 0.08, 2.2, 16);
    const handleMesh = new THREE.Mesh(handleGeom, limeNeonMaterial);
    handleMesh.rotation.z = Math.PI / 2; // Lie horizontally along X-axis
    dumbbell.add(handleMesh);

    // 2. Weights (Left and Right plates)
    const innerPlateGeom = new THREE.CylinderGeometry(0.5, 0.5, 0.25, 24);
    const outerPlateGeom = new THREE.CylinderGeometry(0.65, 0.65, 0.25, 24);

    // Left Plates
    const leftPlate1 = new THREE.Mesh(innerPlateGeom, crimsonNeonMaterial);
    leftPlate1.rotation.z = Math.PI / 2;
    leftPlate1.position.x = -0.65;
    dumbbell.add(leftPlate1);

    const leftPlate2 = new THREE.Mesh(outerPlateGeom, limeNeonMaterial);
    leftPlate2.rotation.z = Math.PI / 2;
    leftPlate2.position.x = -0.95;
    dumbbell.add(leftPlate2);

    // Right Plates
    const rightPlate1 = new THREE.Mesh(innerPlateGeom, crimsonNeonMaterial);
    rightPlate1.rotation.z = Math.PI / 2;
    rightPlate1.position.x = 0.65;
    dumbbell.add(rightPlate1);

    const rightPlate2 = new THREE.Mesh(outerPlateGeom, limeNeonMaterial);
    rightPlate2.rotation.z = Math.PI / 2;
    rightPlate2.position.x = 0.95;
    dumbbell.add(rightPlate2);

    // 3. Collars (Stoppers)
    const collarGeom = new THREE.CylinderGeometry(0.12, 0.12, 0.1, 16);
    
    const leftCollar = new THREE.Mesh(collarGeom, limeNeonMaterial);
    leftCollar.rotation.z = Math.PI / 2;
    leftCollar.position.x = -0.45;
    dumbbell.add(leftCollar);

    const rightCollar = new THREE.Mesh(collarGeom, limeNeonMaterial);
    rightCollar.rotation.z = Math.PI / 2;
    rightCollar.position.x = 0.45;
    dumbbell.add(rightCollar);

    scene.add(dumbbell);

    // Particle field around the dumbbell (Lime)
    const particlesCount = 150;
    const positionArray = new Float32Array(particlesCount * 3);
    for (let i = 0; i < particlesCount * 3; i++) {
      positionArray[i] = (Math.random() - 0.5) * 6;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.02,
      color: 0xDFFF11,
      transparent: true,
      opacity: 0.8,
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
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
      targetX = mouseX * 0.8;
      targetY = mouseY * 0.8;

      // Dumbbell spin + hover effect + tilt with mouse
      dumbbell.rotation.y = elapsedTime * 0.4 + (targetX - dumbbell.rotation.y) * 0.1;
      dumbbell.rotation.x = Math.sin(elapsedTime * 0.5) * 0.2 + (targetY - dumbbell.rotation.x) * 0.1;
      dumbbell.rotation.z = Math.cos(elapsedTime * 0.3) * 0.1;

      // Hover floating effect
      dumbbell.position.y = Math.sin(elapsedTime * 1.5) * 0.1;

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
      handleGeom.dispose();
      innerPlateGeom.dispose();
      outerPlateGeom.dispose();
      collarGeom.dispose();
      limeNeonMaterial.dispose();
      crimsonNeonMaterial.dispose();
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
