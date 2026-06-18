import { Schema } from 'mongoose';

export const AddressSchema = new Schema(
  {
    label: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
    deliveryOption: {
      type: String,
      enum: ['meet_outside', 'meet_at_door', 'leave_at_door'],
    },
    deliveryInstructions: { type: String, trim: true },
  },
  { _id: true },
);
