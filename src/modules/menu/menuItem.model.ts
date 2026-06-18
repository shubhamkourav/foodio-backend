import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface ICustomizationOption {
  name: string;
  priceModifier: number;
}

export interface ICustomization {
  groupName: string;
  required: boolean;
  multiSelect: boolean;
  options: ICustomizationOption[];
}

export interface IMenuItem extends Document {
  restaurant: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  image?: string;
  price: number;
  isAvailable: boolean;
  isPopular: boolean;
  isVeg: boolean;
  customizations: ICustomization[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuItemModel extends Model<IMenuItem> {
  findByRestaurant(restaurantId: mongoose.Types.ObjectId | string): Promise<IMenuItem[]>;
}

const customizationOptionSchema = new Schema<ICustomizationOption>(
  {
    name: { type: String, required: true, trim: true },
    priceModifier: { type: Number, default: 0 },
  },
  { _id: false },
);

const customizationSchema = new Schema<ICustomization>(
  {
    groupName: { type: String, required: true, trim: true },
    required: { type: Boolean, default: false },
    multiSelect: { type: Boolean, default: false },
    options: { type: [customizationOptionSchema], default: [] },
  },
  { _id: false },
);

const menuItemSchema = new Schema<IMenuItem, IMenuItemModel>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    image: { type: String },
    price: { type: Number, required: true, min: 0 },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    isVeg: { type: Boolean, default: false },
    customizations: { type: [customizationSchema], default: [] },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true },
);

menuItemSchema.index({ restaurant: 1, category: 1 });
menuItemSchema.index({ restaurant: 1, isAvailable: 1 });
menuItemSchema.index({ restaurant: 1, isAvailable: 1, category: 1, name: 1 });
menuItemSchema.index({ restaurant: 1, isPopular: 1 });
menuItemSchema.index({ tags: 1 });

menuItemSchema.statics.findByRestaurant = function findByRestaurant(
  restaurantId: mongoose.Types.ObjectId | string,
) {
  return this.find({ restaurant: restaurantId, isAvailable: true }).sort({ name: 1 });
};

export const MenuItem = mongoose.model<IMenuItem, IMenuItemModel>('MenuItem', menuItemSchema);
