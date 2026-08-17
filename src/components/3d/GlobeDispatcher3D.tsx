import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Trip } from '../../types';
import { 
  Globe2, 
  Send, 
  MapPin, 
  Compass, 
  Radio, 
  Play, 
  Pause,
  Layers,
  Sparkles
} from 'lucide-react';

interface GlobeDispatcher3DProps {
  trips?: Trip[];
  className?: string;
  onSelectTrip?: (trip: Trip) => void;
}

// Hub coordinate definitions for 3D sphere mapping
const LOGISTICS_HUBS: Record<string, { lat: number; lng: number; color: number }> = {
  'Seattle, WA': { lat: 47.6062, lng: -122.3321, color: 0x10b981 },
  'Portland, OR': { lat: 45.5152, lng: -122.6784, color: 0x10b981 },
  'Los Angeles, CA': { lat: 34.0522, lng: -118.2437, color: 0x38bdf8 },
  'San Francisco, CA': { lat: 37.7749, lng: -122.4194, color: 0x38bdf8 },
  'Chicago, IL': { lat: 41.8781, lng: -87.6298, color: 0xa855f7 },
  'Dallas, TX': { lat: 32.7767, lng: -96.7970, color: 0xf59e0b },
  'New York, NY': { lat: 40.7128, lng: -74.0060, color: 0xec4899 },
  'Boston, MA': { lat: 42.3601, lng: -71.0589, color: 0xec4899 },
  'Denver, CO': { lat: 39.7392, lng: -104.9903, color: 0x06b6d4 },
  'Atlanta, GA': { lat: 33.7490, lng: -84.3880, color: 0xf97316 },
  'Miami, FL': { lat: 25.7617, lng: -80.1918, color: 0xf43f5e },
  'Phoenix, AZ': { lat: 33.4484, lng: -112.0740, color: 0xeab308 },
  'Vancouver, BC': { lat: 49.2827, lng: -123.1207, color: 0x10b981 },
  'Houston, TX': { lat: 29.7604, lng: -95.3698, color: 0xf59e0b }
};

export const GlobeDispatcher3D: React.FC<GlobeDispatcher3DProps> = ({
  trips = [],
  className = 'h-96 w-full',
  onSelectTrip
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedHub, setSelectedHub] = useState<string | null>('Seattle, WA');
  const [isRotating, setIsRotating] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [activeTabMode, setActiveTabMode] = useState<'all' | 'active' | 'completed'>('active');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const particlesRef = useRef<{ mesh: THREE.Mesh; curve: THREE.QuadraticBezierCurve3; progress: number }[]>([]);
  const animFrameIdRef = useRef<number | null>(null);

  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });

  // Convert GPS Lat/Long to 3D Sphere Position
  const latLngToVector3 = (lat: number, lng: number, radius = 5): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 400;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x060913);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, 13);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 2.0);
    dirLight1.position.set(15, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x10b981, 1.2);
    dirLight2.position.set(-15, -10, -10);
    scene.add(dirLight2);

    // 5. Globe Group
    const globeGroup = new THREE.Group();
    globeGroupRef.current = globeGroup;
    scene.add(globeGroup);

    // Base Sphere
    const globeGeo = new THREE.SphereGeometry(5, 64, 64);
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x0f172a,
      emissive: 0x020617,
      specular: 0x38bdf8,
      shininess: 25,
      wireframe: false
    });
    const globeMesh = new THREE.Mesh(globeGeo, globeMat);
    globeGroup.add(globeMesh);

    // Outer Glow Halo Sphere
    const atmosphereGeo = new THREE.SphereGeometry(5.2, 32, 32);
    const atmosphereMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide
    });
    const atmosphere = new THREE.Mesh(atmosphereGeo, atmosphereMat);
    globeGroup.add(atmosphere);

    // Longitude & Latitude Graticule Rings
    for (let lat = -60; lat <= 60; lat += 30) {
      const ringRadius = 5 * Math.cos((lat * Math.PI) / 180);
      const ringY = 5 * Math.sin((lat * Math.PI) / 180);
      const ringGeo = new THREE.BufferGeometry();
      const points = [];
      for (let i = 0; i <= 64; i++) {
        const theta = (i / 64) * Math.PI * 2;
        points.push(new THREE.Vector3(Math.cos(theta) * ringRadius, ringY, Math.sin(theta) * ringRadius));
      }
      ringGeo.setFromPoints(points);
      const ringMat = new THREE.LineBasicMaterial({ color: 0x1e293b, transparent: true, opacity: 0.4 });
      const ringLine = new THREE.Line(ringGeo, ringMat);
      globeGroup.add(ringLine);
    }

    // 6. Add Logistics Hub Pins
    Object.entries(LOGISTICS_HUBS).forEach(([cityName, coords]) => {
      const pinPos = latLngToVector3(coords.lat, coords.lng, 5.05);

      // Pulse Ring
      const pinGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({ color: coords.color });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pinPos);
      globeGroup.add(pinMesh);

      // Radar Beacon Spike
      const spikeGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.6);
      const spikeMat = new THREE.MeshBasicMaterial({ color: coords.color, transparent: true, opacity: 0.8 });
      const spike = new THREE.Mesh(spikeGeo, spikeMat);
      spike.position.copy(latLngToVector3(coords.lat, coords.lng, 5.35));
      spike.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), pinPos.clone().normalize());
      globeGroup.add(spike);
    });

    // 7. Render 3D Dispatch Bezier Arcs
    particlesRef.current = [];
    renderRouteArcs(globeGroup, trips);

    // 8. Animation
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (isRotating && !isDraggingRef.current) {
        globeGroup.rotation.y += delta * 0.15 * simulationSpeed;
      }

      // Animate Dispatch Cargo Particles along Arcs
      particlesRef.current.forEach((item) => {
        item.progress += delta * 0.3 * simulationSpeed;
        if (item.progress > 1) item.progress = 0;
        const newPos = item.curve.getPoint(item.progress);
        item.mesh.position.copy(newPos);
      });

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Interaction
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !globeGroupRef.current) return;
      const dx = e.clientX - prevMousePosRef.current.x;
      const dy = e.clientY - prevMousePosRef.current.y;

      globeGroupRef.current.rotation.y += dx * 0.006;
      globeGroupRef.current.rotation.x = Math.max(-0.8, Math.min(0.8, globeGroupRef.current.rotation.x + dy * 0.006));

      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      renderer.dispose();
    };
  }, [trips]);

  // Helper to build 3D Curved Bezier Curves for Dispatch Routes
  const renderRouteArcs = (group: THREE.Group, tripList: Trip[]) => {
    // Default demo routes if trips are empty
    const activeTrips = tripList.filter(t => t.status === 'Dispatched' || t.status === 'Draft');
    const demoRoutes = [
      { origin: 'Seattle, WA', destination: 'Portland, OR', color: 0x10b981 },
      { origin: 'San Francisco, CA', destination: 'Los Angeles, CA', color: 0x38bdf8 },
      { origin: 'Chicago, IL', destination: 'Dallas, TX', color: 0xa855f7 },
      { origin: 'New York, NY', destination: 'Boston, MA', color: 0xec4899 },
      { origin: 'Denver, CO', destination: 'Phoenix, AZ', color: 0x06b6d4 },
      { origin: 'Atlanta, GA', destination: 'Miami, FL', color: 0xf97316 },
    ];

    const routesToDraw = activeTrips.length > 0
      ? activeTrips.map(t => ({
          origin: t.origin,
          destination: t.destination,
          color: t.status === 'Dispatched' ? 0x10b981 : 0x38bdf8
        }))
      : demoRoutes;

    routesToDraw.forEach((route, idx) => {
      const origCoords = LOGISTICS_HUBS[route.origin] || { lat: 37.77, lng: -122.41 };
      const destCoords = LOGISTICS_HUBS[route.destination] || { lat: 34.05, lng: -118.24 };

      const v1 = latLngToVector3(origCoords.lat, origCoords.lng, 5.05);
      const v2 = latLngToVector3(destCoords.lat, destCoords.lng, 5.05);

      // Mid-point arched outward for flight trajectory
      const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
      const distance = v1.distanceTo(v2);
      mid.normalize().multiplyScalar(5.05 + Math.min(2.5, distance * 0.4));

      const curve = new THREE.QuadraticBezierCurve3(v1, mid, v2);
      const points = curve.getPoints(50);
      const geometry = new THREE.BufferGeometry().setFromPoints(points);

      const material = new THREE.LineBasicMaterial({
        color: route.color || 0x10b981,
        linewidth: 2,
        transparent: true,
        opacity: 0.85
      });

      const curveObject = new THREE.Line(geometry, material);
      group.add(curveObject);

      // Animated Glowing Particle Payload
      const particleGeo = new THREE.SphereGeometry(0.1, 8, 8);
      const particleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const particleMesh = new THREE.Mesh(particleGeo, particleMat);
      particleMesh.position.copy(v1);
      group.add(particleMesh);

      particlesRef.current.push({
        mesh: particleMesh,
        curve,
        progress: (idx * 0.25) % 1
      });
    });
  };

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl group">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className={className} />

      {/* Top Left Global Fleet Radar HUD */}
      <div className="absolute top-4 left-4 pointer-events-none flex flex-col space-y-1.5">
        <div className="flex items-center space-x-2 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <Globe2 className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '14s' }} />
          <span className="text-xs font-mono font-bold text-white">
            Logistics Flight & Route Radar
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold uppercase">
            3D Global
          </span>
        </div>

        <div className="flex items-center space-x-2 bg-slate-900/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Active Streams: <strong className="text-emerald-400">{trips.filter(t => t.status === 'Dispatched').length || 6} Dispatched</strong></span>
        </div>
      </div>

      {/* Top Right Tactical Hub Selector */}
      <div className="absolute top-4 right-4 flex items-center space-x-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700/60">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Speed:</span>
        {[1, 2, 4].map((s) => (
          <button
            key={s}
            id={`btn-speed-${s}x`}
            onClick={() => setSimulationSpeed(s)}
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition ${
              simulationSpeed === s ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-white'
            }`}
          >
            {s}x
          </button>
        ))}

        <button
          id="btn-toggle-globe-rotate"
          onClick={() => setIsRotating(!isRotating)}
          className="p-1 rounded bg-slate-800 text-slate-300 hover:text-white transition ml-1"
          title="Pause / Resume Rotation"
        >
          {isRotating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
        </button>
      </div>

      {/* Bottom Hub Legend Bar */}
      <div className="absolute bottom-4 inset-x-4 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800 text-xs">
        <div className="flex items-center space-x-3 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-slate-400 font-semibold text-[11px] flex items-center">
            <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Key Hubs:
          </span>
          {Object.keys(LOGISTICS_HUBS).slice(0, 5).map((hub) => (
            <button
              key={hub}
              onClick={() => setSelectedHub(hub)}
              className={`text-[11px] px-2 py-0.5 rounded-lg border transition whitespace-nowrap ${
                selectedHub === hub
                  ? 'bg-slate-800 text-emerald-300 border-emerald-500/40'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-200'
              }`}
            >
              {hub.split(',')[0]}
            </button>
          ))}
        </div>

        <div className="text-[10px] text-slate-500 font-mono hidden sm:block whitespace-nowrap pl-2">
          🖱️ Click & Drag to Orbit Sphere
        </div>
      </div>
    </div>
  );
};
