export type VehicleType = 'Truck' | 'Van' | 'Bike' | 'Car' | 'Trailer';
export type FuelType = 'Diesel' | 'Petrol' | 'Electric' | 'Hybrid' | 'CNG';
export type VehicleStatus = 'Available' | 'On Trip' | 'In Shop' | 'Retired';

export type DriverStatus = 'On Duty' | 'On Trip' | 'Off Duty' | 'Suspended';
export type TripStatus = 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';

export type MaintenanceStatus = 'In Progress' | 'Completed' | 'Scheduled' | 'Cancelled';
export type MaintenancePriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type ExpenseCategory = 'Fuel' | 'Toll' | 'Maintenance' | 'Insurance' | 'Registration' | 'Other';

export type UserRole = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  organization?: string;
  licenseNumber?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface AuthSession {
  user: User;
  token?: string;
  isAuthenticated: boolean;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  type: VehicleType;
  fuelType: FuelType;
  maxLoadCapacityKg: number;
  currentOdometerKm: number;
  acquisitionCost: number;
  status: VehicleStatus;
  region: string;
  imageUrl?: string;
  assignedDriverId?: string;
  lastServiceDate?: string;
  nextServiceOdometerKm?: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseCategories: VehicleType[];
  licenseExpiryDate: string;
  safetyScore: number; // 0 - 100
  status: DriverStatus;
  totalTripsCompleted: number;
  avatarUrl?: string;
  notes?: string;
}

export interface Trip {
  id: string;
  tripCode: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  driverId: string;
  driverName: string;
  origin: string;
  destination: string;
  cargoDescription: string;
  cargoWeightKg: number;
  maxCapacityKg: number;
  startOdometerKm: number;
  endOdometerKm?: number;
  distanceKm: number;
  estimatedHours?: number;
  revenue?: number;
  notes?: string;
  status: TripStatus;
  createdAt: string;
  completedAt?: string;
}

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  serviceType: string;
  serviceDate: string;
  cost: number;
  serviceProvider: string;
  odometerAtService: number;
  status: MaintenanceStatus;
  priority: MaintenancePriority;
  description: string;
  performedBy: string;
  invoiceNumber?: string;
}

export interface ExpenseLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  category: ExpenseCategory;
  date: string;
  amount: number;
  liters?: number;
  costPerLiter?: number;
  odometerKm?: number;
  vendor: string;
  receiptNumber?: string;
  notes?: string;
}

export interface DashboardKPIs {
  activeFleet: number;
  inShopCount: number;
  utilizationRate: number;
  pendingCargoCount: number;
  totalVehicles: number;
  availableVehicles: number;
}
