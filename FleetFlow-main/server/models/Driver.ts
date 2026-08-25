import mongoose, { Schema, Model } from 'mongoose';

export interface IDriver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseCategories: string[];
  licenseExpiryDate: string;
  safetyScore: number;
  status: 'On Duty' | 'On Trip' | 'Off Duty' | 'Suspended';
  assignedVehicleId?: string;
  totalTripsCompleted: number;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const DriverSchema = new Schema<IDriver>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, default: '+1 (555) 000-0000' },
    licenseNumber: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
    licenseCategories: { 
      type: [String], 
      default: ['Truck', 'Van'],
      validate: (v: string[]) => Array.isArray(v) && v.length > 0
    },
    licenseExpiryDate: { type: String, required: true },
    safetyScore: { type: Number, default: 95, min: 0, max: 100 },
    status: { 
      type: String, 
      required: true, 
      enum: ['On Duty', 'On Trip', 'Off Duty', 'Suspended'],
      default: 'On Duty' 
    },
    assignedVehicleId: { type: String },
    totalTripsCompleted: { type: Number, default: 0, min: 0 },
    notes: { type: String, default: '' }
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

export const DriverModel: Model<IDriver> = 
  (mongoose.models.Driver as Model<IDriver>) || mongoose.model<IDriver>('Driver', DriverSchema);
