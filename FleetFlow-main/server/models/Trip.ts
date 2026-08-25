import mongoose, { Schema, Model } from 'mongoose';

export interface ITrip {
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
  revenue: number;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
  notes?: string;
  createdAt?: string | Date;
  completedAt?: string | Date;
}

const TripSchema = new Schema<ITrip>(
  {
    id: { type: String, required: true, unique: true, index: true },
    tripCode: { type: String, required: true, unique: true, uppercase: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    vehicleName: { type: String, required: true },
    vehiclePlate: { type: String, required: true },
    driverId: { type: String, required: true, index: true },
    driverName: { type: String, required: true },
    origin: { type: String, required: true },
    destination: { type: String, required: true },
    cargoDescription: { type: String, default: 'General Cargo' },
    cargoWeightKg: { type: Number, required: true, min: 0 },
    maxCapacityKg: { type: Number, required: true, min: 0 },
    startOdometerKm: { type: Number, required: true, default: 0 },
    endOdometerKm: { type: Number },
    distanceKm: { type: Number, required: true, min: 0 },
    revenue: { type: Number, default: 0 },
    status: { 
      type: String, 
      required: true, 
      enum: ['Draft', 'Dispatched', 'Completed', 'Cancelled'],
      default: 'Dispatched' 
    },
    notes: { type: String, default: '' },
    completedAt: { type: Date }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      }
    }
  }
);

export const TripModel: Model<ITrip> = 
  (mongoose.models.Trip as Model<ITrip>) || mongoose.model<ITrip>('Trip', TripSchema);
