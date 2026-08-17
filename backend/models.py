from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class UserModel(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # manager, dispatcher, safety_officer, financial_analyst
    department = Column(String(100), default="Fleet Operations")
    avatar_url = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class VehicleModel(Base):
    __tablename__ = "vehicles"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    model = Column(String(150), nullable=False)
    license_plate = Column(String(50), unique=True, index=True, nullable=False)
    type = Column(String(20), nullable=False)  # Truck, Van, Bike
    max_load_capacity_kg = Column(Float, nullable=False)
    current_odometer_km = Column(Float, default=0.0)
    acquisition_cost = Column(Float, default=0.0)
    region = Column(String(100), default="Central Hub")
    status = Column(String(30), default="Available")  # Available, On Trip, In Shop, Out of Service
    year = Column(Integer, default=2023)
    fuel_type = Column(String(30), default="Diesel")
    last_service_date = Column(String(30), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    trips = relationship("TripModel", back_populates="vehicle", cascade="all, delete-orphan")
    maintenance_logs = relationship("MaintenanceLogModel", back_populates="vehicle", cascade="all, delete-orphan")
    expenses = relationship("ExpenseLogModel", back_populates="vehicle", cascade="all, delete-orphan")

class DriverModel(Base):
    __tablename__ = "drivers"

    id = Column(String(50), primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    license_number = Column(String(50), unique=True, index=True, nullable=False)
    license_categories = Column(JSON, nullable=False)  # e.g. ["Van", "Truck"]
    license_expiry_date = Column(String(30), nullable=False)  # YYYY-MM-DD
    safety_score = Column(Integer, default=95)  # 0 to 100
    total_trips_completed = Column(Integer, default=0)
    status = Column(String(30), default="On Duty")  # On Duty, Off Duty, Suspended, On Trip
    assigned_vehicle_id = Column(String(50), nullable=True)
    joined_date = Column(String(30), default=lambda: datetime.utcnow().strftime("%Y-%m-%d"))
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    trips = relationship("TripModel", back_populates="driver")

class TripModel(Base):
    __tablename__ = "trips"

    id = Column(String(50), primary_key=True, index=True)
    trip_code = Column(String(50), unique=True, index=True, nullable=False)
    vehicle_id = Column(String(50), ForeignKey("vehicles.id"), nullable=False)
    vehicle_plate = Column(String(50), nullable=False)
    vehicle_name = Column(String(150), nullable=False)
    driver_id = Column(String(50), ForeignKey("drivers.id"), nullable=False)
    driver_name = Column(String(100), nullable=False)
    origin = Column(String(200), nullable=False)
    destination = Column(String(200), nullable=False)
    cargo_description = Column(String(255), nullable=False)
    cargo_weight_kg = Column(Float, nullable=False)
    max_capacity_kg = Column(Float, nullable=False)
    status = Column(String(30), default="Draft")  # Draft, Dispatched, Completed, Cancelled
    start_odometer_km = Column(Float, default=0.0)
    end_odometer_km = Column(Float, nullable=True)
    distance_km = Column(Float, default=0.0)
    estimated_hours = Column(Float, default=2.0)
    revenue = Column(Float, default=0.0)
    dispatched_at = Column(String(50), nullable=True)
    completed_at = Column(String(50), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("VehicleModel", back_populates="trips")
    driver = relationship("DriverModel", back_populates="trips")

class MaintenanceLogModel(Base):
    __tablename__ = "maintenance_logs"

    id = Column(String(50), primary_key=True, index=True)
    vehicle_id = Column(String(50), ForeignKey("vehicles.id"), nullable=False)
    vehicle_plate = Column(String(50), nullable=False)
    vehicle_name = Column(String(150), nullable=False)
    service_type = Column(String(100), nullable=False)  # Oil Change, Brake Replacement, etc.
    service_date = Column(String(30), nullable=False)
    completion_date = Column(String(30), nullable=True)
    cost = Column(Float, nullable=False)
    service_provider = Column(String(150), default="Fleet Care")
    odometer_at_service = Column(Float, default=0.0)
    priority = Column(String(20), default="Medium")
    status = Column(String(30), default="In Progress")  # In Progress, Completed, Scheduled
    description = Column(Text, nullable=True)
    performed_by = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("VehicleModel", back_populates="maintenance_logs")

class ExpenseLogModel(Base):
    __tablename__ = "expenses"

    id = Column(String(50), primary_key=True, index=True)
    vehicle_id = Column(String(50), ForeignKey("vehicles.id"), nullable=False)
    vehicle_plate = Column(String(50), nullable=False)
    vehicle_name = Column(String(150), nullable=False)
    trip_id = Column(String(50), nullable=True)
    category = Column(String(50), nullable=False)  # Fuel, Toll, Maintenance, Allowance
    date = Column(String(30), nullable=False)
    amount = Column(Float, nullable=False)
    liters = Column(Float, nullable=True)
    cost_per_liter = Column(Float, nullable=True)
    odometer_km = Column(Float, nullable=True)
    vendor = Column(String(150), nullable=True)
    receipt_number = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    vehicle = relationship("VehicleModel", back_populates="expenses")
