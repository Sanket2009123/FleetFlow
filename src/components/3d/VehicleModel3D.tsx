import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Vehicle } from '../../types';
import { 
  RotateCw, 
  Maximize2, 
  Eye, 
  Layers, 
  Zap, 
  Lightbulb, 
  Gauge, 
  Package, 
  Sparkles,
  Activity
} from 'lucide-react';

interface VehicleModel3DProps {
  vehicle?: Vehicle | null;
  className?: string;
  autoRotate?: boolean;
  showControls?: boolean;
}

export const VehicleModel3D: React.FC<VehicleModel3DProps> = ({
  vehicle,
  className = 'h-96 w-full',
  autoRotate: initialAutoRotate = true,
  showControls = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(initialAutoRotate);
  const [viewMode, setViewMode] = useState<'standard' | 'wireframe' | 'xray' | 'heatmap'>('standard');
  const [lightsOn, setLightsOn] = useState(true);
  const [engineRunning, setEngineRunning] = useState(vehicle?.status === 'On Trip');
  const [cargoLoadPercent, setCargoLoadPercent] = useState<number>(75);
  const [cameraPreset, setCameraPreset] = useState<'iso' | 'front' | 'side' | 'top'>('iso');
  const [speedMph, setSpeedMph] = useState<number>(vehicle?.status === 'On Trip' ? 58 : 0);

  // References to three objects for runtime updates
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const lightsRef = useRef<THREE.PointLight[]>([]);
  const cargoGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Drag interaction state
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0f1d);
    scene.fog = new THREE.FogExp2(0x0a0f1d, 0.035);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(9, 6, 9);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.8);
    dirLight.position.set(10, 15, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const rimLight = new THREE.DirectionalLight(0x10b981, 1.2);
    rimLight.position.set(-10, 8, -10);
    scene.add(rimLight);

    const bottomFillLight = new THREE.DirectionalLight(0x6366f1, 0.5);
    bottomFillLight.position.set(0, -10, 0);
    scene.add(bottomFillLight);

    // 5. Tech Studio Grid Floor
    const gridHelper = new THREE.GridHelper(24, 24, 0x10b981, 0x1e293b);
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    // Ground Plane with subtle reflection
    const floorGeo = new THREE.PlaneGeometry(30, 30);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b16,
      roughness: 0.8,
      metalness: 0.2
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 6. Build Procedural 3D Vehicle Digital Twin
    const vehicleGroup = new THREE.Group();
    vehicleGroupRef.current = vehicleGroup;
    scene.add(vehicleGroup);

    buildVehicleModel(vehicleGroup, vehicle?.type || 'Truck');

    // 7. Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      if (autoRotate && !isDraggingRef.current) {
        vehicleGroup.rotation.y += delta * 0.4;
      }

      // Rotate wheels if speed or engine is active
      const wheelSpeed = engineRunning ? (speedMph > 0 ? speedMph * 0.1 : 1.5) : 0;
      wheelsRef.current.forEach((wheel) => {
        wheel.rotation.x += delta * wheelSpeed;
      });

      // Subtle engine suspension vibration
      if (engineRunning) {
        vehicleGroup.position.y = Math.sin(time * 24) * 0.015;
      } else {
        vehicleGroup.position.y = 0;
      }

      renderer.render(scene, camera);
    };
    animate();

    // Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Mouse Drag Controls for 360 Rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !vehicleGroupRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      vehicleGroupRef.current.rotation.y += deltaX * 0.008;
      if (cameraRef.current) {
        cameraRef.current.position.y = Math.max(1, Math.min(12, cameraRef.current.position.y - deltaY * 0.02));
        cameraRef.current.lookAt(0, 1, 0);
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomSpeed = 0.005;
      const newFov = Math.max(25, Math.min(65, cameraRef.current.fov + e.deltaY * zoomSpeed * 5));
      cameraRef.current.fov = newFov;
      cameraRef.current.updateProjectionMatrix();
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      renderer.dispose();
    };
  }, [vehicle?.type, vehicle?.id]);

  // Dynamic Procedural 3D Vehicle Builder
  const buildVehicleModel = (group: THREE.Group, type: string) => {
    wheelsRef.current = [];
    lightsRef.current = [];

    // Clear previous children
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }

    // Material Palette
    const cabColor = type === 'Bike' ? 0x10b981 : (type === 'Van' ? 0x0284c7 : 0x0f172a);
    const accentColor = 0x10b981;

    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: cabColor,
      metalness: 0.8,
      roughness: 0.25,
    });

    const chassisMaterial = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.9,
      roughness: 0.4
    });

    const chromeMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.1
    });

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.85,
      transparent: true,
      opacity: 0.85
    });

    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x090d16,
      roughness: 0.9,
      metalness: 0.1
    });

    const lightGlowMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const tailLightGlowMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    if (type === 'Bike') {
      // 3D Cargo Bike Geometry
      const frameGeo = new THREE.CylinderGeometry(0.06, 0.06, 3);
      const frameMesh = new THREE.Mesh(frameGeo, bodyMaterial);
      frameMesh.rotation.z = Math.PI / 3;
      frameMesh.position.set(0, 0.8, 0);
      group.add(frameMesh);

      // Cargo Box
      const boxGeo = new THREE.BoxGeometry(1.2, 0.9, 1.4);
      const boxMesh = new THREE.Mesh(boxGeo, chassisMaterial);
      boxMesh.position.set(1.0, 0.8, 0);
      boxMesh.castShadow = true;
      group.add(boxMesh);

      // Wheels
      const createBikeWheel = (x: number) => {
        const wheelGeo = new THREE.TorusGeometry(0.5, 0.08, 16, 32);
        const wheelMesh = new THREE.Mesh(wheelGeo, tireMaterial);
        wheelMesh.rotation.y = Math.PI / 2;
        wheelMesh.position.set(x, 0.5, 0);
        group.add(wheelMesh);
        wheelsRef.current.push(wheelMesh);
      };
      createBikeWheel(1.8);
      createBikeWheel(-1.2);
      return;
    }

    if (type === 'Van') {
      // 3D Delivery Van Model
      const vanBodyGeo = new THREE.BoxGeometry(4.4, 1.9, 1.8);
      const vanBody = new THREE.Mesh(vanBodyGeo, bodyMaterial);
      vanBody.position.set(0, 1.3, 0);
      vanBody.castShadow = true;
      group.add(vanBody);

      // Windshield & Side Windows
      const windshieldGeo = new THREE.BoxGeometry(1.2, 0.9, 1.76);
      const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
      windshield.position.set(1.6, 1.55, 0);
      group.add(windshield);

      // Headlights
      const hlGeo = new THREE.BoxGeometry(0.1, 0.2, 0.35);
      const hlLeft = new THREE.Mesh(hlGeo, lightGlowMat);
      hlLeft.position.set(2.21, 1.0, 0.65);
      const hlRight = new THREE.Mesh(hlGeo, lightGlowMat);
      hlRight.position.set(2.21, 1.0, -0.65);
      group.add(hlLeft, hlRight);

      // 4 Wheels
      const wheelPositions = [
        [1.3, 0.45, 0.95],
        [1.3, 0.45, -0.95],
        [-1.3, 0.45, 0.95],
        [-1.3, 0.45, -0.95]
      ];

      wheelPositions.forEach(([x, y, z]) => {
        const wGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.28, 24);
        const wheel = new THREE.Mesh(wGeo, tireMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, y, z);
        wheel.castShadow = true;

        // Rim
        const rimGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.29, 12);
        const rim = new THREE.Mesh(rimGeo, chromeMaterial);
        wheel.add(rim);

        group.add(wheel);
        wheelsRef.current.push(wheel);
      });
      return;
    }

    // Default: Commercial Heavy Semi-Truck & Trailer
    // 1. Truck Chassis Frame
    const chassisGeo = new THREE.BoxGeometry(7.2, 0.3, 1.7);
    const chassis = new THREE.Mesh(chassisGeo, chassisMaterial);
    chassis.position.set(0, 0.75, 0);
    chassis.castShadow = true;
    group.add(chassis);

    // 2. Cab (Driver Cockpit)
    const cabGeo = new THREE.BoxGeometry(2.3, 2.2, 1.8);
    const cab = new THREE.Mesh(cabGeo, bodyMaterial);
    cab.position.set(2.2, 1.8, 0);
    cab.castShadow = true;
    group.add(cab);

    // Aerodynamic Cab Roof Fairing
    const fairingGeo = new THREE.BoxGeometry(1.6, 0.6, 1.76);
    const fairing = new THREE.Mesh(fairingGeo, bodyMaterial);
    fairing.position.set(1.9, 3.1, 0);
    group.add(fairing);

    // Windshield
    const windshieldGeo = new THREE.BoxGeometry(0.1, 0.8, 1.6);
    const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshield.position.set(3.36, 2.1, 0);
    group.add(windshield);

    // Side Windows
    const sideWinGeo = new THREE.BoxGeometry(0.9, 0.6, 1.82);
    const sideWin = new THREE.Mesh(sideWinGeo, glassMaterial);
    sideWin.position.set(2.3, 2.1, 0);
    group.add(sideWin);

    // Chrome Grille
    const grilleGeo = new THREE.BoxGeometry(0.12, 0.9, 1.4);
    const grille = new THREE.Mesh(grilleGeo, chromeMaterial);
    grille.position.set(3.36, 1.25, 0);
    group.add(grille);

    // Chrome Twin Exhaust Stacks
    [-0.7, 0.7].forEach(z => {
      const exhaustGeo = new THREE.CylinderGeometry(0.08, 0.08, 2.8, 16);
      const exhaust = new THREE.Mesh(exhaustGeo, chromeMaterial);
      exhaust.position.set(1.0, 2.3, z);
      group.add(exhaust);
    });

    // 3. Cargo Trailer (Container)
    const trailerGeo = new THREE.BoxGeometry(4.6, 2.4, 1.85);
    const trailerMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.5,
      roughness: 0.4
    });
    const trailer = new THREE.Mesh(trailerGeo, trailerMat);
    trailer.position.set(-1.3, 2.0, 0);
    trailer.castShadow = true;
    trailer.receiveShadow = true;
    group.add(trailer);

    // Green Accent Stripe on Trailer
    const stripeGeo = new THREE.BoxGeometry(4.62, 0.25, 1.87);
    const stripeMat = new THREE.MeshStandardMaterial({ color: accentColor, roughness: 0.3 });
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(-1.3, 2.0, 0);
    group.add(stripe);

    // 4. Headlights & Point Lights
    const hlGeo = new THREE.BoxGeometry(0.08, 0.22, 0.35);
    const hlLeft = new THREE.Mesh(hlGeo, lightGlowMat);
    hlLeft.position.set(3.36, 1.0, 0.7);
    const hlRight = new THREE.Mesh(hlGeo, lightGlowMat);
    hlRight.position.set(3.36, 1.0, -0.7);
    group.add(hlLeft, hlRight);

    const pointLightL = new THREE.PointLight(0x38bdf8, 2.5, 8);
    pointLightL.position.set(3.6, 1.0, 0.7);
    const pointLightR = new THREE.PointLight(0x38bdf8, 2.5, 8);
    pointLightR.position.set(3.6, 1.0, -0.7);
    group.add(pointLightL, pointLightR);
    lightsRef.current.push(pointLightL, pointLightR);

    // Tail Lights
    const tlLeft = new THREE.Mesh(hlGeo, tailLightGlowMat);
    tlLeft.position.set(-3.62, 1.0, 0.7);
    const tlRight = new THREE.Mesh(hlGeo, tailLightGlowMat);
    tlRight.position.set(-3.62, 1.0, -0.7);
    group.add(tlLeft, tlRight);

    // 5. Six Heavy Duty Dual-Wheel Hubs
    const truckWheelCoords = [
      [2.5, 0.5, 0.95],
      [2.5, 0.5, -0.95],
      [-1.8, 0.5, 0.95],
      [-1.8, 0.5, -0.95],
      [-2.8, 0.5, 0.95],
      [-2.8, 0.5, -0.95]
    ];

    truckWheelCoords.forEach(([x, y, z]) => {
      const wGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.3, 24);
      const wheel = new THREE.Mesh(wGeo, tireMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(x, y, z);
      wheel.castShadow = true;

      // Chrome Hubcap
      const hubGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.32, 12);
      const hub = new THREE.Mesh(hubGeo, chromeMaterial);
      wheel.add(hub);

      group.add(wheel);
      wheelsRef.current.push(wheel);
    });

    // 6. Dynamic Cargo Crate Stack (Inside/On Trailer)
    const cargoGroup = new THREE.Group();
    cargoGroupRef.current = cargoGroup;
    group.add(cargoGroup);
    updateCargoCrates(cargoGroup, cargoLoadPercent);
  };

  // Helper to re-render dynamic cargo crates
  const updateCargoCrates = (group: THREE.Group, percent: number) => {
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    const crateCount = Math.round((percent / 100) * 8);
    const crateMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.7 });

    for (let i = 0; i < crateCount; i++) {
      const crateGeo = new THREE.BoxGeometry(0.6, 0.6, 0.6);
      const crate = new THREE.Mesh(crateGeo, crateMat);
      const x = -2.8 + (i % 4) * 0.9;
      const y = i >= 4 ? 2.3 : 1.3;
      const z = (i % 2 === 0 ? 0.3 : -0.3);
      crate.position.set(x, y, z);
      crate.castShadow = true;
      group.add(crate);
    }
  };

  // Switch View Rendering Modes
  useEffect(() => {
    if (!vehicleGroupRef.current) return;
    vehicleGroupRef.current.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        if (viewMode === 'wireframe') {
          child.material.wireframe = true;
        } else if (viewMode === 'xray') {
          child.material.wireframe = false;
          child.material.transparent = true;
          child.material.opacity = 0.45;
          child.material.color = new THREE.Color(0x06b6d4);
        } else if (viewMode === 'heatmap') {
          child.material.wireframe = false;
          child.material.transparent = false;
          child.material.opacity = 1.0;
          // Color code components based on thermal stress
          if (child.geometry.type.includes('BoxGeometry') && child.position.x > 1.5) {
            child.material.color = new THREE.Color(0xef4444); // Engine hot
          } else if (child.geometry.type.includes('CylinderGeometry')) {
            child.material.color = new THREE.Color(0xf59e0b); // Tires warm
          } else {
            child.material.color = new THREE.Color(0x10b981); // Chassis cool
          }
        } else {
          // Standard
          child.material.wireframe = false;
          child.material.transparent = false;
          child.material.opacity = 1.0;
        }
      }
    });
  }, [viewMode]);

  // Switch Lights
  useEffect(() => {
    lightsRef.current.forEach((light) => {
      light.intensity = lightsOn ? 2.5 : 0;
    });
  }, [lightsOn]);

  // Switch Camera Presets
  const setCameraAngle = (preset: 'iso' | 'front' | 'side' | 'top') => {
    setCameraPreset(preset);
    if (!cameraRef.current) return;
    if (preset === 'iso') {
      cameraRef.current.position.set(9, 6, 9);
    } else if (preset === 'front') {
      cameraRef.current.position.set(10, 2, 0);
    } else if (preset === 'side') {
      cameraRef.current.position.set(0, 3, 10);
    } else if (preset === 'top') {
      cameraRef.current.position.set(0.1, 12, 0.1);
    }
    cameraRef.current.lookAt(0, 1, 0);
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className={className} />

      {/* Top Left HUD Telemetry Overlay */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col space-y-1.5">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <div className={`w-2.5 h-2.5 rounded-full ${engineRunning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
          <span className="text-xs font-mono font-bold text-white">
            {vehicle?.licensePlate || 'TRK-8821-WA'}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider">
            3D Digital Twin
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Status: <strong className="text-white">{vehicle?.status || 'Active'}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Speed: <strong className="text-emerald-400">{speedMph} MPH</strong></span>
        </div>
      </div>

      {/* Top Right View Mode Badges */}
      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-700/60">
        {(['standard', 'wireframe', 'xray', 'heatmap'] as const).map((mode) => (
          <button
            key={mode}
            id={`btn-viewmode-${mode}`}
            onClick={() => setViewMode(mode)}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
              viewMode === mode
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>

      {/* Bottom Controls Bar */}
      {showControls && (
        <div className="absolute bottom-4 inset-x-4 flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-800 shadow-xl">
          {/* Camera Angles */}
          <div className="flex items-center space-x-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Angles:</span>
            {(['iso', 'front', 'side', 'top'] as const).map((cam) => (
              <button
                key={cam}
                id={`btn-cam-${cam}`}
                onClick={() => setCameraAngle(cam)}
                className={`px-2 py-1 rounded text-[10px] font-mono font-bold uppercase transition ${
                  cameraPreset === cam ? 'bg-slate-700 text-emerald-400 border border-emerald-500/40' : 'text-slate-400 hover:text-white'
                }`}
              >
                {cam}
              </button>
            ))}
          </div>

          {/* Interactive Toggles */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-toggle-engine"
              onClick={() => {
                const next = !engineRunning;
                setEngineRunning(next);
                setSpeedMph(next ? 55 : 0);
              }}
              className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                engineRunning
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{engineRunning ? 'Engine Active' : 'Ignition Off'}</span>
            </button>

            <button
              id="btn-toggle-lights"
              onClick={() => setLightsOn(!lightsOn)}
              className={`p-1.5 rounded-lg border transition ${
                lightsOn ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title="Toggle Headlights"
            >
              <Lightbulb className="w-4 h-4" />
            </button>

            <button
              id="btn-toggle-rotate"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-1.5 rounded-lg border transition ${
                autoRotate ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title="Toggle Auto Orbit"
            >
              <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
            </button>
          </div>
        </div>
      )}

      {/* Mouse Drag Hint */}
      <div className="absolute bottom-16 right-4 pointer-events-none text-[10px] text-slate-500 font-mono bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800">
        🖱️ Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
};
