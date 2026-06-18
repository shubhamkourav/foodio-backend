import mongoose, { Schema, type Document, type Model } from 'mongoose';

import { AddressSchema } from '../../schemas/address.schema.js';

export type OrderStatus =
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'picked_up'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'card' | 'upi' | 'cod';
export type PaymentStatus = 'pending' | 'paid' | 'refunded';

export interface ISelectedCustomization {
  groupName: string;
  optionName: string;
  priceModifier: number;
}

export interface IOrderItem {
  menuItem: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  selectedCustomizations: ISelectedCustomization[];
  itemTotal: number;
}

export interface IStatusHistoryEntry {
  status: OrderStatus;
  timestamp: Date;
}

export interface IOrder extends Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  driver?: mongoose.Types.ObjectId;
  items: IOrderItem[];
  status: OrderStatus;
  deliveryAddress: mongoose.Types.Subdocument;
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;
  promoCode?: string;
  estimatedDelivery?: Date;
  estimatedDeliveryMinutes?: number;
  statusHistory: IStatusHistoryEntry[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderModel extends Model<IOrder> {
  findByUser(userId: mongoose.Types.ObjectId | string): Promise<IOrder[]>;
}

const selectedCustomizationSchema = new Schema<ISelectedCustomization>(
  {
    groupName: { type: String, required: true },
    optionName: { type: String, required: true },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false },
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    menuItem: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    selectedCustomizations: { type: [selectedCustomizationSchema], default: [] },
    itemTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled'],
      required: true,
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false },
);

const orderSchema = new Schema<IOrder, IOrderModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    driver: { type: Schema.Types.ObjectId, ref: 'Driver' },
    items: { type: [orderItemSchema], required: true, validate: [(v: IOrderItem[]) => v.length > 0, 'Order must have at least one item'] },
    status: {
      type: String,
      enum: ['pending_payment', 'confirmed', 'preparing', 'picked_up', 'delivered', 'cancelled'],
      default: 'pending_payment',
    },
    deliveryAddress: { type: AddressSchema, required: true },
    subtotal: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, enum: ['card', 'upi', 'cod'], required: true },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending',
    },
    stripePaymentIntentId: { type: String },
    promoCode: { type: String, trim: true, uppercase: true },
    estimatedDelivery: { type: Date },
    estimatedDeliveryMinutes: { type: Number, min: 1 },
    statusHistory: { type: [statusHistorySchema], default: [] },
  },
  { timestamps: true },
);

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ restaurant: 1, status: 1 });
orderSchema.index({ driver: 1, status: 1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ stripePaymentIntentId: 1 }, { sparse: true });

orderSchema.pre('save', function () {
  if (this.isModified('status')) {
    this.statusHistory.push({ status: this.status, timestamp: new Date() });
  }
});

orderSchema.statics.findByUser = function findByUser(userId: mongoose.Types.ObjectId | string) {
  return this.find({ user: userId }).sort({ createdAt: -1 });
};

export const Order = mongoose.model<IOrder, IOrderModel>('Order', orderSchema);
