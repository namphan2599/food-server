import mongoose, { Document, Schema } from 'mongoose';

export enum DeliveryStatus {
  ASSIGNED = 'assigned',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

export interface IDelivery extends Document {
  orderId: number;
  restaurantId: number;
  deliveryPartnerId: mongoose.Types.ObjectId;
  userId: number;
  pickupAddress: string;
  deliveryAddress: string;
  deliveryInstructions?: string;
  status: DeliveryStatus;
  estimatedDeliveryTime?: Date;
  actualDeliveryTime?: Date;
  assignedAt: Date;
  pickedUpAt?: Date;
  deliveredAt?: Date;
  failureReason?: string;
  customerRating?: number;
  customerFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DeliverySchema: Schema = new Schema(
  {
    orderId: { type: Number, required: true, unique: true },
    restaurantId: { type: Number, required: true },
    deliveryPartnerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'DeliveryPartner', 
      required: true 
    },
    userId: { type: Number, required: true },
    pickupAddress: { type: String, required: true },
    deliveryAddress: { type: String, required: true },
    deliveryInstructions: { type: String },
    status: { 
      type: String, 
      enum: Object.values(DeliveryStatus),
      default: DeliveryStatus.ASSIGNED 
    },
    estimatedDeliveryTime: { type: Date },
    actualDeliveryTime: { type: Date },
    assignedAt: { type: Date, default: Date.now },
    pickedUpAt: { type: Date },
    deliveredAt: { type: Date },
    failureReason: { type: String },
    customerRating: { type: Number, min: 1, max: 5 },
    customerFeedback: { type: String }
  },
  { timestamps: true }
);

export default mongoose.model<IDelivery>('Delivery', DeliverySchema);