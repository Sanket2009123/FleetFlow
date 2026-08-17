import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface BackgroundProps {
  intensity?: number;
  interactive?: boolean;
}

export const InteractiveBackground3D: React.FC<BackgroundProps> = ({ 
  intensity = 1,
  interactive = true 
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 80;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    container.appendChild(renderer.domElement);

    // Group for mouse parallax rotation
    const worldGroup = new THREE.Group();
    scene.add(worldGroup);

    // 1. Constellation Nodes (Logistics Hubs)
    const nodeCount = 70;
    const nodePositions: THREE.Vector3[] = [];
    const nodeGeo = new THREE.BufferGeometry();
    const posArray = new Float32Array(nodeCount * 3);
    const colorArray = new Float32Array(nodeCount * 3);

    const baseColors = [
      new THREE.Color('#10b981'), // Emerald
      new THREE.Color('#06b6d4'), // Cyan
      new THREE.Color('#6366f1'), // Indigo
      new THREE.Color('#38bdf8')  // Sky
    ];

    for (let i = 0; i < nodeCount; i++) {
      const x = (Math.random() - 0.5) * 160;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 60;
      nodePositions.push(new THREE.Vector3(x, y, z));

      posArray[i * 3] = x;
      posArray[i * 3 + 1] = y;
      posArray[i * 3 + 2] = z;

      const col = baseColors[Math.floor(Math.random() * baseColors.length)];
      colorArray[i * 3] = col.r;
      colorArray[i * 3 + 1] = col.g;
      colorArray[i * 3 + 2] = col.b;
    }

    nodeGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    nodeGeo.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

    // Particle sprite using canvas
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(56, 189, 248, 0.8)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const particleTexture = new THREE.CanvasTexture(canvas);

    const nodeMat = new THREE.PointsMaterial({
      size: 2.2 * intensity,
      vertexColors: true,
      map: particleTexture,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const nodes = new THREE.Points(nodeGeo, nodeMat);
    worldGroup.add(nodes);

    // 2. Dynamic Connection Lines (Supply Chain Corridors)
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x0ea5e9,
      transparent: true,
      opacity: 0.15 * intensity,
      blending: THREE.AdditiveBlending
    });

    const lineIndices: number[] = [];
    const maxDist = 38;

    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dist = nodePositions[i].distanceTo(nodePositions[j]);
        if (dist < maxDist) {
          lineIndices.push(i, j);
        }
      }
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    lineGeo.setIndex(lineIndices);

    const networkLines = new THREE.LineSegments(lineGeo, lineMat);
    worldGroup.add(networkLines);

    // 3. Moving Data Packets / Route Pulses
    const packetCount = 24;
    const packetGroup = new THREE.Group();
    worldGroup.add(packetGroup);

    interface Packet {
      mesh: THREE.Mesh;
      startIdx: number;
      endIdx: number;
      progress: number;
      speed: number;
    }

    const packets: Packet[] = [];
    const packetGeo = new THREE.SphereGeometry(0.5, 8, 8);
    const packetMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.85
    });

    if (lineIndices.length > 0) {
      for (let i = 0; i < packetCount; i++) {
        const pairIndex = Math.floor(Math.random() * (lineIndices.length / 2)) * 2;
        const mesh = new THREE.Mesh(packetGeo, packetMat.clone());
        packetGroup.add(mesh);

        packets.push({
          mesh,
          startIdx: lineIndices[pairIndex],
          endIdx: lineIndices[pairIndex + 1],
          progress: Math.random(),
          speed: 0.003 + Math.random() * 0.005
        });
      }
    }

    // 4. Floating Ambient Starfield / Dust
    const starCount = 300;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 220;
      starPos[i + 1] = (Math.random() - 0.5) * 160;
      starPos[i + 2] = (Math.random() - 0.5) * 120;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.8,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const starfield = new THREE.Points(starGeo, starMat);
    worldGroup.add(starfield);

    // Mouse Tracking for Parallax
    let targetRotX = 0;
    let targetRotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      targetRotY = x * 0.25;
      targetRotX = y * 0.2;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Handle Window Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Slow orbital drift
      worldGroup.rotation.y += 0.0008;
      worldGroup.rotation.x = THREE.MathUtils.lerp(worldGroup.rotation.x, targetRotX, 0.05);
      worldGroup.rotation.z = THREE.MathUtils.lerp(worldGroup.rotation.z, -targetRotY * 0.5, 0.05);

      // Animate supply chain packets along connections
      packets.forEach((p) => {
        p.progress += p.speed;
        if (p.progress >= 1) {
          p.progress = 0;
          if (lineIndices.length > 0) {
            const pairIndex = Math.floor(Math.random() * (lineIndices.length / 2)) * 2;
            p.startIdx = lineIndices[pairIndex];
            p.endIdx = lineIndices[pairIndex + 1];
          }
        }

        const p1 = nodePositions[p.startIdx];
        const p2 = nodePositions[p.endIdx];
        if (p1 && p2) {
          p.mesh.position.lerpVectors(p1, p2, p.progress);
          // Pulse scale
          const s = 0.6 + 0.4 * Math.sin(time * 6 + p.progress * Math.PI);
          p.mesh.scale.set(s, s, s);
        }
      });

      // Shimmer starfield
      starfield.rotation.y = time * 0.005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [intensity, interactive]);

  return (
    <div 
      ref={mountRef} 
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-80 transition-opacity duration-1000"
      style={{
        background: 'radial-gradient(circle at 50% 20%, rgba(15, 23, 42, 0.4) 0%, rgba(2, 6, 23, 0.85) 100%)'
      }}
    />
  );
};
