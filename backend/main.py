"""
FleetFlow Enterprise REST API
Backend: Python with FastAPI
Database: SQLite with SQLAlchemy ORM
"""

from fastapi import FastAPI, HTTPException, Depends, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, Integer, Float, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

# --- DATABASE SETUP (SQLite) ---
DATABASE_URL = "sqlite:///./fleetflow.db"
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- DATABASE MODELS ---
class VehicleDB(Base):
    __tablename__ = "vehicles"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    model = Column(String, nullable=False)
    year = Column(Integer, default=2024)
    licensePlate = Column(String, unique=True, index=True, nullable=False)
    type = Column(String, default="Van")  # Truck, Van, Bike, Car, Trailer
    fuelType = Column(String, default="Diesel")  # Diesel, Petrol, Electric, Hybrid
    maxLoadCapacityKg = Column(Float, nullable=False)
    currentOdometerKm = Column(Float, default=0.0)
    acquisitionCost = Column(Float, default=0.0)
    status = Column(String, default="Available")  # Available, On Trip, In Shop, Retired
    region = Column(String, default="Central Hub")
    lastServiceDate = Column(String, nullable=True)

class DriverDB(Base):
    __tablename__ = "drivers"
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False)
    phone = Column(String, default="+1 (555) 000-0000")
    licenseNumber = Column(String, unique=True, index=True, nullable=False)
    licenseCategories = Column(String, default="Truck,Van")  # Comma-separated
    licenseExpiryDate = Column(String, nullable=False)
    safetyScore = Column(Integer, default=95)
    status = Column(String, default="On Duty")  # On Duty, On Trip, Off Duty, Suspended
    totalTripsCompleted = Column(Integer, default=0)
    notes = Column(String, nullable=True)

class TripDB(Base):
    __tablename__ = "trips"
    id = Column(String, primary_key=True, index=True)
    tripCode = Column(String, unique=True, index=True, nullable=False)
    vehicleId = Column(String, ForeignKey("vehicles.id"), nullable=False)
    vehiclePlate = Column(String, nullable=False)
    driverId = Column(String, ForeignKey("drivers.id"), nullable=False)
    driverName = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    cargoDescription = Column(String, default="General Freight")
    cargoWeightKg = Column(Float, nullable=False)
    maxCapacityKg = Column(Float, nullable=False)
    startOdometerKm = Column(Float, default=0.0)
    endOdometerKm = Column(Float, nullable=True)
    distanceKm = Column(Float, default=100.0)
    revenue = Column(Float, default=0.0)
    status = Column(String, default="Dispatched")  # Draft, Dispatched, Completed, Cancelled
    notes = Column(String, nullable=True)
    createdAt = Column(String, default=lambda: datetime.utcnow().isoformat())
    completedAt = Column(String, nullable=True)

class MaintenanceDB(Base):
    __tablename__ = "maintenance_logs"
    id = Column(String, primary_key=True, index=True)
    vehicleId = Column(String, ForeignKey("vehicles.id"), nullable=False)
    vehiclePlate = Column(String, nullable=False)
    serviceType = Column(String, nullable=False)
    serviceDate = Column(String, nullable=False)
    cost = Column(Float, default=0.0)
    serviceProvider = Column(String, default="Internal Fleet Shop")
    odometerAtService = Column(Float, default=0.0)
    status = Column(String, default="In Progress")  # In Progress, Completed
    priority = Column(String, default="Medium")  # Low, Medium, High, Critical
    description = Column(String, nullable=True)
    performedBy = Column(String, default="Lead Tech")
    invoiceNumber = Column(String, nullable=True)

class ExpenseDB(Base):
    __tablename__ = "expenses"
    id = Column(String, primary_key=True, index=True)
    vehicleId = Column(String, ForeignKey("vehicles.id"), nullable=False)
    vehiclePlate = Column(String, nullable=False)
    category = Column(String, default="Fuel")  # Fuel, Toll, Maintenance, Insurance, Other
    date = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    liters = Column(Float, nullable=True)
    costPerLiter = Column(Float, nullable=True)
    odometerKm = Column(Float, nullable=True)
    vendor = Column(String, default="Merchant")
    receiptNumber = Column(String, nullable=True)
    notes = Column(String, nullable=True)

# Create tables in SQLite
Base.metadata.create_all(bind=engine)

# --- FASTAPI APP & CORS ---
app = FastAPI(
    title="FleetFlow Enterprise Dispatch & Asset Management API",
    description="Production REST API for vehicle registry, trip dispatching with weight constraints, maintenance work orders, fuel tracking, and ROI analytics.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    year: int = 2024
    licensePlate: str
    type: str = "Van"
    fuelType: str = "Diesel"
    maxLoadCapacityKg: float
    currentOdometerKm: float = 0.0
    acquisitionCost: float = 50000.0
    region: str = "Central Hub"

class TripCreate(BaseModel):
    vehicleId: str
    driverId: str
    origin: str
    destination: str
    cargoDescription: str = "General Cargo"
    cargoWeightKg: float
    distanceKm: float = 100.0
    revenue: float = 500.0
    status: str = "Dispatched"
    notes: Optional[str] = None

class CompleteTripRequest(BaseModel):
    finalOdometerKm: float
    revenue: Optional[float] = None
    notes: Optional[str] = None

# --- ENDPOINTS ---
@app.get("/api/health")
def health_check():
    return {
        "status": "operational",
        "database": "sqlite_connected",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/vehicles")
def get_vehicles(db: Session = Depends(get_db)):
    return db.query(VehicleDB).all()

@app.post("/api/vehicles", status_code=status.HTTP_201_CREATED)
def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    existing = db.query(VehicleDB).filter(VehicleDB.licensePlate == payload.licensePlate.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle with this license plate already exists")
    
    vehicle = VehicleDB(
        id=f"v-{int(datetime.utcnow().timestamp())}",
        status="Available",
        **payload.dict()
    )
    vehicle.licensePlate = vehicle.licensePlate.upper()
    db.add(vehicle)
    db.commit()
    db.refresh(vehicle)
    return vehicle

@app.post("/api/trips", status_code=status.HTTP_201_CREATED)
def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    vehicle = db.query(VehicleDB).filter(VehicleDB.id == payload.vehicleId).first()
    driver = db.query(DriverDB).filter(DriverDB.id == payload.driverId).first()
    
    if not vehicle or not driver:
        raise HTTPException(status_code=404, detail="Vehicle or Driver not found")

    # RULE 2: Cargo Weight Validation
    if payload.cargoWeightKg > vehicle.maxLoadCapacityKg:
        raise HTTPException(
            status_code=400, 
            detail=f"Cargo weight ({payload.cargoWeightKg}kg) exceeds vehicle capacity ({vehicle.maxLoadCapacityKg}kg)"
        )

    # RULE 3: Status Transition on Dispatch
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

@app.put("/api/trips/{trip_id}/complete")
def complete_trip(trip_id: str, payload: CompleteTripRequest, db: Session = Depends(get_db)):
    trip = db.query(TripDB).filter(TripDB.id == trip_id).first()
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    vehicle = db.query(VehicleDB).filter(VehicleDB.id == trip.vehicleId).first()
    driver = db.query(DriverDB).filter(DriverDB.id == trip.driverId).first()

    # RULE 4: Update Vehicle Odometer & Reset Statuses
    if vehicle:
        vehicle.currentOdometerKm = payload.finalOdometerKm
        vehicle.status = "Available"
    if driver:
        driver.status = "On Duty"
        driver.totalTripsCompleted += 1

    trip.status = "Completed"
    trip.endOdometerKm = payload.finalOdometerKm
    if payload.revenue is not None:
        trip.revenue = payload.revenue
    if payload.notes:
        trip.notes = payload.notes
    trip.completedAt = datetime.utcnow().isoformat()

    db.commit()
    db.refresh(trip)
    return trip
