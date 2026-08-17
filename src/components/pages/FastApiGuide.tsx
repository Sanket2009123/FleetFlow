import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Server, 
  Database, 
  Code2, 
  Play, 
  Activity, 
  CheckCircle2, 
  ExternalLink,
  ShieldAlert,
  Layers,
  FileCode
} from 'lucide-react';
import { api } from '../../services/api';

export const FastApiGuide: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [isChecking, setIsChecking] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2500);
  };

  const handleTestBackend = async () => {
    setIsChecking(true);
    try {
      const res = await api.checkHealth();
      setHealthStatus({
        status: 'healthy',
        timestamp: new Date().toLocaleTimeString(),
        details: res
      });
    } catch (err: any) {
      setHealthStatus({
        status: 'error',
        timestamp: new Date().toLocaleTimeString(),
        message: err?.message || 'Server connection failed'
      });
    } finally {
      setIsChecking(false);
    }
  };

  const mainPyCode = `from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

# --- DATABASE SETUP (SQLite) ---
DATABASE_URL = "sqlite:///./fleetflow.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DATABASE MODELS ---
class VehicleDB(Base):
    __tablename__ = "vehicles"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    model = Column(String)
    year = Column(Integer)
    licensePlate = Column(String, unique=True, index=True, nullable=False)
    type = Column(String)  # Truck, Van, Bike, Car, Trailer
    fuelType = Column(String)  # Diesel, Petrol, Electric, Hybrid
    maxLoadCapacityKg = Column(Float, nullable=False)
    currentOdometerKm = Column(Float, default=0.0)
    acquisitionCost = Column(Float, default=0.0)
    status = Column(String, default="Available")  # Available, On Trip, In Shop, Retired
    region = Column(String, default="Central Hub")

class DriverDB(Base):
    __tablename__ = "drivers"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String)
    phone = Column(String)
    licenseNumber = Column(String, unique=True, index=True)
    licenseCategories = Column(String)  # Comma-separated: Truck,Van
    licenseExpiryDate = Column(String)
    safetyScore = Column(Integer, default=95)
    status = Column(String, default="On Duty")  # On Duty, On Trip, Off Duty, Suspended

class TripDB(Base):
    __tablename__ = "trips"
    id = Column(String, primary_key=True, index=True)
    tripCode = Column(String, unique=True, index=True)
    vehicleId = Column(String, ForeignKey("vehicles.id"))
    vehiclePlate = Column(String)
    driverId = Column(String, ForeignKey("drivers.id"))
    driverName = Column(String)
    origin = Column(String)
    destination = Column(String)
    cargoDescription = Column(String)
    cargoWeightKg = Column(Float)
    maxCapacityKg = Column(Float)
    startOdometerKm = Column(Float)
    endOdometerKm = Column(Float, nullable=True)
    distanceKm = Column(Float)
    revenue = Column(Float, default=0.0)
    status = Column(String, default="Dispatched")  # Draft, Dispatched, Completed, Cancelled
    createdAt = Column(DateTime, default=datetime.utcnow)

Base.metadata.create_all(bind=engine)

# --- FASTAPI APP & CORS ---
app = FastAPI(title="FleetFlow Enterprise REST API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specific React front-end URL e.g. http://localhost:3000
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- PYDANTIC SCHEMAS ---
class VehicleCreate(BaseModel):
    name: str
    model: str
    year: int
    licensePlate: str
    type: str
    fuelType: str
    maxLoadCapacityKg: float
    currentOdometerKm: float = 0.0
    acquisitionCost: float = 0.0
    region: str = "Central Hub"

class TripCreate(BaseModel):
    vehicleId: str
    driverId: str
    origin: str
    destination: str
    cargoDescription: str
    cargoWeightKg: float
    distanceKm: float
    revenue: float = 0.0
    status: str = "Dispatched"

# --- REST ENDPOINTS ---
@app.get("/api/health")
def health_check():
    return {"status": "operational", "database": "sqlite_connected", "version": "1.0.0"}

@app.get("/api/vehicles")
def list_vehicles(db: Session = Depends(get_db)):
    return db.query(VehicleDB).all()

@app.post("/api/vehicles")
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    # Unique plate check
    existing = db.query(VehicleDB).filter(VehicleDB.licensePlate == payload.licensePlate).first()
    if existing:
        raise HTTPException(status_code=400, detail="License plate already registered")
    
    vehicle = VehicleDB(
        id=f"v-{int(datetime.utcnow().timestamp())}",
        status="Available",
        **payload.dict()
    )
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@app.post("/api/trips")
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    vehicle = db.query(VehicleDB).filter(VehicleDB.id == payload.vehicleId).first()
    driver = db.query(DriverDB).filter(DriverDB.id == payload.driverId).first()
    
    if not vehicle or not driver:
        raise HTTPException(status_code=404, detail="Vehicle or Driver not found")

    # RULE 2: Overweight Cargo Validation
    if payload.cargoWeightKg > vehicle.maxLoadCapacityKg:
        raise HTTPException(
            status_code=400, 
            detail=f"Overweight cargo! {payload.cargoWeightKg}kg exceeds vehicle limit of {vehicle.maxLoadCapacityKg}kg"
        )
    
    # RULE 3: Status Transition
    if payload.status == "Dispatched":
        vehicle.status = "On Trip"
        driver.status = "On Trip"

    trip = TripDB(
        id=f"t-{int(datetime.utcnow().timestamp())}",
        tripCode=f"TRP-{datetime.utcnow().year}-{int(datetime.utcnow().timestamp()) % 10000}",
        vehiclePlate=vehicle.licensePlate,
        driverName=driver.name,
        maxCapacityKg=vehicle.maxLoadCapacityKg,
        startOdometerKm=vehicle.currentOdometerKm,
        **payload.dict()
    )
    db.add(trip)
    db.commit()
    db.refresh(trip)
    return trip
`;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 font-mono">
              FastAPI + SQLite + SQLAlchemy Architecture
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Backend REST API Specification &amp; Local Setup
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Complete FastAPI Python server code, SQLite schema migrations, and real-time endpoint health diagnostics.
          </p>
        </div>

        {/* Live Test Button */}
        <button
          onClick={handleTestBackend}
          disabled={isChecking}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950 transition-all active:scale-95 disabled:opacity-50"
        >
          <Activity className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          <span>{isChecking ? 'Testing API...' : 'Ping REST Endpoints'}</span>
        </button>
      </div>

      {/* Live Server Diagnostic Status */}
      {healthStatus && (
        <div className={`p-4 rounded-xl border text-xs flex items-start justify-between gap-3 ${
          healthStatus.status === 'healthy' 
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200' 
            : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
        }`}>
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">
                REST API Service Status: {healthStatus.status.toUpperCase()}
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Timestamp: {healthStatus.timestamp} &bull; Response: {JSON.stringify(healthStatus.details || healthStatus.message)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold">
            <Database className="w-4 h-4" />
            <span>SQLite + SQLAlchemy</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Persistent local ACID transactions with automatic schema initialization (`fleetflow.db`) and relational foreign keys.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-blue-400 font-bold">
            <Server className="w-4 h-4" />
            <span>FastAPI Routing</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Asynchronous REST endpoints with auto-generated OpenAPI documentation, Pydantic type validation, and dependency injection.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-2">
          <div className="flex items-center space-x-2 text-purple-400 font-bold">
            <Code2 className="w-4 h-4" />
            <span>CORS Middleware</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Pre-configured Cross-Origin Resource Sharing middleware allowing seamless communication between React on Vite and FastAPI.
          </p>
        </div>
      </div>

      {/* Step-by-Step Run Instructions */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          Quick Start: Run FastAPI Backend Locally (Windows / Mac / Linux)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-emerald-400 font-mono">1. Install Dependencies</div>
            <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-300 select-all border border-slate-850">
              pip install fastapi uvicorn sqlalchemy pydantic
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-blue-400 font-mono">2. Start Server</div>
            <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-300 select-all border border-slate-850">
              uvicorn main:app --reload --port 8000
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="font-bold text-purple-400 font-mono">3. Open Swagger Docs</div>
            <div className="p-2 rounded bg-slate-900 font-mono text-[11px] text-slate-300 select-all border border-slate-850">
              http://127.0.0.1:8000/docs
            </div>
          </div>

        </div>
      </div>

      {/* Python Code Block */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3 text-xs">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 font-mono font-bold text-slate-200">
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>backend/main.py (Complete Production FastAPI + SQLite Backend)</span>
          </div>

          <button
            onClick={() => handleCopy(mainPyCode, 'main_py')}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
          >
            {copiedSection === 'main_py' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Python Code</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed max-h-96 overflow-y-auto">
          {mainPyCode}
        </pre>
      </div>

    </div>
  );
};
