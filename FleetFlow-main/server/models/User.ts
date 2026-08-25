import mongoose, { Schema, Model } from 'mongoose';

export interface IUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';
  avatarUrl?: string;
  phone?: string;
  organization?: string;
  licenseNumber?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLogin?: Date;
}

const UserSchema = new Schema<IUser>(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, default: 'demo123' },
    role: { 
      type: String, 
      required: true, 
      enum: ['Fleet Manager', 'Dispatcher', 'Safety Officer', 'Financial Analyst'],
      default: 'Fleet Manager' 
    },
    avatarUrl: { type: String },
    phone: { type: String, default: '+1 (555) 000-0000' },
    organization: { type: String, default: 'Enterprise Fleet Operations' },
    licenseNumber: { type: String },
    lastLogin: { type: Date, default: Date.now }
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete (ret as any)._id;
        delete (ret as any).__v;
        delete (ret as any).password;
        return ret;
      }
    }
  }
);

export const UserModel: Model<IUser> = 
  (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>('User', UserSchema);
