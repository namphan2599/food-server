import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export interface IDeliveryPartner extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  vehicleType: 'bicycle' | 'motorcycle' | 'car' | 'scooter';
  vehicleNumber?: string;
  isAvailable: boolean;
  isVerified: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  rating: number;
  totalDeliveries: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const DeliveryPartnerSchema: Schema = new Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    vehicleType: { 
      type: String, 
      enum: ['bicycle', 'motorcycle', 'car', 'scooter'], 
      required: true 
    },
    vehicleNumber: { type: String },
    isAvailable: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        default: [0, 0]
      }
    },
    rating: { type: Number, default: 0 },
    totalDeliveries: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Create a geospatial index on the location field
DeliveryPartnerSchema.index({ currentLocation: '2dsphere' });

// Hash password before saving
DeliveryPartnerSchema.pre<IDeliveryPartner>('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare passwords
DeliveryPartnerSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IDeliveryPartner>('DeliveryPartner', DeliveryPartnerSchema);