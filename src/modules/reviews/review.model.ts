import mongoose, { Schema, type Document, type Model } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  restaurant: mongoose.Types.ObjectId;
  order: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewModel extends Model<IReview> {
  findByRestaurant(restaurantId: mongoose.Types.ObjectId | string): Promise<IReview[]>;
}

const reviewSchema = new Schema<IReview, IReviewModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurant: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true },
);

reviewSchema.index({ restaurant: 1, createdAt: -1 });
reviewSchema.index({ user: 1, createdAt: -1 });

reviewSchema.statics.findByRestaurant = function findByRestaurant(
  restaurantId: mongoose.Types.ObjectId | string,
) {
  return this.find({ restaurant: restaurantId })
    .sort({ createdAt: -1 })
    .populate('user', 'name avatar');
};

export const Review = mongoose.model<IReview, IReviewModel>('Review', reviewSchema);
