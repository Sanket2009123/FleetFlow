import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { 
  Database, 
  Server, 
  Code2, 
  Layers, 
  CheckCircle2, 
  RefreshCw, 
  Terminal, 
  Zap, 
  Boxes, 
  FileJson, 
  Cpu, 
  ArrowRight,
  ShieldCheck,
  Send,
  AlertCircle
} from 'lucide-react';

export const MernHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'explorer' | 'tester' | 'schemas'>('architecture');
  const [selectedCollection, setSelectedCollection] = useState<'vehicles' | 'drivers' | 'trips' | 'maintenance' | 'expenses'>('vehicles');
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [collectionData, setCollectionData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiEndpoint, setApiEndpoint] = useState('/api/vehicles');
  const [apiMethod, setApiMethod] = useState<'GET' | 'POST' | 'PATCH'>('GET');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [pingLatency, setPingLatency] = useState<number | null>(null);

  // Fetch status on mount
  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    setLoading(true);
    const start = performance.now();
    try {
      const status = await api.getMernStatus();
      const end = performance.now();
      setPingLatency(Math.round(end - start));
      setDbStatus(status);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Load collection documents
  const loadCollectionDocs = async (coll: typeof selectedCollection) => {
    setSelectedCollection(coll);
    setLoading(true);
    try {
      if (coll === 'vehicles') {
        const res = await api.getVehicles();
        setCollectionData(res);
      } else if (coll === 'drivers') {
        const res = await api.getDrivers();
        setCollectionData(res);
      } else if (coll === 'trips') {
        const res = await api.getTrips();
        setCollectionData(res);
      } else if (coll === 'maintenance') {
        const res = await api.getMaintenanceLogs();
        setCollectionData(res);
      } else if (coll === 'expenses') {
        const res = await api.getExpenses();
        setCollectionData(res);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleTestApi = async () => {
    setLoading(true);
    try {
      if (apiEndpoint === '/api/vehicles') {
        const res = await api.getVehicles();
        setApiResponse(res);
      } else if (apiEndpoint === '/api/drivers') {
        const res = await api.getDrivers();
        setApiResponse(res);
      } else if (apiEndpoint === '/api/trips') {
        const res = await api.getTrips();
        setApiResponse(res);
      } else if (apiEndpoint === '/api/kpis') {
        const res = await api.getKPIs();
        setApiResponse(res);
      } else if (apiEndpoint === '/api/health') {
        const res = await api.checkHealth();
        setApiResponse(res);
      } else {
        const res = await api.getMernStatus();
        setApiResponse(res);
      }
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleFactoryReset = async () => {
    if (confirm('Reset MongoDB database and local caches to initial factory dataset?')) {
      setLoading(true);
      await api.seedMernDatabase();
      await loadStatus();
      await loadCollectionDocs(selectedCollection);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-3 mb-1.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                MERN Stack Architecture & MongoDB Hub
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Full-Stack Node.js
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                MongoDB Mongoose models, Express REST endpoints, React frontend, and Node.js container runtime.
              </p>
            </div>
          </div>
        </div>

        {/* Live Diagnostics Pill */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 text-xs font-mono">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300">Express REST API: <strong>PORT 3000</strong></span>
            {pingLatency && <span className="text-emerald-400">({pingLatency}ms)</span>}
          </div>

          <button
            id="btn-refresh-mern-status"
            onClick={loadStatus}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Refresh Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* MERN Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        {[
          { id: 'architecture', label: 'Stack Architecture', icon: Layers },
          { id: 'explorer', label: 'MongoDB Collection Explorer', icon: FileJson },
          { id: 'tester', label: 'Live REST API Tester', icon: Terminal },
          { id: 'schemas', label: 'Mongoose Schemas', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              id={`tab-mern-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id as any);
                if (tab.id === 'explorer') loadCollectionDocs('vehicles');
              }}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: ARCHITECTURE OVERVIEW */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          {/* MERN Architecture 4 Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-emerald-400 font-mono">M</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">DATABASE</span>
              </div>
              <div className="text-base font-bold text-white">MongoDB + Mongoose</div>
              <p className="text-xs text-slate-400">
                5 Schema Models with strict typing, virtuals, and automatic JSON transforms for vehicles, drivers, trips, maintenance, and expenses.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-cyan-400 font-mono">E</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold">BACKEND</span>
              </div>
              <div className="text-base font-bold text-white">Express.js Server</div>
              <p className="text-xs text-slate-400">
                RESTful routing on <code className="text-cyan-300 font-mono">/api/*</code> with dispatch state transitions, overweight cargo validation, and maintenance locking.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-indigo-400 font-mono">R</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold">FRONTEND</span>
              </div>
              <div className="text-base font-bold text-white">React 19 + Vite</div>
              <p className="text-xs text-slate-400">
                Modular dashboard with live Three.js 3D WebGL digital twins, Tailwind CSS, Lucide icons, and responsive modals.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-black text-amber-400 font-mono">N</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">RUNTIME</span>
              </div>
              <div className="text-base font-bold text-white">Node.js Engine</div>
              <p className="text-xs text-slate-400">
                High-performance containerized execution, esbuild production bundling, and zero-downtime server-side middleware.
              </p>
            </div>
          </div>

          {/* Database Diagnostics Box */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-emerald-400" />
                Live Database Diagnostics & Collection Counts
              </h3>
              <button
                id="btn-factory-seed"
                onClick={handleFactoryReset}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Factory Re-Seed Database</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[
                { label: 'Vehicles', count: dbStatus?.collections?.vehicles ?? 8, col: 'vehicles' },
                { label: 'Drivers', count: dbStatus?.collections?.drivers ?? 8, col: 'drivers' },
                { label: 'Trips', count: dbStatus?.collections?.trips ?? 6, col: 'trips' },
                { label: 'Maintenance', count: dbStatus?.collections?.maintenance ?? 6, col: 'maintenance' },
                { label: 'Expenses', count: dbStatus?.collections?.expenses ?? 8, col: 'expenses' },
              ].map((c) => (
                <div key={c.label} className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.label} Collection</div>
                  <div className="text-2xl font-black text-white font-mono mt-1">{c.count}</div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-0.5">Documents Active</div>
                </div>
              ))}
            </div>

            {/* MongoDB Atlas Setup Guide Note */}
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-start space-x-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">MongoDB Remote Atlas Integration Ready</p>
                <p className="text-slate-400 leading-relaxed">
                  To connect your remote MongoDB Atlas cluster, set <code className="text-emerald-400 font-mono bg-slate-900 px-1 py-0.5 rounded">MONGODB_URI="mongodb+srv://..."</code> in your environment. The server automatically validates all schemas, manages collections, and seamlessly falls back to the in-memory engine if credentials are not specified.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: COLLECTION EXPLORER */}
      {activeTab === 'explorer' && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            {(['vehicles', 'drivers', 'trips', 'maintenance', 'expenses'] as const).map((coll) => (
              <button
                key={coll}
                id={`btn-coll-${coll}`}
                onClick={() => loadCollectionDocs(coll)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition uppercase tracking-wider ${
                  selectedCollection === coll
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 border border-slate-800'
                }`}
              >
                {coll} ({collectionData.length || '...'})
              </button>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono text-slate-400">
                Collection: <strong className="text-emerald-400">db.{selectedCollection}</strong> • {collectionData.length} records returned
              </span>
              <button
                onClick={() => loadCollectionDocs(selectedCollection)}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Refresh JSON
              </button>
            </div>

            <pre className="p-4 rounded-xl bg-slate-900 font-mono text-xs text-slate-300 overflow-x-auto max-h-[500px] border border-slate-800">
              {JSON.stringify(collectionData, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* TAB 3: REST API TESTER */}
      {activeTab === 'tester' && (
        <div className="space-y-4">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              Interactive Express REST API Request Console
            </h3>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <select
                id="select-api-endpoint"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                className="w-full sm:w-auto bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl px-4 py-2.5 font-mono focus:border-emerald-500 outline-none"
              >
                <option value="/api/vehicles">GET /api/vehicles</option>
                <option value="/api/drivers">GET /api/drivers</option>
                <option value="/api/trips">GET /api/trips</option>
                <option value="/api/kpis">GET /api/kpis</option>
                <option value="/api/health">GET /api/health</option>
                <option value="/api/mern/status">GET /api/mern/status</option>
              </select>

              <button
                id="btn-send-api-req"
                onClick={handleTestApi}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Request</span>
              </button>
            </div>

            {apiResponse && (
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>HTTP 200 OK • Response Payload</span>
                  <span className="text-emerald-400">Content-Type: application/json</span>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-300 overflow-x-auto max-h-[400px] border border-slate-800">
                  {JSON.stringify(apiResponse, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: MONGOOSE SCHEMAS */}
      {activeTab === 'schemas' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              VehicleSchema (Vehicle.ts)
            </h4>
            <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
{`const VehicleSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, default: 2024 },
  licensePlate: { type: String, required: true, unique: true },
  type: { type: String, enum: ['Truck','Van','Bike','Car','Trailer'] },
  maxLoadCapacityKg: { type: Number, required: true },
  currentOdometerKm: { type: Number, default: 0 },
  status: { type: String, enum: ['Available','On Trip','In Shop','Retired'] }
});`}
            </pre>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <h4 className="text-sm font-bold text-white font-mono flex items-center gap-2">
              <Code2 className="w-4 h-4 text-cyan-400" />
              TripSchema (Trip.ts)
            </h4>
            <pre className="p-3 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-800">
{`const TripSchema = new Schema({
  id: { type: String, required: true, unique: true },
  tripCode: { type: String, required: true, unique: true },
  vehicleId: { type: String, required: true, index: true },
  driverId: { type: String, required: true, index: true },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  cargoWeightKg: { type: Number, required: true },
  status: { type: String, enum: ['Draft','Dispatched','Completed','Cancelled'] }
});`}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
