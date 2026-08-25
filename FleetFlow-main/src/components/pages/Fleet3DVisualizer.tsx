import React, { useState } from 'react';
import { Vehicle, Trip } from '../../types';
import { VehicleModel3D } from '../3d/VehicleModel3D';
import { GlobeDispatcher3D } from '../3d/GlobeDispatcher3D';
import { Fleet3DSimulator } from '../3d/Fleet3DSimulator';
import { CargoLoading3D } from '../3d/CargoLoading3D';
import { 
  Boxes, 
  Globe2, 
  Truck, 
  Send, 
  Cpu, 
  Radio, 
  Gauge, 
  Zap, 
  Sliders, 
  RefreshCw, 
  Activity, 
  CheckCircle2, 
  Layers,
  Sparkles,
  PackageCheck
} from 'lucide-react';

interface Fleet3DVisualizerProps {
  vehicles: Vehicle[];
  trips: Trip[];
  onDispatchTrip?: () => void;
}

export const Fleet3DVisualizer: React.FC<Fleet3DVisualizerProps> = ({
  vehicles,
  trips,
  onDispatchTrip
}) => {
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || 'v-1');
  const [active3DTab, setActive3DTab] = useState<'simulator' | 'split' | 'vehicle' | 'cargo' | 'globe'>('simulator');
  const [payloadLoadSlider, setPayloadLoadSlider] = useState<number>(85);

  const activeVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/60 p-6 rounded-3xl border border-slate-800 backdrop-blur-md">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <div className="p-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                3D Fleet Digital Twin & Dynamic Proving Ground
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Three.js 3D WebGL
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Interactive real-time 3D telemetry visualization, full-motion highway drive simulation, cargo packing twin, and tactical global flight radar.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start lg:self-auto overflow-x-auto">
          <button
            id="tab-3d-simulator"
            onClick={() => setActive3DTab('simulator')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              active3DTab === 'simulator'
                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 border border-emerald-400'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3D Highway Proving Ground</span>
          </button>

          <button
            id="tab-3d-split"
            onClick={() => setActive3DTab('split')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              active3DTab === 'split'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>Split Twin + Radar</span>
          </button>

          <button
            id="tab-3d-cargo"
            onClick={() => setActive3DTab('cargo')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              active3DTab === 'cargo'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>3D Cargo Packer</span>
          </button>

          <button
            id="tab-3d-globe"
            onClick={() => setActive3DTab('globe')}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
              active3DTab === 'globe'
                ? 'bg-slate-800 text-white shadow border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>3D Global Radar</span>
          </button>
        </div>
      </div>

      {/* Main 3D View Rendered Based on Active Tab */}
      {active3DTab === 'simulator' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Interactive Highway Dynamic Driving & Powertrain Simulation
            </h2>
            <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-800/60">
              Live Real-Time 3D Physics Loop
            </span>
          </div>

          <Fleet3DSimulator
            vehicles={vehicles}
            selectedVehicle={activeVehicle}
            onSelectVehicle={(v) => setSelectedVehicleId(v.id)}
          />
        </div>
      )}

      {active3DTab === 'cargo' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <PackageCheck className="w-4 h-4 text-amber-400" />
                3D Cargo Volumetric Load & Weight Distribution Twin
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {activeVehicle?.name} ({activeVehicle?.maxLoadCapacityKg?.toLocaleString()} kg max)
              </span>
            </div>

            <CargoLoading3D
              maxCapacityKg={activeVehicle?.maxLoadCapacityKg || 18000}
              className="h-[460px] w-full"
            />
          </div>

          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Selected Fleet Vehicle Specs
              </h4>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Vehicle Name</div>
                  <div className="font-bold text-white text-sm mt-0.5">{activeVehicle?.name}</div>
                  <div className="text-emerald-400 font-mono text-[10px] mt-0.5">{activeVehicle?.licensePlate} • {activeVehicle?.type}</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Axle Weight Distribution Target</div>
                  <div className="font-bold text-cyan-400 font-mono text-sm mt-0.5">52% Front / 48% Rear</div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Optimized for stability & fuel efficiency</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Fuel & Powertrain</div>
                  <div className="font-bold text-emerald-400 font-mono text-sm mt-0.5">{activeVehicle?.fuelType} Engine</div>
                  <div className="text-slate-400 text-[10px] mt-0.5">Operational Region: {activeVehicle?.region}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {active3DTab === 'split' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-emerald-400" />
                3D Telemetry Twin: <span className="text-emerald-400">{activeVehicle?.name}</span>
              </h3>
              <span className="text-xs font-mono text-slate-400">
                {activeVehicle?.type} • {activeVehicle?.fuelType} Engine
              </span>
            </div>

            <VehicleModel3D
              vehicle={activeVehicle}
              className="h-[440px] w-full"
              autoRotate={true}
              showControls={true}
            />
          </div>

          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-cyan-400" />
              Global Tactical Dispatch Radar
            </h3>
            <GlobeDispatcher3D trips={trips} className="h-[440px] w-full" />
          </div>
        </div>
      )}

      {active3DTab === 'globe' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-cyan-400" />
            Global Fleet Route Flight Radar (3D Sphere Logistics)
          </h3>
          <GlobeDispatcher3D trips={trips} className="h-[560px] w-full" />
        </div>
      )}
    </div>
  );
};

