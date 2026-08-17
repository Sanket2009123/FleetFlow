import React from 'react';
import { 
  Truck, 
  Wrench, 
  Percent, 
  Package, 
  Send, 
  PlusCircle, 
  AlertTriangle, 
  TrendingUp, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Gauge, 
  Fuel, 
  Boxes,
  Sparkles
} from 'lucide-react';
import { DashboardKPIs, Vehicle, Driver, Trip, MaintenanceLog } from '../../types';
import { Card3DTilt } from '../3d/Card3DTilt';

interface CommandCenterProps {
  kpis?: DashboardKPIs;
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: MaintenanceLog[];
  onOpenNewTrip: () => void;
  onOpenNewVehicle: () => void;
  onOpenNewMaintenance: () => void;
  onNavigateTab: (tab: string) => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  kpis,
  vehicles,
  drivers,
  trips,
  maintenanceLogs,
  onOpenNewTrip,
  onOpenNewVehicle,
  onOpenNewMaintenance,
  onNavigateTab
}) => {
  const activeFleetCount = kpis?.activeFleet ?? vehicles.filter(v => v.status === 'On Trip').length;
  const inShopCount = kpis?.inShopCount ?? vehicles.filter(v => v.status === 'In Shop').length;
  const utilizationRate = kpis?.utilizationRate ?? (vehicles.length > 0 ? ((activeFleetCount / vehicles.length) * 100).toFixed(1) : 0);
  const pendingCargoCount = kpis?.pendingCargoCount ?? trips.filter(t => t.status === 'Draft').length;

  const activeTrips = trips.filter(t => t.status === 'Dispatched').slice(0, 4);
  const urgentMaintenance = maintenanceLogs.filter(m => m.status === 'In Progress' || m.priority === 'Critical').slice(0, 3);
  const expiredDrivers = drivers.filter(d => new Date(d.licenseExpiryDate).getTime() < new Date().getTime());

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner / Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-850 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
              Live Fleet Telemetry &bull; Active Operations
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Enterprise Fleet Command Center
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
            Real-time multi-hub dispatch orchestration, asset health monitoring, and automated safety rule validation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            id="btn-quick-3d-twin"
            onClick={() => onNavigateTab('3d_twin')}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-semibold text-xs transition-all shadow-md"
          >
            <Boxes className="w-4 h-4" />
            <span>3D Fleet Twin & Radar</span>
          </button>

          <button
            onClick={onOpenNewTrip}
            className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-900/40 transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            <span>Create Dispatch</span>
          </button>
          
          <button
            onClick={onOpenNewVehicle}
            className="flex items-center space-x-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-all"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>New Asset</span>
          </button>
        </div>
      </div>

      {/* 4 Core Primary KPIs with 3D Tilt Physics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1: Active Fleet */}
        <Card3DTilt maxRotation={8} scaleFactor={1.02}>
          <div 
            onClick={() => onNavigateTab('trips')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all cursor-pointer group shadow-lg h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-emerald-300">
                Active Fleet
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white font-mono">{activeFleetCount}</span>
              <span className="text-xs text-slate-400">/ {vehicles.length} vehicles</span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-emerald-400 font-medium">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Vehicles currently On Trip</span>
            </div>
          </div>
        </Card3DTilt>

        {/* KPI 2: Maintenance Alerts (In Shop) */}
        <Card3DTilt maxRotation={8} scaleFactor={1.02}>
          <div 
            onClick={() => onNavigateTab('maintenance')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all cursor-pointer group shadow-lg h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-amber-300">
                Maintenance Alerts
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Wrench className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-amber-400 font-mono">{inShopCount}</span>
              <span className="text-xs text-slate-400">In Shop</span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-amber-300 font-medium">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Auto-locked from dispatch pool</span>
            </div>
          </div>
        </Card3DTilt>

        {/* KPI 3: Fleet Utilization Rate */}
        <Card3DTilt maxRotation={8} scaleFactor={1.02}>
          <div 
            onClick={() => onNavigateTab('analytics')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 transition-all cursor-pointer group shadow-lg h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-indigo-300">
                Utilization Rate
              </span>
              <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white font-mono">{utilizationRate}%</span>
              <span className="text-xs text-slate-400">capacity deployed</span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-indigo-300 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target: &gt; 75.0% efficiency</span>
            </div>
          </div>
        </Card3DTilt>

        {/* KPI 4: Pending Cargo (Drafts) */}
        <Card3DTilt maxRotation={8} scaleFactor={1.02}>
          <div 
            onClick={() => onNavigateTab('trips')}
            className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all cursor-pointer group shadow-lg h-full"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-purple-300">
                Pending Cargo
              </span>
              <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center border border-purple-500/20">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-white font-mono">{pendingCargoCount}</span>
              <span className="text-xs text-slate-400">shipments queued</span>
            </div>
            <div className="mt-2 flex items-center space-x-1.5 text-[11px] text-purple-300 font-medium">
              <Clock className="w-3.5 h-3.5" />
              <span>Ready for driver assignment</span>
            </div>
          </div>
        </Card3DTilt>

      </div>

      {/* Safety & Compliance Alerts Banner (If Expired Licenses Found) */}
      {expiredDrivers.length > 0 && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/80 text-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <span className="font-bold text-white">Compliance Alert:</span> {expiredDrivers.length} driver(s) have expired commercial licenses (e.g. {expiredDrivers.map(d => d.name).join(', ')}). System is blocking dispatches automatically.
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('drivers')}
            className="px-3 py-1.5 rounded-lg bg-rose-900/80 hover:bg-rose-800 text-white font-semibold self-start sm:self-auto shrink-0 transition-colors"
          >
            Review Drivers
          </button>
        </div>
      )}

      {/* Main Grid: Active Dispatches & Maintenance Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Active Dispatches (2 Columns) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Live Active Dispatches
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab('trips')}
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 font-semibold"
            >
              <span>View All ({trips.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {activeTrips.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              No trips currently active on route. Dispatch queued cargo shipments.
            </div>
          ) : (
            <div className="space-y-3">
              {activeTrips.map((trip) => (
                <div 
                  key={trip.id}
                  className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono font-bold text-emerald-400">{trip.tripCode}</span>
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-emerald-500/20 text-emerald-300 text-[10px]">
                        Dispatched
                      </span>
                    </div>
                    <div className="font-semibold text-white text-sm">
                      {trip.origin} &rarr; {trip.destination}
                    </div>
                    <div className="text-slate-400 text-[11px] flex flex-wrap gap-x-3">
                      <span>Vehicle: <strong className="text-slate-300">{trip.vehiclePlate}</strong></span>
                      <span>Driver: <strong className="text-slate-300">{trip.driverName}</strong></span>
                      <span>Cargo: <strong className="text-slate-300">{trip.cargoWeightKg.toLocaleString()} kg</strong></span>
                    </div>
                  </div>

                  <div className="text-right sm:shrink-0">
                    <div className="text-xs font-mono font-bold text-white">
                      ${trip.revenue?.toLocaleString() || '0'}
                    </div>
                    <div className="text-[10px] text-slate-400">{trip.distanceKm} km route</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance & Fleet Health (1 Column) */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Wrench className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Service Queue
              </h2>
            </div>
            <button
              onClick={onOpenNewMaintenance}
              className="text-xs text-amber-400 hover:text-amber-300 flex items-center space-x-1 font-semibold"
            >
              <span>+ Log Service</span>
            </button>
          </div>

          {urgentMaintenance.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              All fleet assets are fully operational.
            </div>
          ) : (
            <div className="space-y-3">
              {urgentMaintenance.map((m) => (
                <div 
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/90 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{m.serviceType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.priority === 'Critical' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'
                    }`}>
                      {m.priority}
                    </span>
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    Asset: <span className="text-slate-200 font-mono">{m.vehiclePlate}</span> ({m.vehicleName})
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-850">
                    <span>{m.serviceProvider}</span>
                    <span className="font-mono font-bold text-amber-400">${m.cost.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick Hub Stats */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2 text-xs">
            <div className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
              Asset Class Breakdown
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">{vehicles.filter(v => v.type === 'Truck').length}</div>
                <div className="text-[10px] text-slate-400">Trucks</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">{vehicles.filter(v => v.type === 'Van').length}</div>
                <div className="text-[10px] text-slate-400">Vans</div>
              </div>
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                <div className="font-bold text-white">{vehicles.filter(v => v.type === 'Bike').length}</div>
                <div className="text-[10px] text-slate-400">Bikes</div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
