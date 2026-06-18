import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IDriver extends Document {
  user: mongoose.Types.ObjectId;
  vehicleType: string;
  vehicleNumber: string;
  isOnline: boolean;
  currentLocation?: {
    type: 'Point';
    coordinates: [number, number];
  };
  activeOrder?: mongoose.Types.ObjectId;
  rating: number;
  totalDeliveries: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDriverModel extends Model<IDriver> {
  findOnline(): Promise<IDriver[]>;
  findByUserId(userId: mongoose.Types.ObjectId | string): Promise<IDriver | null>;
}

const driverSchema = new Schema<IDriver, IDriverModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    vehicleType: { type: String, required: true, trim: true },
    vehicleNumber: { type: String, required: true, trim: true, uppercase: true },
    isOnline: { type: Boolean, default: false },
    currentLocation: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
      },
    },
    activeOrder: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    totalDeliveries: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

driverSchema.index({ currentLocation: '2dsphere' });
driverSchema.index({ isOnline: 1 });

driverSchema.statics.findOnline = function findOnline() {
  return this.find({ isOnline: true });
};

driverSchema.statics.findByUserId = function findByUserId(
  userId: mongoose.Types.ObjectId | string,
) {
  return this.findOne({ user: userId });
};

export const Driver = mongoose.model<IDriver, IDriverModel>('Driver', driverSchema);
