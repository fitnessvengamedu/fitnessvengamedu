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
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 3.5;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    containerRef.current.appendChild(renderer.domElement);

    // Lights
    // Ambient light provides soft overall illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    // Direct lighting for specular highlights on metal and rubber surfaces
    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.4);
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.4);
    dirLight2.position.set(-5, -3, -2);
    scene.add(dirLight2);

    // Front-facing light aligned with the camera to prevent dark angles during rotation
    const cameraLight = new THREE.DirectionalLight(0xffffff, 0.85);
    cameraLight.position.set(0, 0, 4);
    scene.add(cameraLight);

    // Colored accent point lights to cast neon reflections
    const limeLight = new THREE.PointLight(0xDFFF11, 3.5, 10);
    limeLight.position.set(0, 3, 2);
    scene.add(limeLight);

    const crimsonLight = new THREE.PointLight(0xFF003C, 3.5, 10);
    crimsonLight.position.set(0, -3, -2);
    scene.add(crimsonLight);

    // Procedural Knurling Texture for Handle
    const createKnurlingTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Base metal color
      ctx.fillStyle = "#666666";
      ctx.fillRect(0, 0, 128, 128);

      // Knurling hatch lines
      ctx.strokeStyle = "#444444";
      ctx.lineWidth = 1;
      const step = 8;
      for (let i = -128; i < 128 * 2; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 128, 128);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i + 128, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 3);
      return texture;
    };

    const createKnurlingBumpMap = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      // Midpoint grey for no displacement
      ctx.fillStyle = "#808080";
      ctx.fillRect(0, 0, 128, 128);

      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      const step = 8;
      for (let i = -128; i < 128 * 2; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 128, 128);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i + 128, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
      }

      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 1;
      for (let i = -128 + 2; i < 128 * 2 + 2; i += step) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + 128, 128);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i + 128, 0);
        ctx.lineTo(i, 128);
        ctx.stroke();
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.wrapS = THREE.RepeatWrapping;
      texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(10, 3);
      return texture;
    };

    const knurlingMap = createKnurlingTexture();
    const bumpMap = createKnurlingBumpMap();

    // Dumbbell Group
    const dumbbell = new THREE.Group();

    // Phong Materials for Specular Lighting
    const steelMaterial = new THREE.MeshPhongMaterial({
      color: 0x888888,
      specular: 0x999999,
      shininess: 70,
      map: knurlingMap,
      bumpMap: bumpMap,
      bumpScale: 0.025,
    });

    const chromeMaterial = new THREE.MeshPhongMaterial({
      color: 0xcccccc,
      specular: 0xffffff,
      shininess: 120,
    });

    const darkRubberMaterial = new THREE.MeshPhongMaterial({
      color: 0x222222,
      specular: 0x555555,
      shininess: 25,
    });

    const limeGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xDFFF11,
      transparent: true,
      opacity: 0.95,
    });

    const crimsonGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFF003C,
      transparent: true,
      opacity: 0.95,
    });

    // 1. Handle (Middle Bar)
    const handleGeom = new THREE.CylinderGeometry(0.085, 0.085, 2.0, 32);
    const handleMesh = new THREE.Mesh(handleGeom, steelMaterial);
    handleMesh.rotation.z = Math.PI / 2;
    dumbbell.add(handleMesh);

    // 2. Collars (Stoppers at handle ends)
    const collarGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.08, 32);

    const leftCollar = new THREE.Mesh(collarGeom, chromeMaterial);
    leftCollar.rotation.z = Math.PI / 2;
    leftCollar.position.x = -0.45;
    dumbbell.add(leftCollar);

    const rightCollar = new THREE.Mesh(collarGeom, chromeMaterial);
    rightCollar.rotation.z = Math.PI / 2;
    rightCollar.position.x = 0.45;
    dumbbell.add(rightCollar);

    // 3. Weight Plates
    const innerPlateGeom = new THREE.CylinderGeometry(0.48, 0.48, 0.22, 32);
    const outerPlateGeom = new THREE.CylinderGeometry(0.62, 0.62, 0.24, 32);

    // Left Plates (Solid rubber)
    const leftPlate1 = new THREE.Mesh(innerPlateGeom, darkRubberMaterial);
    leftPlate1.rotation.z = Math.PI / 2;
    leftPlate1.position.x = -0.68;
    dumbbell.add(leftPlate1);

    const leftPlate2 = new THREE.Mesh(outerPlateGeom, darkRubberMaterial);
    leftPlate2.rotation.z = Math.PI / 2;
    leftPlate2.position.x = -0.96;
    dumbbell.add(leftPlate2);

    // Left Neon Trim Rings
    const leftTrim1Geom = new THREE.TorusGeometry(0.49, 0.02, 16, 64);
    const leftTrim1 = new THREE.Mesh(leftTrim1Geom, crimsonGlowMaterial);
    leftTrim1.rotation.y = Math.PI / 2;
    leftTrim1.position.x = -0.56;
    dumbbell.add(leftTrim1);

    const leftTrim2Geom = new THREE.TorusGeometry(0.63, 0.02, 16, 64);
    const leftTrim2 = new THREE.Mesh(leftTrim2Geom, limeGlowMaterial);
    leftTrim2.rotation.y = Math.PI / 2;
    leftTrim2.position.x = -0.83;
    dumbbell.add(leftTrim2);

    // Right Plates (Solid rubber)
    const rightPlate1 = new THREE.Mesh(innerPlateGeom, darkRubberMaterial);
    rightPlate1.rotation.z = Math.PI / 2;
    rightPlate1.position.x = 0.68;
    dumbbell.add(rightPlate1);

    const rightPlate2 = new THREE.Mesh(outerPlateGeom, darkRubberMaterial);
    rightPlate2.rotation.z = Math.PI / 2;
    rightPlate2.position.x = 0.96;
    dumbbell.add(rightPlate2);

    // Right Neon Trim Rings
    const rightTrim1 = new THREE.Mesh(leftTrim1Geom, crimsonGlowMaterial);
    rightTrim1.rotation.y = Math.PI / 2;
    rightTrim1.position.x = 0.56;
    dumbbell.add(rightTrim1);

    const rightTrim2 = new THREE.Mesh(leftTrim2Geom, limeGlowMaterial);
    rightTrim2.rotation.y = Math.PI / 2;
    rightTrim2.position.x = 0.83;
    dumbbell.add(rightTrim2);

    scene.add(dumbbell);

    // Particle field around the dumbbell (Lime + Orange/Red Sparks)
    const particlesCount = 150;
    const positionArray = new Float32Array(particlesCount * 3);
    const colorArray = new Float32Array(particlesCount * 3);
    
    const limeColor = new THREE.Color(0xDFFF11);
    const orangeColor = new THREE.Color(0xFF8800);
    const redColor = new THREE.Color(0xFF2200);

    for (let i = 0; i < particlesCount; i++) {
      positionArray[i * 3] = (Math.random() - 0.5) * 6;
      positionArray[i * 3 + 1] = (Math.random() - 0.5) * 6;
      positionArray[i * 3 + 2] = (Math.random() - 0.5) * 6;

      let particleColor;
      const rand = Math.random();
      if (rand < 0.5) {
        particleColor = limeColor;
      } else if (rand < 0.85) {
        particleColor = orangeColor;
      } else {
        particleColor = redColor;
      }

      colorArray[i * 3] = particleColor.r;
      colorArray[i * 3 + 1] = particleColor.g;
      colorArray[i * 3 + 2] = particleColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute("position", new THREE.BufferAttribute(positionArray, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(colorArray, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.025,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
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
      dumbbell.rotation.y = elapsedTime * 0.35 + (targetX - dumbbell.rotation.y) * 0.1;
      dumbbell.rotation.x = Math.sin(elapsedTime * 0.4) * 0.15 + (targetY - dumbbell.rotation.x) * 0.1;
      dumbbell.rotation.z = Math.cos(elapsedTime * 0.2) * 0.08;

      // Hover floating effect
      dumbbell.position.y = Math.sin(elapsedTime * 1.2) * 0.08;

      particles.rotation.y = elapsedTime * 0.03;

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
      collarGeom.dispose();
      innerPlateGeom.dispose();
      outerPlateGeom.dispose();
      leftTrim1Geom.dispose();
      leftTrim2Geom.dispose();
      steelMaterial.dispose();
      chromeMaterial.dispose();
      darkRubberMaterial.dispose();
      limeGlowMaterial.dispose();
      crimsonGlowMaterial.dispose();
      if (knurlingMap) knurlingMap.dispose();
      if (bumpMap) bumpMap.dispose();
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
