import mongoose, { Schema, Model } from 'mongoose';

export interface IExpenseLog {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  category: 'Fuel' | 'Toll' | 'Maintenance' | 'Insurance' | 'Other';
  date: string;
  amount: number;
  liters?: number;
  costPerLiter?: number;
  odometerKm?: number;
  vendor: string;
  receiptNumber?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const ExpenseLogSchema = new Schema<IExpenseLog>(
  {
    id: { type: String, required: true, unique: true, index: true },
    vehicleId: { type: String, required: true, index: true },
    vehiclePlate: { type: String, required: true },
    category: { 
      type: String, 
      required: true, 
      enum: ['Fuel', 'Toll', 'Maintenance', 'Insurance', 'Other'],
      default: 'Fuel' 
    },
    date: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    liters: { type: Number, min: 0 },
    costPerLiter: { type: Number, min: 0 },
    odometerKm: { type: Number, min: 0 },
    vendor: { type: String, default: 'Merchant Vendor' },
    receiptNumber: { type: String },
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

export const ExpenseLogModel: Model<IExpenseLog> = 
  (mongoose.models.ExpenseLog as Model<IExpenseLog>) || mongoose.model<IExpenseLog>('ExpenseLog', ExpenseLogSchema);
