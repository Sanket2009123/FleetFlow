import { Vehicle, Driver, Trip, MaintenanceLog, ExpenseLog, User } from '../types';

export const initialUsers: (User & { password?: string })[] = [
  {
    id: 'u-1',
    name: 'Marcus Vance',
    email: 'marcus.vance@fleetflow.io',
    role: 'Fleet Manager',
    phone: '+1 (555) 880-1200',
    organization: 'FleetFlow Logistics Global',
    createdAt: '2025-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'u-2',
    name: 'Taylor Reed',
    email: 'taylor.reed@fleetflow.io',
    role: 'Dispatcher',
    phone: '+1 (555) 880-1201',
    organization: 'Northwest Dispatch Division',
    createdAt: '2025-01-05T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'u-3',
    name: 'Diane Foster',
    email: 'diane.foster@fleetflow.io',
    role: 'Safety Officer',
    phone: '+1 (555) 880-1202',
    organization: 'Fleet Compliance & DOT Safety',
    createdAt: '2025-01-10T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'u-4',
    name: 'Julian Sterling',
    email: 'julian.sterling@fleetflow.io',
    role: 'Financial Analyst',
    phone: '+1 (555) 880-1203',
    organization: 'Capital Asset & ROI Operations',
    createdAt: '2025-01-15T00:00:00Z',
    lastLogin: new Date().toISOString()
  }
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'v-1',
    name: 'Freightliner Cascadia Heavy Hauler',
    model: 'Cascadia 126 DD15',
    year: 2023,
    licensePlate: 'TRK-8821-WA',
    type: 'Truck',
    fuelType: 'Diesel',
    maxLoadCapacityKg: 18000,
    currentOdometerKm: 142850,
    acquisitionCost: 145000,
    status: 'On Trip',
    region: 'North Hub',
    lastServiceDate: '2025-01-20',
    nextServiceOdometerKm: 155000
  },
  {
    id: 'v-2',
    name: 'Ford Transit 350 High Roof',
    model: 'Transit 350 AWD Ecoboost',
    year: 2024,
    licensePlate: 'VAN-4412-CA',
    type: 'Van',
    fuelType: 'Diesel',
    maxLoadCapacityKg: 2100,
    currentOdometerKm: 34120,
    acquisitionCost: 56000,
    status: 'Available',
    region: 'Central Hub',
    lastServiceDate: '2025-02-01',
    nextServiceOdometerKm: 45000
  },
  {
    id: 'v-3',
    name: 'Mercedes-Benz Sprinter 2500',
    model: 'Sprinter Cargo 4x4',
    year: 2023,
    licensePlate: 'VAN-7790-NY',
    type: 'Van',
    fuelType: 'Diesel',
    maxLoadCapacityKg: 1950,
    currentOdometerKm: 68900,
    acquisitionCost: 62000,
    status: 'In Shop',
    region: 'East Hub',
    lastServiceDate: '2025-02-16',
    nextServiceOdometerKm: 70000
  },
  {
    id: 'v-4',
    name: 'Urban Arrow Cargo XL Electric',
    model: 'Cargo L-Line Bosch CargoLine',
    year: 2024,
    licensePlate: 'CYC-1099-OR',
    type: 'Bike',
    fuelType: 'Electric',
    maxLoadCapacityKg: 250,
    currentOdometerKm: 4320,
    acquisitionCost: 8200,
    status: 'Available',
    region: 'West Hub',
    lastServiceDate: '2025-01-10',
    nextServiceOdometerKm: 6000
  },
  {
    id: 'v-5',
    name: 'Volvo VNL 860 Sleeper',
    model: 'VNL 860 D13 Turbo',
    year: 2022,
    licensePlate: 'TRK-9011-IL',
    type: 'Truck',
    fuelType: 'Diesel',
    maxLoadCapacityKg: 19500,
    currentOdometerKm: 215400,
    acquisitionCost: 158000,
    status: 'Available',
    region: 'Central Hub',
    lastServiceDate: '2024-12-15',
    nextServiceOdometerKm: 225000
  },
  {
    id: 'v-6',
    name: 'Ram ProMaster 2500 Cargo',
    model: 'ProMaster 2500 High Roof',
    year: 2024,
    licensePlate: 'VAN-3391-TX',
    type: 'Van',
    fuelType: 'Petrol',
    maxLoadCapacityKg: 1800,
    currentOdometerKm: 18500,
    acquisitionCost: 49500,
    status: 'Available',
    region: 'South Hub',
    lastServiceDate: '2025-01-28',
    nextServiceOdometerKm: 30000
  }
];

export const initialDrivers: Driver[] = [
  {
    id: 'd-1',
    name: 'Carlos Hernandez',
    email: 'carlos.h@fleetflow.io',
    phone: '+1 (555) 234-9912',
    licenseNumber: 'CDL-WA-992144',
    licenseCategories: ['Truck', 'Van'],
    licenseExpiryDate: '2027-08-15',
    safetyScore: 98,
    status: 'On Trip',
    totalTripsCompleted: 142,
    notes: 'Certified for hazardous material transport and interstate long-haul.'
  },
  {
    id: 'd-2',
    name: 'Sarah Jenkins',
    email: 'sarah.j@fleetflow.io',
    phone: '+1 (555) 345-8823',
    licenseNumber: 'CDL-CA-441098',
    licenseCategories: ['Van', 'Bike'],
    licenseExpiryDate: '2026-11-30',
    safetyScore: 95,
    status: 'On Duty',
    totalTripsCompleted: 88,
    notes: 'Specialized in urban express distribution and cold chain handling.'
  },
  {
    id: 'd-3',
    name: 'Marcus Brody',
    email: 'marcus.b@fleetflow.io',
    phone: '+1 (555) 456-7734',
    licenseNumber: 'CDL-NY-771233',
    licenseCategories: ['Truck', 'Van'],
    licenseExpiryDate: '2024-01-10', // EXPIRED
    safetyScore: 72,
    status: 'Suspended',
    totalTripsCompleted: 110,
    notes: 'Compliance notice: Commercial driving license expired. Dispatches blocked.'
  },
  {
    id: 'd-4',
    name: 'Elena Rostova',
    email: 'elena.r@fleetflow.io',
    phone: '+1 (555) 567-6645',
    licenseNumber: 'CDL-OR-330912',
    licenseCategories: ['Van', 'Bike'],
    licenseExpiryDate: '2028-03-22',
    safetyScore: 99,
    status: 'On Duty',
    totalTripsCompleted: 64,
    notes: 'Eco-route specialist, top safety rating across northwest district.'
  },
  {
    id: 'd-5',
    name: 'David Kim',
    email: 'david.k@fleetflow.io',
    phone: '+1 (555) 678-5556',
    licenseNumber: 'CDL-IL-112288',
    licenseCategories: ['Truck'],
    licenseExpiryDate: '2027-05-19',
    safetyScore: 92,
    status: 'On Duty',
    totalTripsCompleted: 95,
    notes: 'Heavy machinery transport certification.'
  }
];

export const initialTrips: Trip[] = [
  {
    id: 't-1',
    tripCode: 'TRP-2025-8812',
    vehicleId: 'v-1',
    vehicleName: 'Freightliner Cascadia Heavy Hauler',
    vehiclePlate: 'TRK-8821-WA',
    driverId: 'd-1',
    driverName: 'Carlos Hernandez',
    origin: 'Seattle Regional Distribution Center, Bay 12',
    destination: 'Spokane Commercial Fulfillment Warehouse',
    cargoDescription: 'Heavy Industrial Machinery & Precision Pumps',
    cargoWeightKg: 14200,
    maxCapacityKg: 18000,
    startOdometerKm: 142570,
    distanceKm: 450,
    estimatedHours: 6.5,
    revenue: 3400,
    status: 'Dispatched',
    createdAt: '2025-02-17T08:30:00Z',
    notes: 'Priority interstate heavy haul with GPS real-time telemetry.'
  },
  {
    id: 't-2',
    tripCode: 'TRP-2025-8809',
    vehicleId: 'v-2',
    vehicleName: 'Ford Transit 350 High Roof',
    vehiclePlate: 'VAN-4412-CA',
    driverId: 'd-2',
    driverName: 'Sarah Jenkins',
    origin: 'Sacramento Logistics Depot',
    destination: 'San Francisco Financial District Drop-off',
    cargoDescription: 'Organic Wholesale Espresso & Bakery Goods',
    cargoWeightKg: 850,
    maxCapacityKg: 2100,
    startOdometerKm: 34030,
    endOdometerKm: 34120,
    distanceKm: 90,
    estimatedHours: 2.0,
    revenue: 780,
    status: 'Completed',
    createdAt: '2025-02-16T10:00:00Z',
    notes: 'Signed off on time with 0 damage incidents.'
  },
  {
    id: 't-3',
    tripCode: 'TRP-2025-8815',
    vehicleId: 'v-4',
    vehicleName: 'Urban Arrow Cargo XL Electric',
    vehiclePlate: 'CYC-1099-OR',
    driverId: 'd-4',
    driverName: 'Elena Rostova',
    origin: 'Portland Pearl District Hub',
    destination: 'Downtown Medical Campus',
    cargoDescription: 'Express Medical Diagnostic Kits (Refrigerated)',
    cargoWeightKg: 95,
    maxCapacityKg: 250,
    startOdometerKm: 4320,
    distanceKm: 12,
    estimatedHours: 0.8,
    revenue: 220,
    status: 'Draft',
    createdAt: '2025-02-17T09:15:00Z',
    notes: 'Cold chain verified, awaiting morning departure clearance.'
  }
];

export const initialMaintenance: MaintenanceLog[] = [
  {
    id: 'm-1',
    vehicleId: 'v-3',
    vehicleName: 'Mercedes-Benz Sprinter 2500',
    vehiclePlate: 'VAN-7790-NY',
    serviceType: 'Brake Replacement',
    serviceDate: '2025-02-16',
    cost: 1250,
    serviceProvider: 'Apex Fleet AutoCare Center',
    odometerAtService: 68900,
    status: 'In Progress',
    priority: 'Critical',
    description: 'Front & rear ceramic brake pads, rotor resurfacing, brake fluid flush',
    performedBy: 'Lead Mechanic Dave Miller',
    invoiceNumber: 'INV-APX-9941'
  },
  {
    id: 'm-2',
    vehicleId: 'v-1',
    vehicleName: 'Freightliner Cascadia Heavy Hauler',
    vehiclePlate: 'TRK-8821-WA',
    serviceType: 'Oil Change',
    serviceDate: '2025-01-20',
    cost: 450,
    serviceProvider: 'Pacific Northwest Heavy Fleet Service',
    odometerAtService: 138000,
    status: 'Completed',
    priority: 'Medium',
    description: 'Full synthetic 15W-40 oil service, fuel filter & water separator replacement',
    performedBy: 'Tech Jim Bradley',
    invoiceNumber: 'INV-PNW-1082'
  }
];

export const initialExpenses: ExpenseLog[] = [
  {
    id: 'e-1',
    vehicleId: 'v-1',
    vehiclePlate: 'TRK-8821-WA',
    category: 'Fuel',
    date: '2025-02-17',
    amount: 540.00,
    liters: 320.0,
    costPerLiter: 1.687,
    odometerKm: 142570,
    vendor: 'Pilot Flying J Travel Plaza #312',
    receiptNumber: 'REC-99412',
    notes: 'Full diesel tank fill before Spokane long haul'
  },
  {
    id: 'e-2',
    vehicleId: 'v-2',
    vehiclePlate: 'VAN-4412-CA',
    category: 'Fuel',
    date: '2025-02-16',
    amount: 98.50,
    liters: 62.0,
    costPerLiter: 1.588,
    odometerKm: 34030,
    vendor: 'Chevron Fleet Station #44',
    receiptNumber: 'REC-88210',
    notes: 'Delivery route top-up'
  },
  {
    id: 'e-3',
    vehicleId: 'v-1',
    vehiclePlate: 'TRK-8821-WA',
    category: 'Toll',
    date: '2025-02-17',
    amount: 45.00,
    vendor: 'WSDOT Express Toll Bridges',
    receiptNumber: 'TOL-7788',
    notes: 'Interstate highway pass'
  }
];
