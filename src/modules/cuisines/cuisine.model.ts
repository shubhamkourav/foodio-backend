import mongoose, { type InferSchemaType } from 'mongoose';

const cuisineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, trim: true, lowercase: true, unique: true },
    emoji: { type: String, required: true, trim: true },
    sortOrder: { type: Number, default: 0 },
    matchers: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

cuisineSchema.index({ isActive: 1, sortOrder: 1 });

export type CuisineDocument = InferSchemaType<typeof cuisineSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const Cuisine = mongoose.model('Cuisine', cuisineSchema);
