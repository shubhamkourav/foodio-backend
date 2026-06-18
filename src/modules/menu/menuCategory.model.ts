import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IMenuCategory extends Document {
  restaurant: mongoose.Types.ObjectId;
  name: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMenuCategoryModel extends Model<IMenuCategory> {
  findByRestaurant(restaurantId: mongoose.Types.ObjectId | string): Promise<IMenuCategory[]>;
}

const menuCategorySchema = new Schema<IMenuCategory, IMenuCategoryModel>(
  {
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    name: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

menuCategorySchema.index({ restaurant: 1, sortOrder: 1 });
menuCategorySchema.index({ restaurant: 1, name: 1 }, { unique: true });

menuCategorySchema.statics.findByRestaurant = function findByRestaurant(
  restaurantId: mongoose.Types.ObjectId | string,
) {
  return this.find({ restaurant: restaurantId }).sort({ sortOrder: 1, name: 1 });
};

export const MenuCategory = mongoose.model<IMenuCategory, IMenuCategoryModel>(
  'MenuCategory',
  menuCategorySchema,
);
