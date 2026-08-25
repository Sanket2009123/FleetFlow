from pydantic import BaseModel, Field
from typing import List, Optional

# User Schemas
class UserBase(BaseModel):
    name: str
    email: str
    role: str
    department: Optional[str] = "Fleet Operations"
    avatar_url: Optional[str] = None

class UserResponse(UserBase):
    id: str

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None

# Vehicle Schemas
class VehicleCreate(BaseModel):
    name: str
    model: Optional[str] = None
    license_plate: str
    type: str  # Truck, Van, Bike
    max_load_capacity_kg: float
    current_odometer_km: Optional[float] = 0.0
    acquisition_cost: Optional[float] = 35000.0
    region: Optional[str] = "Central Hub"
    year: Optional[int] = 2023
    fuel_type: Optional[str] = "Diesel"
    notes: Optional[str] = None

class VehicleUpdate(BaseModel):
    name: Optional[str] = None
    model: Optional[str] = None
    license_plate: Optional[str] = None
    type: Optional[str] = None
    max_load_capacity_kg: Optional[float] = None
    current_odometer_km: Optional[float] = None
    acquisition_cost: Optional[float] = None
    region: Optional[str] = None
    status: Optional[str] = None
    year: Optional[int] = None
    fuel_type: Optional[str] = None
    notes: Optional[str] = None

class VehicleResponse(BaseModel):
    id: str
    name: str
    model: str
    license_plate: str
    type: str
    max_load_capacity_kg: float
    current_odometer_km: float
    acquisition_cost: float
    region: str
    status: str
    year: int
    fuel_type: str
    last_service_date: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Driver Schemas
class DriverCreate(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = "+1 (555) 000-0000"
    license_number: str
    license_categories: List[str] = ["Van"]
    license_expiry_date: str  # YYYY-MM-DD
    safety_score: Optional[int] = 95
    notes: Optional[str] = None

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    license_number: Optional[str] = None
    license_categories: Optional[List[str]] = None
    license_expiry_date: Optional[str] = None
    safety_score: Optional[int] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class DriverResponse(BaseModel):
    id: str
    name: str
    email: str
    phone: Optional[str]
    license_number: str
    license_categories: List[str]
    license_expiry_date: str
    safety_score: int
    total_trips_completed: int
    status: str
    assigned_vehicle_id: Optional[str] = None
    joined_date: str
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Trip Schemas
class TripCreate(BaseModel):
    vehicle_id: str
    driver_id: str
    origin: str
    destination: str
    cargo_description: str
    cargo_weight_kg: float
    estimated_hours: Optional[float] = 2.5
    distance_km: Optional[float] = 120.0
    revenue: Optional[float] = 600.0
    notes: Optional[str] = None
    auto_dispatch: Optional[bool] = False

class TripComplete(BaseModel):
    final_odometer_km: float
    revenue: Optional[float] = None
    notes: Optional[str] = None

class TripResponse(BaseModel):
    id: str
    trip_code: str
    vehicle_id: str
    vehicle_plate: str
    vehicle_name: str
    driver_id: str
    driver_name: str
    origin: str
    destination: str
    cargo_description: str
    cargo_weight_kg: float
    max_capacity_kg: float
    status: str
    start_odometer_km: float
    end_odometer_km: Optional[float] = None
    distance_km: Optional[float] = None
    estimated_hours: Optional[float] = None
    revenue: float
    dispatched_at: Optional[str] = None
    completed_at: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True

# Maintenance Schemas
class MaintenanceCreate(BaseModel):
    vehicle_id: str
    service_type: str
    service_date: Optional[str] = None
    cost: float
    service_provider: Optional[str] = "Fleet AutoCare"
    odometer_at_service: Optional[float] = None
    priority: Optional[str] = "Medium"
    description: Optional[str] = None
    performed_by: Optional[str] = "Certified Mechanic"
    mark_in_shop: Optional[bool] = True

class MaintenanceResponse(BaseModel):
    id: str
    vehicle_id: str
    vehicle_plate: str
    vehicle_name: str
    service_type: str
    service_date: str
    completion_date: Optional[str] = None
    cost: float
    service_provider: str
    odometer_at_service: float
    priority: str
    status: str
    description: Optional[str] = None
    performed_by: Optional[str] = None

    class Config:
        from_attributes = True

# Expense Schemas
class ExpenseCreate(BaseModel):
    vehicle_id: str
    trip_id: Optional[str] = None
    category: str
    date: Optional[str] = None
    amount: float
    liters: Optional[float] = None
    odometer_km: Optional[float] = None
    vendor: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

class ExpenseResponse(BaseModel):
    id: str
    vehicle_id: str
    vehicle_plate: str
    vehicle_name: str
    trip_id: Optional[str] = None
    category: str
    date: str
    amount: float
    liters: Optional[float] = None
    cost_per_liter: Optional[float] = None
    odometer_km: Optional[float] = None
    vendor: Optional[str] = None
    receipt_number: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True
