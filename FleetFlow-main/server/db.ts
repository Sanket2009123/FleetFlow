import mongoose from 'mongoose';
import { initialVehicles, initialDrivers, initialTrips, initialMaintenance, initialExpenses, initialUsers } from '../src/data/seedData';
import { VehicleModel } from './models/Vehicle';
import { DriverModel } from './models/Driver';
import { TripModel } from './models/Trip';
import { MaintenanceLogModel } from './models/MaintenanceLog';
import { ExpenseLogModel } from './models/ExpenseLog';
import { UserModel } from './models/User';

interface MemoryDB {
  vehicles: any[];
  drivers: any[];
  trips: any[];
  maintenance: any[];
  expenses: any[];
  users: any[];
}

// In-Memory fallback store with deep clone
const memoryDB: MemoryDB = {
  vehicles: JSON.parse(JSON.stringify(initialVehicles)),
  drivers: JSON.parse(JSON.stringify(initialDrivers)),
  trips: JSON.parse(JSON.stringify(initialTrips)),
  maintenance: JSON.parse(JSON.stringify(initialMaintenance)),
  expenses: JSON.parse(JSON.stringify(initialExpenses)),
  users: JSON.parse(JSON.stringify(initialUsers))
};

let isMongoConnected = false;
let mongoConnectionError: string | null = null;
let connectionUriUsed: string = 'In-Memory Mongoose Compatible Store';

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri.includes('user:password@cluster')) {
    console.log('[MERN DB] MONGODB_URI not configured or using template placeholder. Running in-memory MongoDB store with Mongoose schema validation.');
    isMongoConnected = false;
    connectionUriUsed = 'In-Memory MongoDB Driver (Active)';
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    isMongoConnected = true;
    mongoConnectionError = null;
    connectionUriUsed = uri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@');
    console.log('[MERN DB] Connected to MongoDB Atlas / Remote Cluster:', connectionUriUsed);
    await seedMongoIfEmpty();
  } catch (err: any) {
    isMongoConnected = false;
    mongoConnectionError = err.message;
    connectionUriUsed = 'In-Memory Fallback (Connection Error: ' + err.message + ')';
    console.warn('[MERN DB] MongoDB connection failed, utilizing resilient in-memory store:', err.message);
  }
}

async function seedMongoIfEmpty() {
  try {
    const vCount = await VehicleModel.countDocuments();
    if (vCount === 0) {
      console.log('[MERN DB] Seeding initial fleet documents to MongoDB...');
      await Promise.all([
        VehicleModel.insertMany(initialVehicles as any),
        DriverModel.insertMany(initialDrivers as any),
        TripModel.insertMany(initialTrips as any),
        MaintenanceLogModel.insertMany(initialMaintenance as any),
        ExpenseLogModel.insertMany(initialExpenses as any),
        UserModel.insertMany(initialUsers as any)
      ]);
      console.log('[MERN DB] MongoDB seeding complete.');
    }
  } catch (err) {
    console.error('[MERN DB] Error seeding MongoDB:', err);
  }
}

export function getDatabaseStatus() {
  return {
    engine: 'MongoDB + Mongoose (MERN Stack)',
    connectedToRemoteAtlas: isMongoConnected,
    connectionState: isMongoConnected ? 'connected' : 'in_memory_simulation',
    connectionUri: connectionUriUsed,
    connectionError: mongoConnectionError,
    mongooseVersion: mongoose.version,
    counts: {
      vehicles: isMongoConnected ? null : memoryDB.vehicles.length,
      drivers: isMongoConnected ? null : memoryDB.drivers.length,
      trips: isMongoConnected ? null : memoryDB.trips.length,
      maintenance: isMongoConnected ? null : memoryDB.maintenance.length,
      expenses: isMongoConnected ? null : memoryDB.expenses.length,
      users: isMongoConnected ? null : memoryDB.users.length,
    }
  };
}

export { memoryDB, isMongoConnected };
