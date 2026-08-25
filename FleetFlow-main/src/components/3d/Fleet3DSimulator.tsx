import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Vehicle } from '../../types';
import { 
  Play, 
  Pause, 
  RotateCw, 
  Zap, 
  Eye, 
  Sun, 
  Moon, 
  CloudRain, 
  CloudFog, 
  Gauge, 
  Compass, 
  Layers, 
  Sparkles, 
  Volume2, 
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Camera
} from 'lucide-react';

interface Fleet3DSimulatorProps {
  vehicles: Vehicle[];
  selectedVehicle?: Vehicle;
  onSelectVehicle?: (vehicle: Vehicle) => void;
}

export const Fleet3DSimulator: React.FC<Fleet3DSimulatorProps> = ({
  vehicles,
  selectedVehicle,
  onSelectVehicle
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const activeVehicle = selectedVehicle || vehicles[0];

  // Simulation Controls State
  const [isPlaying, setIsPlaying] = useState(true);
  const [speedKmH, setSpeedKmH] = useState(65);
  const [boostActive, setBoostActive] = useState(false);
  const [brakesActive, setBrakesActive] = useState(false);
  const [cameraMode, setCameraMode] = useState<'chase' | 'cockpit' | 'orbit' | 'top'>('chase');
  const [environment, setEnvironment] = useState<'cyber' | 'day' | 'night' | 'rain'>('cyber');
  const [explodedView, setExplodedView] = useState(false);
  const [steeringAngle, setSteeringAngle] = useState(0); // degrees

  // Three references
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const vehicleGroupRef = useRef<THREE.Group | null>(null);
  const wheelsRef = useRef<THREE.Mesh[]>([]);
  const roadGroupRef = useRef<THREE.Group | null>(null);
  const rainParticlesRef = useRef<THREE.Points | null>(null);
  const exhaustParticlesRef = useRef<THREE.Points | null>(null);
  const brakeLightsRef = useRef<THREE.Mesh[]>([]);

  // Exploded part groups
  const partsRef = useRef<{
    cab?: THREE.Group;
    engine?: THREE.Group;
    cargo?: THREE.Group;
    chassis?: THREE.Group;
    wheels?: THREE.Group;
  }>({});

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060914);
    scene.fog = new THREE.FogExp2(0x060914, 0.025);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 5, -12);
    camera.lookAt(0, 1.5, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
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

    const sunLight = new THREE.DirectionalLight(0x38bdf8, 2.0);
    sunLight.position.set(20, 40, 20);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    scene.add(sunLight);

    const neonUnderglow = new THREE.PointLight(0x10b981, 3.0, 15);
    neonUnderglow.position.set(0, 0.3, 0);
    scene.add(neonUnderglow);

    // 5. Procedural Moving Highway Road
    const roadGroup = new THREE.Group();
    roadGroupRef.current = roadGroup;
    scene.add(roadGroup);

    // Asphalt Ribbon
    const roadGeo = new THREE.PlaneGeometry(14, 200, 10, 50);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.8,
      metalness: 0.2
    });
    const roadMesh = new THREE.Mesh(roadGeo, roadMat);
    roadMesh.rotation.x = -Math.PI / 2;
    roadMesh.receiveShadow = true;
    roadGroup.add(roadMesh);

    // Highway Stripes (Moving Dash Lines)
    const stripeCount = 25;
    const stripeGeo = new THREE.PlaneGeometry(0.3, 3);
    const stripeMat = new THREE.MeshBasicMaterial({ color: 0x06b6d4 });
    const stripes: THREE.Mesh[] = [];

    for (let i = 0; i < stripeCount; i++) {
      const stripe = new THREE.Mesh(stripeGeo, stripeMat);
      stripe.rotation.x = -Math.PI / 2;
      stripe.position.set(0, 0.02, (i - stripeCount / 2) * 8);
      roadGroup.add(stripe);
      stripes.push(stripe);
    }

    // Side Guard Rails with Glowing Cyber Edge
    const railMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 200), railMat);
    leftRail.position.set(-6.8, 0.2, 0);
    roadGroup.add(leftRail);

    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 200), railMat);
    rightRail.position.set(6.8, 0.2, 0);
    roadGroup.add(rightRail);

    // 6. Rain System
    const rainCount = 1200;
    const rainGeo = new THREE.BufferGeometry();
    const rainPositions = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount * 3; i += 3) {
      rainPositions[i] = (Math.random() - 0.5) * 60;
      rainPositions[i + 1] = Math.random() * 40;
      rainPositions[i + 2] = (Math.random() - 0.5) * 60;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPositions, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.25,
      transparent: true,
      opacity: 0.6
    });
    const rain = new THREE.Points(rainGeo, rainMat);
    rain.visible = false;
    scene.add(rain);
    rainParticlesRef.current = rain;

    // 7. Exhaust Fume Particles
    const exhaustCount = 80;
    const exhaustGeo = new THREE.BufferGeometry();
    const exhaustPositions = new Float32Array(exhaustCount * 3);
    for (let i = 0; i < exhaustCount * 3; i += 3) {
      exhaustPositions[i] = 0;
      exhaustPositions[i + 1] = 0.5;
      exhaustPositions[i + 2] = 3.5 + Math.random() * 2;
    }
    exhaustGeo.setAttribute('position', new THREE.BufferAttribute(exhaustPositions, 3));
    const exhaustMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.4,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending
    });
    const exhaust = new THREE.Points(exhaustGeo, exhaustMat);
    scene.add(exhaust);
    exhaustParticlesRef.current = exhaust;

    // 8. Vehicle Hierarchy (Cab, Engine, Trailer, Wheels)
    const vehicleGroup = new THREE.Group();
    vehicleGroupRef.current = vehicleGroup;
    scene.add(vehicleGroup);

    // Build vehicle sub-groups for exploded view
    const chassis = new THREE.Group();
    const cab = new THREE.Group();
    const engine = new THREE.Group();
    const cargo = new THREE.Group();
    const wheels = new THREE.Group();

    partsRef.current = { chassis, cab, engine, cargo, wheels };

    vehicleGroup.add(chassis);
    vehicleGroup.add(cab);
    vehicleGroup.add(engine);
    vehicleGroup.add(cargo);
    vehicleGroup.add(wheels);

    // Chassis frame
    const chassisMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 0.4, 7.5),
      new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
    );
    chassisMesh.position.y = 0.6;
    chassisMesh.castShadow = true;
    chassis.add(chassisMesh);

    // Cab (Cabin front)
    const cabColor = activeVehicle?.type === 'Truck' ? 0x0284c7 : 0x059669;
    const cabMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.4, 2.2, 2.5),
      new THREE.MeshStandardMaterial({ color: cabColor, metalness: 0.6, roughness: 0.2 })
    );
    cabMesh.position.set(0, 1.8, -2.4);
    cabMesh.castShadow = true;
    cab.add(cabMesh);

    // Windshield Glass
    const glassMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.2, 1.0, 0.2),
      new THREE.MeshPhysicalMaterial({ color: 0x0f172a, roughness: 0.1, transmission: 0.7, transparent: true })
    );
    glassMesh.position.set(0, 2.1, -3.66);
    cab.add(glassMesh);

    // Headlights
    const headMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const leftHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), headMat);
    leftHead.position.set(-0.9, 1.2, -3.66);
    cab.add(leftHead);
    const rightHead = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), headMat);
    rightHead.position.set(0.9, 1.2, -3.66);
    cab.add(rightHead);

    // Engine Block (Glow)
    const engineMesh = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, 1.0, 1.8),
      new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.9, roughness: 0.2 })
    );
    engineMesh.position.set(0, 1.2, -2.4);
    engine.add(engineMesh);

    // Cargo Container / Box
    const cargoMesh = new THREE.Mesh(
      new THREE.BoxGeometry(2.45, 2.5, 4.8),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, metalness: 0.5, roughness: 0.3 })
    );
    cargoMesh.position.set(0, 2.0, 1.3);
    cargoMesh.castShadow = true;
    cargo.add(cargoMesh);

    // Brake Lights (Tail)
    const brakeMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const leftTail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), brakeMat);
    leftTail.position.set(-0.9, 1.2, 3.75);
    cargo.add(leftTail);
    const rightTail = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.3, 0.1), brakeMat);
    rightTail.position.set(0.9, 1.2, 3.75);
    cargo.add(rightTail);
    brakeLightsRef.current = [leftTail, rightTail];

    // Wheels (4-6 wheels)
    const wheelGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.5, 24);
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0a, roughness: 0.8, metalness: 0.2 });
    const wheelPositions = [
      [-1.35, 0.65, -2.4],
      [1.35, 0.65, -2.4],
      [-1.35, 0.65, 1.4],
      [1.35, 0.65, 1.4],
      [-1.35, 0.65, 2.8],
      [1.35, 0.65, 2.8]
    ];

    wheelsRef.current = [];
    wheelPositions.forEach(pos => {
      const w = new THREE.Mesh(wheelGeo, wheelMat);
      w.rotation.z = Math.PI / 2;
      w.position.set(pos[0], pos[1], pos[2]);
      w.castShadow = true;
      wheels.add(w);
      wheelsRef.current.push(w);
    });

    // Animate & Simulation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Highway Stripe Movement based on speed
      const moveSpeed = (speedKmH / 100) * 45 * delta;
      stripes.forEach(s => {
        s.position.z += moveSpeed;
        if (s.position.z > 50) {
          s.position.z = -50;
        }
      });

      // Wheel Spin
      wheelsRef.current.forEach(w => {
        w.rotation.x += (speedKmH / 100) * 15 * delta;
      });

      // Subtle suspension bounce when driving
      if (speedKmH > 0) {
        vehicleGroup.position.y = Math.sin(time * 12) * 0.03;
        vehicleGroup.rotation.z = Math.sin(time * 6) * 0.008;
      }

      // Rain Particles animation
      if (rainParticlesRef.current && rainParticlesRef.current.visible) {
        const positions = rainParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 1; i < positions.length; i += 3) {
          positions[i] -= 35 * delta;
          if (positions[i] < 0) {
            positions[i] = 40;
          }
        }
        rainParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Camera Positioning
      if (cameraMode === 'chase') {
        camera.position.lerp(new THREE.Vector3(0, 4.5, 9.5), 0.08);
        camera.lookAt(0, 1.8, -1.0);
      } else if (cameraMode === 'cockpit') {
        camera.position.lerp(new THREE.Vector3(0, 2.2, -2.1), 0.08);
        camera.lookAt(0, 2.0, -10);
      } else if (cameraMode === 'orbit') {
        const angle = time * 0.5;
        camera.position.set(Math.sin(angle) * 11, 6, Math.cos(angle) * 11);
        camera.lookAt(0, 1.5, 0);
      } else if (cameraMode === 'top') {
        camera.position.lerp(new THREE.Vector3(0, 16, 0), 0.08);
        camera.lookAt(0, 0, 0);
      }

      // Exploded View Part Offsets
      const exp = explodedView ? 1 : 0;
      if (partsRef.current.cab) partsRef.current.cab.position.lerp(new THREE.Vector3(0, exp * 1.5, -exp * 2.0), 0.1);
      if (partsRef.current.cargo) partsRef.current.cargo.position.lerp(new THREE.Vector3(0, exp * 1.8, exp * 2.5), 0.1);
      if (partsRef.current.engine) partsRef.current.engine.position.lerp(new THREE.Vector3(0, -exp * 0.8, -exp * 1.5), 0.1);
      if (partsRef.current.wheels) partsRef.current.wheels.position.lerp(new THREE.Vector3(0, -exp * 0.5, 0), 0.1);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeVehicle, cameraMode, explodedView, speedKmH]);

  // Handle environment lighting switch
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    if (environment === 'night') {
      scene.background = new THREE.Color(0x02040a);
      scene.fog = new THREE.FogExp2(0x02040a, 0.035);
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    } else if (environment === 'rain') {
      scene.background = new THREE.Color(0x050d1a);
      scene.fog = new THREE.FogExp2(0x050d1a, 0.04);
      if (rainParticlesRef.current) rainParticlesRef.current.visible = true;
    } else if (environment === 'day') {
      scene.background = new THREE.Color(0x1e293b);
      scene.fog = new THREE.FogExp2(0x1e293b, 0.015);
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    } else {
      // Cyber
      scene.background = new THREE.Color(0x060914);
      scene.fog = new THREE.FogExp2(0x060914, 0.025);
      if (rainParticlesRef.current) rainParticlesRef.current.visible = false;
    }
  }, [environment]);

  const handleBoost = () => {
    setBoostActive(true);
    setSpeedKmH(115);
    setTimeout(() => {
      setBoostActive(false);
      setSpeedKmH(65);
    }, 2500);
  };

  const handleBrake = () => {
    setBrakesActive(true);
    setSpeedKmH(0);
    setTimeout(() => {
      setBrakesActive(false);
      setSpeedKmH(65);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      {/* 3D Proving Ground Stage */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
        <div ref={mountRef} className="h-[480px] w-full" />

        {/* Top HUD: Active Digital Twin Stats */}
        <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
          <div className="flex items-center space-x-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/60 pointer-events-auto">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                {activeVehicle.name}
                <span className="font-mono text-[10px] text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                  {activeVehicle.licensePlate}
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                {activeVehicle.type} • {activeVehicle.fuelType} • {activeVehicle.region}
              </div>
            </div>
          </div>

          {/* Camera View Selector Buttons */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60 pointer-events-auto">
            <Camera className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-1" />
            {[
              { id: 'chase', label: 'Chase 3D' },
              { id: 'cockpit', label: 'Cockpit' },
              { id: 'orbit', label: 'Orbit' },
              { id: 'top', label: 'Top-Down' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setCameraMode(c.id as any)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold font-mono transition ${
                  cameraMode === c.id
                    ? 'bg-emerald-500 text-white shadow'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Floating Telemetry & Vehicle Drive Control Bar */}
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-slate-800 pointer-events-auto">
          {/* Live Digital Gauge Cluster */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Gauge className="w-5 h-5 text-cyan-400" />
              <div>
                <div className="text-xl font-black text-white font-mono tracking-wider">
                  {speedKmH} <span className="text-xs text-slate-400 font-normal">KM/H</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Telemetry Speed</div>
              </div>
            </div>

            <div className="hidden sm:block h-8 w-px bg-slate-800" />

            <div className="hidden sm:flex items-center space-x-3">
              <div>
                <div className="text-sm font-bold text-emerald-400 font-mono">
                  {speedKmH > 0 ? (2100 + (speedKmH * 15)).toLocaleString() : 800} RPM
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Powertrain</div>
              </div>

              <div>
                <div className="text-sm font-bold text-amber-400 font-mono">
                  {activeVehicle.maxLoadCapacityKg.toLocaleString()} KG
                </div>
                <div className="text-[10px] text-slate-400 font-mono">Max Rating</div>
              </div>
            </div>
          </div>

          {/* Interactive Simulation Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Boost Turbo Button */}
            <button
              onClick={handleBoost}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-1.5 ${
                boostActive
                  ? 'bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/50 scale-105'
                  : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>{boostActive ? 'TURBO CHARGED!' : 'BOOST (115 KM/H)'}</span>
            </button>

            {/* Emergency Brake Button */}
            <button
              onClick={handleBrake}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition flex items-center space-x-1.5 ${
                brakesActive
                  ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              <span>{brakesActive ? 'ABS BRAKING' : 'BRAKE'}</span>
            </button>

            {/* 3D Exploded View Toggle */}
            <button
              onClick={() => setExplodedView(!explodedView)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold font-mono transition flex items-center space-x-1.5 ${
                explodedView
                  ? 'bg-indigo-500 text-white border border-indigo-400'
                  : 'bg-slate-900 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{explodedView ? 'Collapse 3D' : 'Explode Parts'}</span>
            </button>

            {/* Environment Switcher */}
            <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
              {[
                { id: 'cyber', icon: Sparkles, title: 'Cyber Matrix' },
                { id: 'day', icon: Sun, title: 'Daylight' },
                { id: 'night', icon: Moon, title: 'Midnight' },
                { id: 'rain', icon: CloudRain, title: 'Rain Storm' },
              ].map(env => {
                const Icon = env.icon;
                return (
                  <button
                    key={env.id}
                    title={env.title}
                    onClick={() => setEnvironment(env.id as any)}
                    className={`p-1.5 rounded-lg transition ${
                      environment === env.id
                        ? 'bg-emerald-500 text-white'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Fleet Vehicle Quick Switcher Strip */}
      <div className="flex items-center space-x-3 overflow-x-auto pb-2">
        {vehicles.map(v => (
          <button
            key={v.id}
            onClick={() => onSelectVehicle?.(v)}
            className={`flex items-center space-x-2.5 px-4 py-2.5 rounded-xl border text-left shrink-0 transition ${
              v.id === activeVehicle.id
                ? 'bg-emerald-500/10 border-emerald-500/50 text-white shadow'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${
              v.status === 'Available' ? 'bg-emerald-400' : v.status === 'On Trip' ? 'bg-cyan-400' : 'bg-amber-400'
            }`} />
            <div>
              <div className="text-xs font-bold text-slate-200 truncate max-w-[160px]">{v.name}</div>
              <div className="text-[10px] font-mono text-slate-400">{v.licensePlate} • {v.type}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
