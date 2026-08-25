import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Package, RotateCw, Plus, Trash2, ArrowUpRight, Scale, ShieldCheck } from 'lucide-react';

interface CargoItem {
  id: string;
  name: string;
  weightKg: number;
  color: number;
  type: 'crate' | 'pallet' | 'drum' | 'fragile';
  pos: [number, number, number];
}

interface CargoLoading3DProps {
  maxCapacityKg?: number;
  onWeightChange?: (totalWeight: number) => void;
  className?: string;
}

export const CargoLoading3D: React.FC<CargoLoading3DProps> = ({
  maxCapacityKg = 18000,
  onWeightChange,
  className = 'h-80 w-full'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [cargoList, setCargoList] = useState<CargoItem[]>([
    { id: 'c-1', name: 'Standard Pallet Alpha', weightKg: 1200, color: 0x06b6d4, type: 'pallet', pos: [-1.8, 0.4, -0.6] },
    { id: 'c-2', name: 'Industrial Crate Beta', weightKg: 2400, color: 0x10b981, type: 'crate', pos: [-0.6, 0.5, -0.6] },
    { id: 'c-3', name: 'Chemical Safe Drums', weightKg: 1800, color: 0xf59e0b, type: 'drum', pos: [0.6, 0.45, -0.6] },
    { id: 'c-4', name: 'Precision Avionics Crate', weightKg: 950, color: 0x8b5cf6, type: 'fragile', pos: [-1.8, 0.4, 0.6] }
  ]);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cargoMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());

  const totalWeight = cargoList.reduce((acc, c) => acc + c.weightKg, 0);
  const loadPercentage = Math.min(100, Math.round((totalWeight / maxCapacityKg) * 100));

  useEffect(() => {
    onWeightChange?.(totalWeight);
  }, [totalWeight, onWeightChange]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 500;
    const height = container.clientHeight || 320;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060b18);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(6, 4.5, 6);
    camera.lookAt(0, 0.5, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.5);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.0);
    rimLight.position.set(-5, 6, -5);
    scene.add(rimLight);

    // Container Bed / Outline (Wireframe container body)
    const containerGroup = new THREE.Group();
    scene.add(containerGroup);

    // Bed Floor
    const floorGeo = new THREE.BoxGeometry(5.2, 0.1, 2.4);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.3
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.position.y = -0.05;
    floorMesh.receiveShadow = true;
    containerGroup.add(floorMesh);

    // Grid Floor
    const grid = new THREE.GridHelper(5.2, 10, 0x06b6d4, 0x1e293b);
    grid.position.y = 0.01;
    containerGroup.add(grid);

    // Container Wall Wireframe
    const boxWireGeo = new THREE.BoxGeometry(5.2, 2.0, 2.4);
    const edges = new THREE.EdgesGeometry(boxWireGeo);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.35 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    wireframe.position.y = 0.95;
    containerGroup.add(wireframe);

    // Wall Glass Panels
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      transparent: true,
      opacity: 0.15,
      roughness: 0.1,
      transmission: 0.8
    });
    const glassMesh = new THREE.Mesh(boxWireGeo, glassMat);
    glassMesh.position.y = 0.95;
    containerGroup.add(glassMesh);

    // Animate & Render Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();

      // Slow idle rotation
      containerGroup.rotation.y = Math.sin(time * 0.4) * 0.15;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Cargo Meshes in Scene
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old meshes
    cargoMeshesRef.current.forEach(mesh => scene.remove(mesh));
    cargoMeshesRef.current.clear();

    // Create new meshes for each item
    cargoList.forEach(item => {
      let geo: THREE.BufferGeometry;
      if (item.type === 'crate') {
        geo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
      } else if (item.type === 'drum') {
        geo = new THREE.CylinderGeometry(0.4, 0.4, 0.8, 16);
      } else if (item.type === 'fragile') {
        geo = new THREE.BoxGeometry(0.7, 0.7, 0.7);
      } else {
        // Pallet
        geo = new THREE.BoxGeometry(1.0, 0.6, 0.9);
      }

      const mat = new THREE.MeshStandardMaterial({
        color: item.color,
        roughness: 0.3,
        metalness: 0.4
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(item.pos[0], item.pos[1], item.pos[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      scene.add(mesh);
      cargoMeshesRef.current.set(item.id, mesh);
    });
  }, [cargoList]);

  const addRandomCargo = () => {
    const types: ('crate' | 'pallet' | 'drum' | 'fragile')[] = ['crate', 'pallet', 'drum', 'fragile'];
    const selectedType = types[Math.floor(Math.random() * types.length)];
    const colors = [0x10b981, 0x06b6d4, 0xf59e0b, 0x8b5cf6, 0xec4899];
    const color = colors[Math.floor(Math.random() * colors.length)];

    const xPos = -2.0 + Math.random() * 4.0;
    const zPos = -0.7 + Math.random() * 1.4;

    const newItem: CargoItem = {
      id: `cargo-${Date.now()}`,
      name: `Cargo Pack #${Math.floor(100 + Math.random() * 900)}`,
      weightKg: Math.floor(400 + Math.random() * 2200),
      color,
      type: selectedType,
      pos: [xPos, 0.45, zPos]
    };

    setCargoList(prev => [...prev, newItem]);
  };

  const removeCargo = (id: string) => {
    setCargoList(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4">
      {/* 3D Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950">
        <div ref={mountRef} className={className} />

        {/* Live HUD Overlay */}
        <div className="absolute top-3 left-3 flex items-center space-x-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 text-xs font-mono text-slate-200">
          <Scale className="w-4 h-4 text-cyan-400" />
          <span>Cargo Bay 3D Twin</span>
          <span className="text-emerald-400 font-bold">{cargoList.length} Units</span>
        </div>

        {/* Weight Balance Meter */}
        <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur-md p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-slate-400">
              <span>Total Mass:</span>
              <strong className="text-white text-sm">{totalWeight.toLocaleString()} kg</strong>
              <span>/ {maxCapacityKg.toLocaleString()} kg</span>
            </div>
            <div className="w-48 bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-500 ${
                  loadPercentage > 95 ? 'bg-rose-500' : loadPercentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${loadPercentage}%` }}
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={addRandomCargo}
              disabled={loadPercentage >= 100}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold transition flex items-center space-x-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Load Unit</span>
            </button>
            <button
              onClick={() => setCargoList([])}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 hover:text-rose-400 text-slate-400 transition"
              title="Clear All Cargo"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Manifest list */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {cargoList.map(item => (
          <div
            key={item.id}
            className="p-2.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs"
          >
            <div className="flex items-center space-x-2 overflow-hidden">
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: `#${item.color.toString(16).padStart(6, '0')}` }}
              />
              <div className="truncate">
                <p className="font-semibold text-slate-200 truncate">{item.name}</p>
                <p className="text-[10px] font-mono text-slate-400">{item.weightKg} kg • {item.type}</p>
              </div>
            </div>
            <button
              onClick={() => removeCargo(item.id)}
              className="text-slate-500 hover:text-rose-400 p-1 transition"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
