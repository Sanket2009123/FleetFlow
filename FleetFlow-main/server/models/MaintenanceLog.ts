import mongoose, { Schema, Model } from 'mongoose';

export interface IMaintenanceLog {
  id: string;
  vehicleId: string;
  vehicleName: string;
  vehiclePlate: string;
  serviceType: string;
  serviceDate: string;
  cost: number;
  serviceProvider: string;
  odometerAtService: number;
  status: 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  description?: string;
  performedBy?: string;
  invoiceNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const MaintenanceLogSchema = new Schema<IMaintenanceLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    vehicleName: { type: String, required: true },
    vehiclePlate: { type: String, required: true },
    serviceType: { type: String, required: true },
    serviceDate: { type: String, required: true },
    cost: { type: Number, required: true, min: 0 },
    serviceProvider: { type: String, default: 'Internal Fleet Shop' },
    odometerAtService: { type: Number, required: true, min: 0 },
    status: { 
      type: String, 
      required: true, 
      enum: ['In Progress', 'Completed'],
      default: 'In Progress' 
    },
    priority: { 
      type: String, 
      required: true, 
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium' 
    },
    description: { type: String, default: '' },
    performedBy: { type: String, default: 'Lead Tech' },
    invoiceNumber: { type: String }
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

export const MaintenanceLogModel: Model<IMaintenanceLog> = 
  (mongoose.models.MaintenanceLog as Model<IMaintenanceLog>) || mongoose.model<IMaintenanceLog>('MaintenanceLog', MaintenanceLogSchema);
