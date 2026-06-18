import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IRestaurant extends Document {
  name: string;
  slug: string;
  owner: mongoose.Types.ObjectId;
  coverImage?: string;
  logoImage?: string;
  cuisines: string[];
  rating: number;
  reviewCount: number;
  deliveryTimeMin: number;
  deliveryFee: number;
  minOrderAmount: number;
  isOpen: boolean;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  address: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRestaurantModel extends Model<IRestaurant> {
  findBySlug(slug: string): Promise<IRestaurant | null>;
}

const restaurantSchema = new Schema<IRestaurant, IRestaurantModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    coverImage: { type: String },
    logoImage: { type: String },
    cuisines: [{ type: String, trim: true }],
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0, min: 0 },
    deliveryTimeMin: { type: Number, required: true, min: 0 },
    deliveryFee: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, required: true, min: 0 },
    isOpen: { type: Boolean, default: true },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String, required: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

restaurantSchema.index({ location: '2dsphere' });
restaurantSchema.index({ cuisines: 1 });
restaurantSchema.index({ rating: -1 });
restaurantSchema.index({ isActive: 1, isOpen: 1 });

restaurantSchema.statics.findBySlug = function findBySlug(slug: string) {
  return this.findOne({ slug: slug.toLowerCase().trim(), isActive: true });
};

export const Restaurant = mongoose.model<IRestaurant, IRestaurantModel>(
  'Restaurant',
  restaurantSchema,
);
