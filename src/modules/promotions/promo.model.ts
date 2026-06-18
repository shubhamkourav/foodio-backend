import mongoose, { Schema, type Document, type Model } from 'mongoose';

export type DiscountType = 'percent' | 'fixed';

export interface IPromo extends Document {
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  minOrderAmount: number;
  maxDiscount?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  usageLimit?: number;
  usedCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPromoModel extends Model<IPromo> {
  findByCode(code: string): Promise<IPromo | null>;
  findActive(): Promise<IPromo[]>;
}

const promoSchema = new Schema<IPromo, IPromoModel>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, required: true, trim: true },
    discountType: { type: String, enum: ['percent', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minOrderAmount: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true },
);

promoSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

promoSchema.statics.findByCode = function findByCode(code: string) {
  const now = new Date();
  return this.findOne({
    code: code.toUpperCase().trim(),
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { usageLimit: { $exists: false } },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
    ],
  });
};

promoSchema.statics.findActive = function findActive() {
  const now = new Date();
  return this.find({
    isActive: true,
    validFrom: { $lte: now },
    validUntil: { $gte: now },
    $or: [
      { usageLimit: { $exists: false } },
      { $expr: { $lt: ['$usedCount', '$usageLimit'] } },
    ],
  }).sort({ validUntil: 1 });
};

export const Promo = mongoose.model<IPromo, IPromoModel>('Promo', promoSchema);
