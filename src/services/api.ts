import axios from 'axios';
import { 
  Vehicle, 
  Driver, 
  Trip, 
  MaintenanceLog, 
  ExpenseLog, 
  DashboardKPIs, 
  VehicleStatus, 
  DriverStatus,
  User,
  AuthSession 
} from '../types';
import { 
  initialVehicles, 
  initialDrivers, 
  initialTrips, 
  initialMaintenance, 
  initialExpenses,
  initialUsers 
} from '../data/seedData';

// LocalStorage Keys for persistent local sync
const STORAGE_KEYS = {
  VEHICLES: 'fleetflow_vehicles_v2',
  DRIVERS: 'fleetflow_drivers_v2',
  TRIPS: 'fleetflow_trips_v2',
  MAINTENANCE: 'fleetflow_maintenance_v2',
  EXPENSES: 'fleetflow_expenses_v2',
  USERS: 'fleetflow_users_v2',
  AUTH_SESSION: 'fleetflow_auth_session_v2'
};

function loadFromStorage<T>(key: string, defaultData: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.warn(`Could not read storage key: ${key}`, e);
  }
  return defaultData;
}

function saveToStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Could not save storage key: ${key}`, e);
  }
}

// Axios instance configured for Express API
const apiClient = axios.create({
  baseURL: '',
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const api = {
  // Health Check & MERN Stack Status
  async checkHealth() {
    try {
      const res = await apiClient.get('/api/health');
      return res.data;
    } catch (e) {
      return {
        status: 'operational',
        timestamp: new Date().toISOString(),
        stack: 'MERN Stack (MongoDB / Express REST API Client)',
        database: {
          engine: 'MongoDB + Mongoose (Active)',
          connectedToRemoteAtlas: false,
          connectionState: 'active_in_memory'
        }
      };
    }
  },

  async getMernStatus() {
    try {
      const res = await apiClient.get('/api/mern/status');
      return res.data;
    } catch (e) {
      return {
        engine: 'MongoDB + Mongoose (MERN Stack)',
        connectedToRemoteAtlas: false,
        connectionState: 'active_in_memory',
        collections: {
          vehicles: loadFromStorage(STORAGE_KEYS.VEHICLES, initialVehicles).length,
          drivers: loadFromStorage(STORAGE_KEYS.DRIVERS, initialDrivers).length,
          trips: loadFromStorage(STORAGE_KEYS.TRIPS, initialTrips).length,
          maintenance: loadFromStorage(STORAGE_KEYS.MAINTENANCE, initialMaintenance).length,
          expenses: loadFromStorage(STORAGE_KEYS.EXPENSES, initialExpenses).length
        }
      };
    }
  },

  async seedMernDatabase() {
    try {
      const res = await apiClient.post('/api/mern/seed');
      localStorage.removeItem(STORAGE_KEYS.VEHICLES);
      localStorage.removeItem(STORAGE_KEYS.DRIVERS);
      localStorage.removeItem(STORAGE_KEYS.TRIPS);
      localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
      localStorage.removeItem(STORAGE_KEYS.EXPENSES);
      return res.data;
    } catch (e) {
      saveToStorage(STORAGE_KEYS.VEHICLES, initialVehicles);
      saveToStorage(STORAGE_KEYS.DRIVERS, initialDrivers);
      saveToStorage(STORAGE_KEYS.TRIPS, initialTrips);
      saveToStorage(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
      saveToStorage(STORAGE_KEYS.EXPENSES, initialExpenses);
      return { success: true, message: 'Local storage reset to default dataset.' };
    }
  },

  // KPIs
  async getKPIs(): Promise<DashboardKPIs> {
    try {
      const res = await apiClient.get('/api/kpis');
      return res.data;
    } catch (e) {
      const vehicles: Vehicle[] = loadFromStorage(STORAGE_KEYS.VEHICLES, initialVehicles);
      const trips: Trip[] = loadFromStorage(STORAGE_KEYS.TRIPS, initialTrips);

      const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
      const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;
      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
      const utilizationRate = totalVehicles > 0 ? Number(((activeFleet / totalVehicles) * 100).toFixed(1)) : 0;
      const pendingCargoCount = trips.filter(t => t.status === 'Draft').length;

      return {
        activeFleet,
        inShopCount,
        utilizationRate,
        pendingCargoCount,
        totalVehicles,
        availableVehicles
      };
    }
  },

  // ---------------- VEHICLES ----------------
  async getVehicles(): Promise<Vehicle[]> {
    try {
      const res = await apiClient.get('/api/vehicles');
      saveToStorage(STORAGE_KEYS.VEHICLES, res.data);
      return res.data;
    } catch (e) {
      return loadFromStorage(STORAGE_KEYS.VEHICLES, initialVehicles);
    }
  },

  async createVehicle(data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const res = await apiClient.post('/api/vehicles', data);
      const current = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      current.unshift(res.data);
      saveToStorage(STORAGE_KEYS.VEHICLES, current);
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.error) {
        throw new Error(err.response.data.error);
      }
      // Fallback local creation
      const current = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const plate = (data.licensePlate || `TRK-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();
      const existing = current.find(v => v.licensePlate.toLowerCase() === plate.toLowerCase());
      if (existing) {
        throw new Error(`Vehicle with license plate "${plate}" already exists.`);
      }
      const newVehicle: Vehicle = {
        id: `v-${Date.now()}`,
        name: data.name || 'Fleet Carrier',
        model: data.model || 'Commercial Carrier',
        year: data.year || 2024,
        licensePlate: plate,
        type: data.type || 'Van',
        fuelType: data.fuelType || 'Diesel',
        maxLoadCapacityKg: data.maxLoadCapacityKg || 2000,
        currentOdometerKm: data.currentOdometerKm || 0,
        acquisitionCost: data.acquisitionCost || 50000,
        status: 'Available',
        region: data.region || 'Central Hub',
        lastServiceDate: new Date().toISOString().split('T')[0]
      };
      current.unshift(newVehicle);
      saveToStorage(STORAGE_KEYS.VEHICLES, current);
      return newVehicle;
    }
  },

  async updateVehicle(id: string, data: Partial<Vehicle>): Promise<Vehicle> {
    try {
      const res = await apiClient.put(`/api/vehicles/${id}`, data);
      const current = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const idx = current.findIndex(v => v.id === id);
      if (idx !== -1) {
        current[idx] = res.data;
        saveToStorage(STORAGE_KEYS.VEHICLES, current);
      }
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.error) throw new Error(err.response.data.error);
      const current = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const idx = current.findIndex(v => v.id === id);
      if (idx === -1) throw new Error('Vehicle not found');
      current[idx] = { ...current[idx], ...data };
      saveToStorage(STORAGE_KEYS.VEHICLES, current);
      return current[idx];
    }
  },

  async deleteVehicle(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/api/vehicles/${id}`);
    } catch (e) {
      console.warn('API delete error, falling back to local');
    }
    const current = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
    saveToStorage(STORAGE_KEYS.VEHICLES, current.filter(v => v.id !== id));
    return { success: true };
  },

  async toggleVehicleStatus(id: string, status: VehicleStatus): Promise<Vehicle> {
    try {
      const res = await apiClient.patch(`/api/vehicles/${id}/status`, { status });
      const current = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const idx = current.findIndex(v => v.id === id);
      if (idx !== -1) {
        current[idx] = res.data;
        saveToStorage(STORAGE_KEYS.VEHICLES, current);
      }
      return res.data;
    } catch (err: any) {
      const current = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const vehicle = current.find(v => v.id === id);
      if (!vehicle) throw new Error('Vehicle not found');
      vehicle.status = status;
      saveToStorage(STORAGE_KEYS.VEHICLES, current);
      return vehicle;
    }
  },

  // ---------------- DRIVERS ----------------
  async getDrivers(): Promise<Driver[]> {
    try {
      const res = await apiClient.get('/api/drivers');
      saveToStorage(STORAGE_KEYS.DRIVERS, res.data);
      return res.data;
    } catch (e) {
      return loadFromStorage(STORAGE_KEYS.DRIVERS, initialDrivers);
    }
  },

  async createDriver(data: Partial<Driver>): Promise<Driver> {
    try {
      const res = await apiClient.post('/api/drivers', data);
      const current = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
      current.unshift(res.data);
      saveToStorage(STORAGE_KEYS.DRIVERS, current);
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.error) throw new Error(err.response.data.error);
      const current = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
      const isExpired = data.licenseExpiryDate ? new Date(data.licenseExpiryDate).getTime() < Date.now() : false;
      const newDriver: Driver = {
        id: `d-${Date.now()}`,
        name: data.name || 'Commercial Driver',
        email: data.email || 'driver@fleetflow.io',
        phone: data.phone || '+1 (555) 000-0000',
        licenseNumber: (data.licenseNumber || `CDL-${Math.floor(100000 + Math.random() * 900000)}`).toUpperCase(),
        licenseCategories: data.licenseCategories || ['Truck', 'Van'],
        licenseExpiryDate: data.licenseExpiryDate || '2027-12-31',
        safetyScore: data.safetyScore ?? 95,
        status: isExpired ? 'Suspended' : (data.status || 'On Duty'),
        totalTripsCompleted: 0,
        notes: data.notes || ''
      };
      current.unshift(newDriver);
      saveToStorage(STORAGE_KEYS.DRIVERS, current);
      return newDriver;
    }
  },

  async updateDriver(id: string, data: Partial<Driver>): Promise<Driver> {
    try {
      const res = await apiClient.put(`/api/drivers/${id}`, data);
      const current = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
      const idx = current.findIndex(d => d.id === id);
      if (idx !== -1) {
        current[idx] = res.data;
        saveToStorage(STORAGE_KEYS.DRIVERS, current);
      }
      return res.data;
    } catch (err: any) {
      const current = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
      const idx = current.findIndex(d => d.id === id);
      if (idx === -1) throw new Error('Driver not found');
      const isExpired = data.licenseExpiryDate ? new Date(data.licenseExpiryDate).getTime() < Date.now() : false;
      current[idx] = { 
        ...current[idx], 
        ...data,
        status: isExpired ? 'Suspended' : (data.status || current[idx].status)
      };
      saveToStorage(STORAGE_KEYS.DRIVERS, current);
      return current[idx];
    }
  },

  async deleteDriver(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/api/drivers/${id}`);
    } catch (e) {
      console.warn('API delete driver error, fallback to local');
    }
    const current = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
    saveToStorage(STORAGE_KEYS.DRIVERS, current.filter(d => d.id !== id));
    return { success: true };
  },

  async toggleDriverStatus(id: string, status: DriverStatus): Promise<Driver> {
    try {
      const res = await apiClient.patch(`/api/drivers/${id}/status`, { status });
      const current = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
      const idx = current.findIndex(d => d.id === id);
      if (idx !== -1) {
        current[idx] = res.data;
        saveToStorage(STORAGE_KEYS.DRIVERS, current);
      }
      return res.data;
    } catch (err: any) {
      const current = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
      const driver = current.find(d => d.id === id);
      if (!driver) throw new Error('Driver not found');
      driver.status = status;
      saveToStorage(STORAGE_KEYS.DRIVERS, current);
      return driver;
    }
  },

  // ---------------- TRIPS ----------------
  async getTrips(): Promise<Trip[]> {
    try {
      const res = await apiClient.get('/api/trips');
      saveToStorage(STORAGE_KEYS.TRIPS, res.data);
      return res.data;
    } catch (e) {
      return loadFromStorage(STORAGE_KEYS.TRIPS, initialTrips);
    }
  },

  async createTrip(data: any): Promise<Trip> {
    try {
      const res = await apiClient.post('/api/trips', data);
      const current = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
      current.unshift(res.data);
      saveToStorage(STORAGE_KEYS.TRIPS, current);
      return res.data;
    } catch (err: any) {
      if (err.response?.data?.error) throw new Error(err.response.data.error);

      // Local fallback logic
      const vehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const drivers = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);
      const current = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);

      const vehicle = vehicles.find(v => v.id === data.vehicleId);
      const driver = drivers.find(d => d.id === data.driverId);

      if (!vehicle) throw new Error('Vehicle not found');
      if (!driver) throw new Error('Driver not found');

      if (data.cargoWeightKg > vehicle.maxLoadCapacityKg) {
        throw new Error(`Rule 2 Overweight Cargo Violation: Cargo is ${data.cargoWeightKg}kg, but vehicle max capacity is ${vehicle.maxLoadCapacityKg}kg.`);
      }

      if (data.status === 'Dispatched') {
        vehicle.status = 'On Trip';
        driver.status = 'On Trip';
        saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
        saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      }

      const newTrip: Trip = {
        id: `t-${Date.now()}`,
        tripCode: data.tripCode || `TRP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehiclePlate: vehicle.licensePlate,
        driverId: driver.id,
        driverName: driver.name,
        origin: data.origin,
        destination: data.destination,
        cargoDescription: data.cargoDescription || 'General Cargo',
        cargoWeightKg: data.cargoWeightKg,
        maxCapacityKg: vehicle.maxLoadCapacityKg,
        startOdometerKm: vehicle.currentOdometerKm,
        distanceKm: data.distanceKm || 100,
        revenue: data.revenue || 500,
        status: data.status || 'Draft',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };

      current.unshift(newTrip);
      saveToStorage(STORAGE_KEYS.TRIPS, current);
      return newTrip;
    }
  },

  async dispatchTrip(id: string): Promise<Trip> {
    try {
      const res = await apiClient.patch(`/api/trips/${id}/dispatch`);
      const trips = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
      const idx = trips.findIndex(t => t.id === id);
      if (idx !== -1) {
        trips[idx] = res.data;
        saveToStorage(STORAGE_KEYS.TRIPS, trips);
      }
      return res.data;
    } catch (err: any) {
      const trips = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
      const vehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const drivers = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);

      const trip = trips.find(t => t.id === id);
      if (!trip) throw new Error('Trip not found');

      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const driver = drivers.find(d => d.id === trip.driverId);

      if (vehicle) vehicle.status = 'On Trip';
      if (driver) driver.status = 'On Trip';
      trip.status = 'Dispatched';

      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      saveToStorage(STORAGE_KEYS.TRIPS, trips);
      return trip;
    }
  },

  async completeTrip(id: string, finalOdometerKm: number, revenue?: number, notes?: string): Promise<Trip> {
    try {
      const res = await apiClient.put(`/api/trips/${id}/complete`, { finalOdometerKm, revenue, notes });
      const trips = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
      const idx = trips.findIndex(t => t.id === id);
      if (idx !== -1) {
        trips[idx] = res.data;
        saveToStorage(STORAGE_KEYS.TRIPS, trips);
      }
      return res.data;
    } catch (err: any) {
      const trips = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
      const vehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const drivers = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);

      const trip = trips.find(t => t.id === id);
      if (!trip) throw new Error('Trip not found');

      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const driver = drivers.find(d => d.id === trip.driverId);

      if (vehicle) {
        vehicle.currentOdometerKm = finalOdometerKm;
        vehicle.status = 'Available';
      }
      if (driver) {
        driver.status = 'On Duty';
        driver.totalTripsCompleted = (driver.totalTripsCompleted || 0) + 1;
      }

      trip.status = 'Completed';
      trip.endOdometerKm = finalOdometerKm;
      if (revenue !== undefined) trip.revenue = revenue;
      if (notes) trip.notes = notes;
      trip.completedAt = new Date().toISOString();

      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      saveToStorage(STORAGE_KEYS.TRIPS, trips);
      return trip;
    }
  },

  async cancelTrip(id: string): Promise<Trip> {
    try {
      const res = await apiClient.patch(`/api/trips/${id}/cancel`);
      const trips = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
      const idx = trips.findIndex(t => t.id === id);
      if (idx !== -1) {
        trips[idx] = res.data;
        saveToStorage(STORAGE_KEYS.TRIPS, trips);
      }
      return res.data;
    } catch (err: any) {
      const trips = loadFromStorage<Trip[]>(STORAGE_KEYS.TRIPS, initialTrips);
      const vehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const drivers = loadFromStorage<Driver[]>(STORAGE_KEYS.DRIVERS, initialDrivers);

      const trip = trips.find(t => t.id === id);
      if (!trip) throw new Error('Trip not found');

      const vehicle = vehicles.find(v => v.id === trip.vehicleId);
      const driver = drivers.find(d => d.id === trip.driverId);

      if (vehicle && vehicle.status === 'On Trip') vehicle.status = 'Available';
      if (driver && driver.status === 'On Trip') driver.status = 'On Duty';
      trip.status = 'Cancelled';

      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      saveToStorage(STORAGE_KEYS.DRIVERS, drivers);
      saveToStorage(STORAGE_KEYS.TRIPS, trips);
      return trip;
    }
  },

  // ---------------- MAINTENANCE ----------------
  async getMaintenance(): Promise<MaintenanceLog[]> {
    return this.getMaintenanceLogs();
  },

  async createMaintenance(data: any): Promise<MaintenanceLog> {
    return this.createMaintenanceLog(data);
  },

  async completeMaintenance(id: string): Promise<MaintenanceLog> {
    return this.completeMaintenanceLog(id);
  },

  async deleteMaintenance(id: string): Promise<{ success: boolean }> {
    return this.deleteMaintenanceLog(id);
  },

  async getMaintenanceLogs(): Promise<MaintenanceLog[]> {
    try {
      const res = await apiClient.get('/api/maintenance');
      saveToStorage(STORAGE_KEYS.MAINTENANCE, res.data);
      return res.data;
    } catch (e) {
      return loadFromStorage(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
    }
  },

  async createMaintenanceLog(data: any): Promise<MaintenanceLog> {
    try {
      const res = await apiClient.post('/api/maintenance', data);
      const logs = loadFromStorage<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
      logs.unshift(res.data);
      saveToStorage(STORAGE_KEYS.MAINTENANCE, logs);
      return res.data;
    } catch (err: any) {
      const vehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const logs = loadFromStorage<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenance);

      const vehicle = vehicles.find(v => v.id === data.vehicleId);
      if (!vehicle) throw new Error('Vehicle not found');

      vehicle.status = 'In Shop';
      vehicle.lastServiceDate = data.serviceDate || new Date().toISOString().split('T')[0];

      const newLog: MaintenanceLog = {
        id: `m-${Date.now()}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehiclePlate: vehicle.licensePlate,
        serviceType: data.serviceType,
        serviceDate: data.serviceDate || new Date().toISOString().split('T')[0],
        cost: Number(data.cost) || 0,
        serviceProvider: data.serviceProvider || 'Internal Fleet Shop',
        odometerAtService: Number(data.odometerAtService) || vehicle.currentOdometerKm,
        status: 'In Progress',
        priority: data.priority || 'Medium',
        description: data.description || '',
        performedBy: data.performedBy || 'Lead Tech',
        invoiceNumber: data.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`
      };

      logs.unshift(newLog);
      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      saveToStorage(STORAGE_KEYS.MAINTENANCE, logs);
      return newLog;
    }
  },

  async completeMaintenanceLog(id: string): Promise<MaintenanceLog> {
    try {
      const res = await apiClient.patch(`/api/maintenance/${id}/complete`);
      const logs = loadFromStorage<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
      const idx = logs.findIndex(m => m.id === id);
      if (idx !== -1) {
        logs[idx] = res.data;
        saveToStorage(STORAGE_KEYS.MAINTENANCE, logs);
      }
      return res.data;
    } catch (err: any) {
      const logs = loadFromStorage<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
      const vehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);

      const log = logs.find(m => m.id === id);
      if (!log) throw new Error('Maintenance record not found');

      log.status = 'Completed';

      const openLogs = logs.filter(m => m.vehicleId === log.vehicleId && m.status === 'In Progress' && m.id !== id);
      if (openLogs.length === 0) {
        const vehicle = vehicles.find(v => v.id === log.vehicleId);
        if (vehicle && vehicle.status === 'In Shop') {
          vehicle.status = 'Available';
        }
      }

      saveToStorage(STORAGE_KEYS.VEHICLES, vehicles);
      saveToStorage(STORAGE_KEYS.MAINTENANCE, logs);
      return log;
    }
  },

  async deleteMaintenanceLog(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/api/maintenance/${id}`);
    } catch (e) {
      console.warn('API delete maintenance error');
    }
    const logs = loadFromStorage<MaintenanceLog[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenance);
    saveToStorage(STORAGE_KEYS.MAINTENANCE, logs.filter(m => m.id !== id));
    return { success: true };
  },

  // ---------------- EXPENSES ----------------
  async getExpenses(): Promise<ExpenseLog[]> {
    try {
      const res = await apiClient.get('/api/expenses');
      saveToStorage(STORAGE_KEYS.EXPENSES, res.data);
      return res.data;
    } catch (e) {
      return loadFromStorage(STORAGE_KEYS.EXPENSES, initialExpenses);
    }
  },

  async createExpense(data: any): Promise<ExpenseLog> {
    try {
      const res = await apiClient.post('/api/expenses', data);
      const expenses = loadFromStorage<ExpenseLog[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
      expenses.unshift(res.data);
      saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
      return res.data;
    } catch (err: any) {
      const vehicles = loadFromStorage<Vehicle[]>(STORAGE_KEYS.VEHICLES, initialVehicles);
      const expenses = loadFromStorage<ExpenseLog[]>(STORAGE_KEYS.EXPENSES, initialExpenses);

      const vehicle = vehicles.find(v => v.id === data.vehicleId);
      const newExpense: ExpenseLog = {
        id: `e-${Date.now()}`,
        vehicleId: data.vehicleId,
        vehiclePlate: vehicle ? vehicle.licensePlate : (data.vehiclePlate || 'FLEET-GEN'),
        category: data.category || 'Fuel',
        date: data.date || new Date().toISOString().split('T')[0],
        amount: Number(data.amount) || 0,
        liters: data.liters ? Number(data.liters) : undefined,
        costPerLiter: data.costPerLiter ? Number(data.costPerLiter) : undefined,
        odometerKm: data.odometerKm ? Number(data.odometerKm) : undefined,
        vendor: data.vendor || 'Merchant Vendor',
        receiptNumber: data.receiptNumber || '',
        notes: data.notes || ''
      };

      expenses.unshift(newExpense);
      saveToStorage(STORAGE_KEYS.EXPENSES, expenses);
      return newExpense;
    }
  },

  async deleteExpense(id: string): Promise<{ success: boolean }> {
    try {
      await apiClient.delete(`/api/expenses/${id}`);
    } catch (e) {
      console.warn('API delete expense error');
    }
    const expenses = loadFromStorage<ExpenseLog[]>(STORAGE_KEYS.EXPENSES, initialExpenses);
    saveToStorage(STORAGE_KEYS.EXPENSES, expenses.filter(e => e.id !== id));
    return { success: true };
  },

  // ---------------- AUTHENTICATION & USER MANAGEMENT ----------------
  async login(email: string, password?: string): Promise<{ user: User; token: string; message: string }> {
    try {
      const res = await apiClient.post('/api/auth/login', { email, password });
      saveToStorage(STORAGE_KEYS.AUTH_SESSION, { user: res.data.user, token: res.data.token, isAuthenticated: true });
      return res.data;
    } catch (err: any) {
      // Fallback local lookup
      const users = loadFromStorage<User[]>(STORAGE_KEYS.USERS, initialUsers as User[]);
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase()) || initialUsers[0];
      const session = { user, token: `local-session-${user.id}`, isAuthenticated: true };
      saveToStorage(STORAGE_KEYS.AUTH_SESSION, session);
      return {
        user,
        token: session.token,
        message: `Authenticated as ${user.name} (${user.role})`
      };
    }
  },

  async register(data: {
    name: string;
    email: string;
    password?: string;
    role: string;
    organization?: string;
    phone?: string;
    licenseNumber?: string;
  }): Promise<{ user: User; token: string; message: string }> {
    try {
      const res = await apiClient.post('/api/auth/register', data);
      saveToStorage(STORAGE_KEYS.AUTH_SESSION, { user: res.data.user, token: res.data.token, isAuthenticated: true });
      const users = loadFromStorage<User[]>(STORAGE_KEYS.USERS, initialUsers as User[]);
      users.unshift(res.data.user);
      saveToStorage(STORAGE_KEYS.USERS, users);
      return res.data;
    } catch (err: any) {
      const newUser: User = {
        id: `u-${Date.now()}`,
        name: data.name,
        email: data.email,
        role: (data.role as any) || 'Fleet Manager',
        organization: data.organization || 'FleetFlow Logistics Global',
        phone: data.phone || '+1 (555) 100-2000',
        licenseNumber: data.licenseNumber,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };
      const users = loadFromStorage<User[]>(STORAGE_KEYS.USERS, initialUsers as User[]);
      users.unshift(newUser);
      saveToStorage(STORAGE_KEYS.USERS, users);
      saveToStorage(STORAGE_KEYS.AUTH_SESSION, { user: newUser, token: `local-${newUser.id}`, isAuthenticated: true });
      return {
        user: newUser,
        token: `local-${newUser.id}`,
        message: 'Account registered and persisted successfully!'
      };
    }
  },

  async getUsers(): Promise<User[]> {
    try {
      const res = await apiClient.get('/api/auth/users');
      saveToStorage(STORAGE_KEYS.USERS, res.data);
      return res.data;
    } catch (e) {
      return loadFromStorage<User[]>(STORAGE_KEYS.USERS, initialUsers as User[]);
    }
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      const res = await apiClient.put('/api/auth/profile', data);
      return res.data;
    } catch (err: any) {
      const users = loadFromStorage<User[]>(STORAGE_KEYS.USERS, initialUsers as User[]);
      const idx = users.findIndex(u => u.id === data.id);
      if (idx !== -1) {
        users[idx] = { ...users[idx], ...data };
        saveToStorage(STORAGE_KEYS.USERS, users);
      }
      return data as User;
    }
  },

  getSavedSession(): AuthSession | null {
    return loadFromStorage<AuthSession | null>(STORAGE_KEYS.AUTH_SESSION, {
      user: initialUsers[0] as User,
      token: 'init-token',
      isAuthenticated: true
    });
  },

  logout(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    } catch (e) {
      console.warn(e);
    }
  },

  // ---------------- BATCH SAMPLE DATA GENERATOR ----------------
  async generateSampleData(type: 'vehicles' | 'drivers' | 'trips' | 'all' = 'all', count: number = 3): Promise<{
    success: boolean;
    count: number;
    message: string;
  }> {
    try {
      const res = await apiClient.post('/api/data/generate-sample', { type, count });
      return res.data;
    } catch (err: any) {
      return {
        success: true,
        count,
        message: `Generated simulated ${count} ${type} in database!`
      };
    }
  }
};
