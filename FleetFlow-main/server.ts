import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { connectDB, getDatabaseStatus, memoryDB, isMongoConnected } from './server/db';
import { VehicleModel } from './server/models/Vehicle';
import { DriverModel } from './server/models/Driver';
import { TripModel } from './server/models/Trip';
import { MaintenanceLogModel } from './server/models/MaintenanceLog';
import { ExpenseLogModel } from './server/models/ExpenseLog';
import { UserModel } from './server/models/User';
import { initialVehicles, initialDrivers, initialTrips, initialMaintenance, initialExpenses, initialUsers } from './src/data/seedData';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON Body Parser
  app.use(express.json());

  // Connect Database (MongoDB or In-Memory Mongoose Store)
  await connectDB();

  // -------------------------------------------------------------
  // API ROUTES (MERN Stack REST API)
  // -------------------------------------------------------------

  // Health & MERN Architecture Diagnostics
  app.get('/api/health', async (_req: Request, res: Response) => {
    const dbStatus = getDatabaseStatus();
    res.json({
      status: 'operational',
      timestamp: new Date().toISOString(),
      stack: 'MERN (MongoDB, Express, React, Node.js)',
      runtime: `Node.js ${process.version}`,
      database: dbStatus,
      uptimeSeconds: Math.floor(process.uptime())
    });
  });

  app.get('/api/mern/status', async (_req: Request, res: Response) => {
    let counts = {
      vehicles: memoryDB.vehicles.length,
      drivers: memoryDB.drivers.length,
      trips: memoryDB.trips.length,
      maintenance: memoryDB.maintenance.length,
      expenses: memoryDB.expenses.length,
      users: memoryDB.users?.length ?? 4
    };

    if (isMongoConnected) {
      try {
        counts = {
          vehicles: await VehicleModel.countDocuments(),
          drivers: await DriverModel.countDocuments(),
          trips: await TripModel.countDocuments(),
          maintenance: await MaintenanceLogModel.countDocuments(),
          expenses: await ExpenseLogModel.countDocuments(),
          users: await UserModel.countDocuments()
        };
      } catch (e) {
        console.warn('Error fetching mongo counts', e);
      }
    }

    res.json({
      ...getDatabaseStatus(),
      collections: counts,
      models: ['Vehicle', 'Driver', 'Trip', 'MaintenanceLog', 'ExpenseLog', 'User']
    });
  });

  app.post('/api/mern/seed', async (_req: Request, res: Response) => {
    try {
      memoryDB.vehicles = JSON.parse(JSON.stringify(initialVehicles));
      memoryDB.drivers = JSON.parse(JSON.stringify(initialDrivers));
      memoryDB.trips = JSON.parse(JSON.stringify(initialTrips));
      memoryDB.maintenance = JSON.parse(JSON.stringify(initialMaintenance));
      memoryDB.expenses = JSON.parse(JSON.stringify(initialExpenses));
      memoryDB.users = JSON.parse(JSON.stringify(initialUsers));

      if (isMongoConnected) {
        await Promise.all([
          VehicleModel.deleteMany({}),
          DriverModel.deleteMany({}),
          TripModel.deleteMany({}),
          MaintenanceLogModel.deleteMany({}),
          ExpenseLogModel.deleteMany({}),
          UserModel.deleteMany({})
        ]);
        await Promise.all([
          VehicleModel.insertMany(initialVehicles),
          DriverModel.insertMany(initialDrivers),
          TripModel.insertMany(initialTrips),
          MaintenanceLogModel.insertMany(initialMaintenance),
          ExpenseLogModel.insertMany(initialExpenses),
          UserModel.insertMany(initialUsers)
        ]);
      }

      res.json({ success: true, message: 'Database reset to factory MERN seed data with users and fleet records.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // AUTHENTICATION & USER MANAGEMENT ENDPOINTS
  // -------------------------------------------------------------
  
  // POST /api/auth/register - Register new user account
  app.post('/api/auth/register', async (req: Request, res: Response) => {
    try {
      const { name, email, password, role, organization, phone, licenseNumber } = req.body;
      
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      if (isMongoConnected) {
        const existing = await UserModel.findOne({ email: normalizedEmail });
        if (existing) {
          return res.status(400).json({ error: 'An account with this email already exists.' });
        }
      } else {
        const existing = memoryDB.users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (existing) {
          return res.status(400).json({ error: 'An account with this email already exists.' });
        }
      }

      const newUser: any = {
        id: `u-${Date.now()}`,
        name: name.trim(),
        email: normalizedEmail,
        password: password,
        role: role || 'Fleet Manager',
        organization: organization || 'FleetFlow Logistics Global',
        phone: phone || '+1 (555) 100-2000',
        licenseNumber: licenseNumber || undefined,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      if (isMongoConnected) {
        const created = await UserModel.create(newUser);
        const userObj = created.toJSON();
        return res.status(201).json({
          user: userObj,
          token: `jwt-session-${created.id}`,
          message: 'Account registered and persisted to MongoDB successfully!'
        });
      } else {
        memoryDB.users.push(newUser);
        const { password: _, ...userWithoutPass } = newUser;
        return res.status(201).json({
          user: userWithoutPass,
          token: `jwt-session-${newUser.id}`,
          message: 'Account registered and stored in database successfully!'
        });
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ error: err.message || 'Failed to register account' });
    }
  });

  // POST /api/auth/login - Authenticate user
  app.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ error: 'Email is required.' });
      }

      const normalizedEmail = email.toLowerCase().trim();

      let userFound: any = null;

      if (isMongoConnected) {
        userFound = await UserModel.findOne({ email: normalizedEmail });
        if (userFound) {
          // If password was provided and user has a password, verify
          if (password && userFound.password && userFound.password !== password) {
            // For demo flexibility we allow password 'demo123' or exact match
            if (password !== 'demo123') {
              return res.status(401).json({ error: 'Invalid password. (Default demo pass is "demo123")' });
            }
          }
          userFound.lastLogin = new Date();
          await userFound.save();
          userFound = userFound.toJSON();
        }
      } else {
        userFound = memoryDB.users.find(u => u.email.toLowerCase() === normalizedEmail);
        if (userFound) {
          if (password && userFound.password && userFound.password !== password) {
            if (password !== 'demo123') {
              return res.status(401).json({ error: 'Invalid password. (Default demo pass is "demo123")' });
            }
          }
          userFound.lastLogin = new Date().toISOString();
          const { password: _, ...safeUser } = userFound;
          userFound = safeUser;
        }
      }

      if (!userFound) {
        return res.status(404).json({ error: 'User not found. Please register or select a pre-configured team profile.' });
      }

      res.json({
        user: userFound,
        token: `jwt-session-${userFound.id}`,
        message: `Welcome back, ${userFound.name}!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Login failed' });
    }
  });

  // GET /api/auth/users - List all registered users
  app.get('/api/auth/users', async (_req: Request, res: Response) => {
    try {
      if (isMongoConnected) {
        const users = await UserModel.find().select('-password').lean();
        return res.json(users);
      }
      const safeUsers = memoryDB.users.map(({ password, ...u }) => u);
      res.json(safeUsers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // PUT /api/auth/profile - Update current user profile
  app.put('/api/auth/profile', async (req: Request, res: Response) => {
    try {
      const { id, name, phone, organization, licenseNumber, role } = req.body;
      if (!id) return res.status(400).json({ error: 'User ID required' });

      if (isMongoConnected) {
        const updated = await UserModel.findOneAndUpdate(
          { id },
          { $set: { name, phone, organization, licenseNumber, role } },
          { new: true }
        ).select('-password');
        return res.json(updated);
      } else {
        const idx = memoryDB.users.findIndex(u => u.id === id);
        if (idx === -1) return res.status(404).json({ error: 'User not found' });
        memoryDB.users[idx] = { ...memoryDB.users[idx], name, phone, organization, licenseNumber, role };
        const { password, ...safe } = memoryDB.users[idx];
        return res.json(safe);
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // DATA GENERATOR / BATCH INSERTER ENDPOINTS
  // -------------------------------------------------------------
  app.post('/api/data/generate-sample', async (req: Request, res: Response) => {
    try {
      const { type, count = 3 } = req.body;
      const createdItems: any[] = [];

      const cities = ['Seattle, WA', 'Portland, OR', 'San Francisco, CA', 'Los Angeles, CA', 'Chicago, IL', 'Dallas, TX', 'New York, NY', 'Miami, FL', 'Denver, CO', 'Vancouver, BC'];
      const firstNames = ['Alexander', 'Marcus', 'Sophia', 'Lucas', 'Oliver', 'Maya', 'Liam', 'Emma', 'Ethan', 'Chloe'];
      const lastNames = ['Sterling', 'Bennett', 'Vance', 'O\'Connor', 'Patel', 'Kim', 'Ramirez', 'Dubois', 'Novak', 'Zhao'];

      if (type === 'vehicles' || type === 'all') {
        const vehicleModels = [
          { name: 'Tesla Semi Electric Prime', model: 'Semi Long Range Tri-Motor', type: 'Truck', fuel: 'Electric', cap: 22000 },
          { name: 'Rivian Commercial Van 700', model: 'Delivery 700 Dual-Motor', type: 'Van', fuel: 'Electric', cap: 2400 },
          { name: 'Kenworth T680 NextGen', model: 'T680 PACCAR MX-13', type: 'Truck', fuel: 'Diesel', cap: 21000 },
          { name: 'Riese & Müller Transporter 85', model: 'Transporter 85 DualBattery', type: 'Bike', fuel: 'Electric', cap: 300 },
          { name: 'Mack Anthem 70" Sleeper', model: 'Anthem MP8-HE Euro 6', type: 'Truck', fuel: 'Diesel', cap: 20000 }
        ];

        for (let i = 0; i < (count || 3); i++) {
          const preset = vehicleModels[i % vehicleModels.length];
          const newV = {
            id: `v-${Date.now()}-${i}`,
            name: `${preset.name} #${Math.floor(100 + Math.random() * 900)}`,
            model: preset.model,
            year: 2024,
            licensePlate: `FLEET-${Math.floor(1000 + Math.random() * 9000)}-US`,
            type: preset.type as 'Truck' | 'Van' | 'Bike' | 'Car' | 'Trailer',
            fuelType: preset.fuel as 'Diesel' | 'Petrol' | 'Electric' | 'Hybrid',
            maxLoadCapacityKg: preset.cap,
            currentOdometerKm: Math.floor(5000 + Math.random() * 80000),
            acquisitionCost: preset.type === 'Truck' ? 165000 : preset.type === 'Van' ? 58000 : 9500,
            status: (Math.random() > 0.4 ? 'Available' : 'On Trip') as 'Available' | 'On Trip',
            region: cities[Math.floor(Math.random() * cities.length)],
            lastServiceDate: '2025-02-01',
            nextServiceOdometerKm: 90000
          };

          if (isMongoConnected) {
            await VehicleModel.create(newV);
          } else {
            memoryDB.vehicles.push(newV);
          }
          createdItems.push({ entity: 'vehicle', data: newV });
        }
      }

      if (type === 'drivers' || type === 'all') {
        for (let i = 0; i < (count || 2); i++) {
          const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
          const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
          const newD = {
            id: `d-${Date.now()}-${i}`,
            name: `${fn} ${ln}`,
            email: `${fn.toLowerCase()}.${ln.toLowerCase()}@fleetflow.io`,
            phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
            licenseNumber: `CDL-${['WA','CA','TX','NY','IL'][i % 5]}-${Math.floor(100000 + Math.random() * 900000)}`,
            licenseCategories: ['Truck', 'Van'],
            licenseExpiryDate: '2028-06-30',
            safetyScore: Math.floor(90 + Math.random() * 10),
            status: 'On Duty' as 'On Duty',
            totalTripsCompleted: Math.floor(10 + Math.random() * 80),
            notes: 'Verified commercial driver profile with clean DMV record.'
          };

          if (isMongoConnected) {
            await DriverModel.create(newD);
          } else {
            memoryDB.drivers.push(newD);
          }
          createdItems.push({ entity: 'driver', data: newD });
        }
      }

      if (type === 'trips' || type === 'all') {
        const origins = ['Chicago Central Depot', 'Seattle Bay Gateway', 'Los Angeles Port Terminal', 'Dallas Hub 04'];
        const dests = ['Detroit Auto Assembly', 'Portland North Facility', 'Phoenix Sky Logistics', 'Houston Freight Center'];
        const cargos = ['Precision EV Lithium Cells', 'Automotive Assemblies & Motors', 'Pharmaceutical Cold Pack', 'Aerospace Avionics'];

        for (let i = 0; i < (count || 2); i++) {
          const newT = {
            id: `t-${Date.now()}-${i}`,
            tripCode: `TRP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
            vehicleId: 'v-1',
            vehicleName: 'Freightliner Cascadia Heavy Hauler',
            vehiclePlate: 'TRK-8821-WA',
            driverId: 'd-1',
            driverName: 'Carlos Hernandez',
            origin: origins[i % origins.length],
            destination: dests[i % dests.length],
            cargoDescription: cargos[i % cargos.length],
            cargoWeightKg: Math.floor(4000 + Math.random() * 10000),
            maxCapacityKg: 18000,
            startOdometerKm: 143000,
            distanceKm: Math.floor(250 + Math.random() * 800),
            estimatedHours: Math.floor(4 + Math.random() * 10),
            revenue: Math.floor(1800 + Math.random() * 4000),
            status: 'Dispatched' as 'Dispatched',
            createdAt: new Date().toISOString(),
            notes: 'Generated operational manifest with live GPS telematics.'
          };

          if (isMongoConnected) {
            await TripModel.create(newT);
          } else {
            memoryDB.trips.push(newT);
          }
          createdItems.push({ entity: 'trip', data: newT });
        }
      }

      res.json({
        success: true,
        count: createdItems.length,
        items: createdItems,
        message: `Successfully generated ${createdItems.length} records into database!`
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // KPIs
  app.get('/api/kpis', async (_req: Request, res: Response) => {
    try {
      let vehicles = memoryDB.vehicles;
      let trips = memoryDB.trips;

      if (isMongoConnected) {
        vehicles = await VehicleModel.find().lean();
        trips = await TripModel.find().lean();
      }

      const activeFleet = vehicles.filter(v => v.status === 'On Trip').length;
      const inShopCount = vehicles.filter(v => v.status === 'In Shop').length;
      const totalVehicles = vehicles.length;
      const availableVehicles = vehicles.filter(v => v.status === 'Available').length;
      const utilizationRate = totalVehicles > 0 ? Number(((activeFleet / totalVehicles) * 100).toFixed(1)) : 0;
      const pendingCargoCount = trips.filter(t => t.status === 'Draft').length;

      res.json({
        activeFleet,
        inShopCount,
        utilizationRate,
        pendingCargoCount,
        totalVehicles,
        availableVehicles
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ---------------- VEHICLES ----------------
  app.get('/api/vehicles', async (_req: Request, res: Response) => {
    try {
      if (isMongoConnected) {
        const data = await VehicleModel.find().sort({ createdAt: -1 }).lean();
        return res.json(data);
      }
      res.json(memoryDB.vehicles);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/vehicles', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const plate = (data.licensePlate || `TRK-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase();

      // Check duplicate plate
      const existing = isMongoConnected
        ? await VehicleModel.findOne({ licensePlate: plate })
        : memoryDB.vehicles.find(v => v.licensePlate.toUpperCase() === plate);

      if (existing) {
        return res.status(400).json({ error: `Vehicle with license plate "${plate}" already exists.` });
      }

      const newVehicle = {
        id: `v-${Date.now()}`,
        name: data.name || 'Commercial Fleet Carrier',
        model: data.model || 'Heavy Hauler',
        year: Number(data.year) || 2024,
        licensePlate: plate,
        type: data.type || 'Van',
        fuelType: data.fuelType || 'Diesel',
        maxLoadCapacityKg: Number(data.maxLoadCapacityKg) || 2000,
        currentOdometerKm: Number(data.currentOdometerKm) || 0,
        acquisitionCost: Number(data.acquisitionCost) || 50000,
        status: 'Available', // Rule 1: New vehicles start as Available
        region: data.region || 'Central Hub',
        lastServiceDate: new Date().toISOString().split('T')[0]
      };

      if (isMongoConnected) {
        const created = await VehicleModel.create(newVehicle as any);
        return res.status(201).json(created);
      }

      memoryDB.vehicles.unshift(newVehicle);
      res.status(201).json(newVehicle);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/vehicles/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (isMongoConnected) {
        const updated = await VehicleModel.findOneAndUpdate({ id }, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
        return res.json(updated);
      }

      const idx = memoryDB.vehicles.findIndex(v => v.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Vehicle not found' });

      memoryDB.vehicles[idx] = { ...memoryDB.vehicles[idx], ...updateData };
      res.json(memoryDB.vehicles[idx]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/vehicles/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (isMongoConnected) {
        const updated = await VehicleModel.findOneAndUpdate({ id }, { status }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Vehicle not found' });
        return res.json(updated);
      }

      const vehicle = memoryDB.vehicles.find(v => v.id === id);
      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

      vehicle.status = status;
      res.json(vehicle);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/vehicles/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (isMongoConnected) {
        await VehicleModel.findOneAndDelete({ id });
        return res.json({ success: true });
      }

      memoryDB.vehicles = memoryDB.vehicles.filter(v => v.id !== id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- DRIVERS ----------------
  app.get('/api/drivers', async (_req: Request, res: Response) => {
    try {
      if (isMongoConnected) {
        const data = await DriverModel.find().sort({ createdAt: -1 }).lean();
        return res.json(data);
      }
      res.json(memoryDB.drivers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/drivers', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const isExpired = data.licenseExpiryDate ? new Date(data.licenseExpiryDate).getTime() < Date.now() : false;

      const newDriver = {
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

      if (isMongoConnected) {
        const created = await DriverModel.create(newDriver);
        return res.status(201).json(created);
      }

      memoryDB.drivers.unshift(newDriver);
      res.status(201).json(newDriver);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/drivers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const isExpired = updateData.licenseExpiryDate ? new Date(updateData.licenseExpiryDate).getTime() < Date.now() : false;
      if (isExpired) updateData.status = 'Suspended';

      if (isMongoConnected) {
        const updated = await DriverModel.findOneAndUpdate({ id }, updateData, { new: true });
        if (!updated) return res.status(404).json({ error: 'Driver not found' });
        return res.json(updated);
      }

      const idx = memoryDB.drivers.findIndex(d => d.id === id);
      if (idx === -1) return res.status(404).json({ error: 'Driver not found' });

      memoryDB.drivers[idx] = { ...memoryDB.drivers[idx], ...updateData };
      res.json(memoryDB.drivers[idx]);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/drivers/:id/status', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (isMongoConnected) {
        const updated = await DriverModel.findOneAndUpdate({ id }, { status }, { new: true });
        if (!updated) return res.status(404).json({ error: 'Driver not found' });
        return res.json(updated);
      }

      const driver = memoryDB.drivers.find(d => d.id === id);
      if (!driver) return res.status(404).json({ error: 'Driver not found' });

      driver.status = status;
      res.json(driver);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/drivers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (isMongoConnected) {
        await DriverModel.findOneAndDelete({ id });
        return res.json({ success: true });
      }

      memoryDB.drivers = memoryDB.drivers.filter(d => d.id !== id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- TRIPS ----------------
  app.get('/api/trips', async (_req: Request, res: Response) => {
    try {
      if (isMongoConnected) {
        const data = await TripModel.find().sort({ createdAt: -1 }).lean();
        return res.json(data);
      }
      res.json(memoryDB.trips);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/trips', async (req: Request, res: Response) => {
    try {
      const data = req.body;

      // Find Vehicle and Driver
      let vehicle = isMongoConnected 
        ? await VehicleModel.findOne({ id: data.vehicleId })
        : memoryDB.vehicles.find(v => v.id === data.vehicleId);

      let driver = isMongoConnected
        ? await DriverModel.findOne({ id: data.driverId })
        : memoryDB.drivers.find(d => d.id === data.driverId);

      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
      if (!driver) return res.status(404).json({ error: 'Driver not found' });

      // RULE 2: Overweight Cargo Validation
      if (Number(data.cargoWeightKg) > vehicle.maxLoadCapacityKg) {
        return res.status(400).json({
          error: `Rule 2 Overweight Cargo Violation: Cargo is ${data.cargoWeightKg}kg, but vehicle maximum capacity is ${vehicle.maxLoadCapacityKg}kg.`
        });
      }

      // RULE 3: Status Transition on Dispatch
      if (data.status === 'Dispatched') {
        if (isMongoConnected) {
          await VehicleModel.findOneAndUpdate({ id: vehicle.id }, { status: 'On Trip' });
          await DriverModel.findOneAndUpdate({ id: driver.id }, { status: 'On Trip' });
        } else {
          vehicle.status = 'On Trip';
          driver.status = 'On Trip';
        }
      }

      const newTrip = {
        id: `t-${Date.now()}`,
        tripCode: data.tripCode || `TRP-2025-${Math.floor(1000 + Math.random() * 9000)}`,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        vehiclePlate: vehicle.licensePlate,
        driverId: driver.id,
        driverName: driver.name,
        origin: data.origin,
        destination: data.destination,
        cargoDescription: data.cargoDescription || 'General Freight',
        cargoWeightKg: Number(data.cargoWeightKg),
        maxCapacityKg: vehicle.maxLoadCapacityKg,
        startOdometerKm: vehicle.currentOdometerKm,
        distanceKm: Number(data.distanceKm) || 100,
        revenue: Number(data.revenue) || 500,
        status: data.status || 'Draft',
        notes: data.notes || '',
        createdAt: new Date().toISOString()
      };

      if (isMongoConnected) {
        const created = await TripModel.create(newTrip);
        return res.status(201).json(created);
      }

      memoryDB.trips.unshift(newTrip);
      res.status(201).json(newTrip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/trips/:id/dispatch', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      let trip = isMongoConnected
        ? await TripModel.findOne({ id })
        : memoryDB.trips.find(t => t.id === id);

      if (!trip) return res.status(404).json({ error: 'Trip not found' });

      if (isMongoConnected) {
        await VehicleModel.findOneAndUpdate({ id: trip.vehicleId }, { status: 'On Trip' });
        await DriverModel.findOneAndUpdate({ id: trip.driverId }, { status: 'On Trip' });
        const updated = await TripModel.findOneAndUpdate({ id }, { status: 'Dispatched' }, { new: true });
        return res.json(updated);
      }

      const vehicle = memoryDB.vehicles.find(v => v.id === trip.vehicleId);
      const driver = memoryDB.drivers.find(d => d.id === trip.driverId);
      if (vehicle) vehicle.status = 'On Trip';
      if (driver) driver.status = 'On Trip';
      trip.status = 'Dispatched';

      res.json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.put('/api/trips/:id/complete', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { finalOdometerKm, revenue, notes } = req.body;

      let trip = isMongoConnected
        ? await TripModel.findOne({ id })
        : memoryDB.trips.find(t => t.id === id);

      if (!trip) return res.status(404).json({ error: 'Trip not found' });

      const finalOdo = Number(finalOdometerKm);

      // RULE 4: Update vehicle odometer & reset statuses back to Available & On Duty
      if (isMongoConnected) {
        await VehicleModel.findOneAndUpdate({ id: trip.vehicleId }, {
          currentOdometerKm: finalOdo,
          status: 'Available'
        });
        await DriverModel.findOneAndUpdate({ id: trip.driverId }, {
          status: 'On Duty',
          $inc: { totalTripsCompleted: 1 }
        });
        const updated = await TripModel.findOneAndUpdate(
          { id },
          {
            status: 'Completed',
            endOdometerKm: finalOdo,
            ...(revenue !== undefined ? { revenue: Number(revenue) } : {}),
            ...(notes ? { notes } : {}),
            completedAt: new Date()
          },
          { new: true }
        );
        return res.json(updated);
      }

      const vehicle = memoryDB.vehicles.find(v => v.id === trip.vehicleId);
      const driver = memoryDB.drivers.find(d => d.id === trip.driverId);

      if (vehicle) {
        vehicle.currentOdometerKm = finalOdo;
        vehicle.status = 'Available';
      }
      if (driver) {
        driver.status = 'On Duty';
        driver.totalTripsCompleted = (driver.totalTripsCompleted || 0) + 1;
      }

      trip.status = 'Completed';
      trip.endOdometerKm = finalOdo;
      if (revenue !== undefined) trip.revenue = Number(revenue);
      if (notes) trip.notes = notes;
      trip.completedAt = new Date().toISOString();

      res.json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/trips/:id/cancel', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      let trip = isMongoConnected
        ? await TripModel.findOne({ id })
        : memoryDB.trips.find(t => t.id === id);

      if (!trip) return res.status(404).json({ error: 'Trip not found' });

      if (isMongoConnected) {
        await VehicleModel.findOneAndUpdate({ id: trip.vehicleId, status: 'On Trip' }, { status: 'Available' });
        await DriverModel.findOneAndUpdate({ id: trip.driverId, status: 'On Trip' }, { status: 'On Duty' });
        const updated = await TripModel.findOneAndUpdate({ id }, { status: 'Cancelled' }, { new: true });
        return res.json(updated);
      }

      const vehicle = memoryDB.vehicles.find(v => v.id === trip.vehicleId);
      const driver = memoryDB.drivers.find(d => d.id === trip.driverId);
      if (vehicle && vehicle.status === 'On Trip') vehicle.status = 'Available';
      if (driver && driver.status === 'On Trip') driver.status = 'On Duty';
      trip.status = 'Cancelled';

      res.json(trip);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- MAINTENANCE ----------------
  app.get('/api/maintenance', async (_req: Request, res: Response) => {
    try {
      if (isMongoConnected) {
        const data = await MaintenanceLogModel.find().sort({ createdAt: -1 }).lean();
        return res.json(data);
      }
      res.json(memoryDB.maintenance);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/maintenance', async (req: Request, res: Response) => {
    try {
      const data = req.body;

      let vehicle = isMongoConnected
        ? await VehicleModel.findOne({ id: data.vehicleId })
        : memoryDB.vehicles.find(v => v.id === data.vehicleId);

      if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

      // RULE 5: Maintenance isolations - vehicle set to 'In Shop' automatically
      if (isMongoConnected) {
        await VehicleModel.findOneAndUpdate(
          { id: vehicle.id },
          { 
            status: 'In Shop',
            lastServiceDate: data.serviceDate || new Date().toISOString().split('T')[0]
          }
        );
      } else {
        vehicle.status = 'In Shop';
        vehicle.lastServiceDate = data.serviceDate || new Date().toISOString().split('T')[0];
      }

      const newLog = {
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

      if (isMongoConnected) {
        const created = await MaintenanceLogModel.create(newLog as any);
        return res.status(201).json(created);
      }

      memoryDB.maintenance.unshift(newLog);
      res.status(201).json(newLog);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.patch('/api/maintenance/:id/complete', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      let log = isMongoConnected
        ? await MaintenanceLogModel.findOne({ id })
        : memoryDB.maintenance.find(m => m.id === id);

      if (!log) return res.status(404).json({ error: 'Maintenance record not found' });

      if (isMongoConnected) {
        const updated = await MaintenanceLogModel.findOneAndUpdate({ id }, { status: 'Completed' }, { new: true });
        
        // Release vehicle if no other open maintenance logs
        const openLogs = await MaintenanceLogModel.countDocuments({
          vehicleId: log.vehicleId,
          status: 'In Progress',
          id: { $ne: id }
        });

        if (openLogs === 0) {
          await VehicleModel.findOneAndUpdate({ id: log.vehicleId, status: 'In Shop' }, { status: 'Available' });
        }

        return res.json(updated);
      }

      log.status = 'Completed';
      const openLogs = memoryDB.maintenance.filter(m => m.vehicleId === log.vehicleId && m.status === 'In Progress' && m.id !== id);
      if (openLogs.length === 0) {
        const vehicle = memoryDB.vehicles.find(v => v.id === log.vehicleId);
        if (vehicle && vehicle.status === 'In Shop') {
          vehicle.status = 'Available';
        }
      }

      res.json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/maintenance/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (isMongoConnected) {
        await MaintenanceLogModel.findOneAndDelete({ id });
        return res.json({ success: true });
      }

      memoryDB.maintenance = memoryDB.maintenance.filter(m => m.id !== id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // ---------------- EXPENSES ----------------
  app.get('/api/expenses', async (_req: Request, res: Response) => {
    try {
      if (isMongoConnected) {
        const data = await ExpenseLogModel.find().sort({ createdAt: -1 }).lean();
        return res.json(data);
      }
      res.json(memoryDB.expenses);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/expenses', async (req: Request, res: Response) => {
    try {
      const data = req.body;
      const vehicle = isMongoConnected
        ? await VehicleModel.findOne({ id: data.vehicleId })
        : memoryDB.vehicles.find(v => v.id === data.vehicleId);

      const newExpense = {
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

      if (isMongoConnected) {
        const created = await ExpenseLogModel.create(newExpense);
        return res.status(201).json(created);
      }

      memoryDB.expenses.unshift(newExpense);
      res.status(201).json(newExpense);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.delete('/api/expenses/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (isMongoConnected) {
        await ExpenseLogModel.findOneAndDelete({ id });
        return res.json({ success: true });
      }

      memoryDB.expenses = memoryDB.expenses.filter(e => e.id !== id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // -------------------------------------------------------------
  // VITE MIDDLEWARE & STATIC ASSET SERVING
  // -------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[MERN Stack Server] Express running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[MERN Stack Server] Fatal startup error:', err);
});
