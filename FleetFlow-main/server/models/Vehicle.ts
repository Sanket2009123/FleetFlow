import mongoose, { Schema, Model } from 'mongoose';

export interface IVehicle {
  id: string;
  name: string;
  model: string;
  year: number;
  licensePlate: string;
  type: 'Truck' | 'Van' | 'Bike' | 'Car' | 'Trailer';
  fuelType: 'Diesel' | 'Petrol' | 'Electric' | 'Hybrid';
  maxLoadCapacityKg: number;
  currentOdometerKm: number;
  acquisitionCost: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
  region: string;
  lastServiceDate?: string;
  nextServiceOdometerKm?: number;
  assignedDriverId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const VehicleSchema = new Schema<IVehicle>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    model: { type: String, required: true, trim: true },
    year: { type: Number, default: 2024 },
    licensePlate: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    type: { 
      type: String, 
      required: true, 
      enum: ['Truck', 'Van', 'Bike', 'Car', 'Trailer'],
      default: 'Van' 
    },
    fuelType: { 
      type: String, 
      required: true, 
      enum: ['Diesel', 'Petrol', 'Electric', 'Hybrid'],
      default: 'Diesel' 
    },
    maxLoadCapacityKg: { type: Number, required: true, min: 0 },
    currentOdometerKm: { type: Number, default: 0, min: 0 },
    acquisitionCost: { type: Number, default: 0, min: 0 },
    status: { 
      type: String, 
      required: true, 
      enum: ['Available', 'On Trip', 'In Shop', 'Retired'],
      default: 'Available' 
    },
    region: { type: String, default: 'Central Hub' },
    lastServiceDate: { type: String },
    nextServiceOdometerKm: { type: Number },
    assignedDriverId: { type: String }
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

export const VehicleModel: Model<IVehicle> = 
  (mongoose.models.Vehicle as Model<IVehicle>) || mongoose.model<IVehicle>('Vehicle', VehicleSchema);
