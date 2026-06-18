import mongoose, { Schema, type Document, type Model } from 'mongoose';

import { AddressSchema } from '../../schemas/address.schema.js';

export type UserRole = 'user' | 'driver' | 'admin';

export interface ISavedPaymentMethod {
  stripePaymentMethodId: string;
  last4: string;
  brand: string;
}

export interface IUserOtp {
  code?: string;
  expiresAt?: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  role: UserRole;
  avatar?: string;
  addresses: mongoose.Types.DocumentArray<mongoose.Types.Subdocument>;
  savedPaymentMethods: ISavedPaymentMethod[];
  refreshTokenHash?: string;
  isVerified: boolean;
  otp?: IUserOtp;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserModel extends Model<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
}

const userSchema = new Schema<IUser, IUserModel>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ['user', 'driver', 'admin'],
      default: 'user',
    },
    avatar: { type: String },
    addresses: [AddressSchema],
    savedPaymentMethods: [
      {
        stripePaymentMethodId: { type: String, required: true },
        last4: { type: String, required: true },
        brand: { type: String, required: true },
      },
    ],
    refreshTokenHash: { type: String, select: false },
    isVerified: { type: Boolean, default: false },
    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
    },
  },
  { timestamps: true },
);

userSchema.index({ role: 1 });
userSchema.index({ isVerified: 1 });

userSchema.statics.findByEmail = function findByEmail(email: string) {
  return this.findOne({ email: email.toLowerCase().trim() });
};

export const User = mongoose.model<IUser, IUserModel>('User', userSchema);
