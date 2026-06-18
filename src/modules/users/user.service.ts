import mongoose from 'mongoose';

import { User } from './user.model.js';
import { assertFound, ensureFound } from '../../utils/assertions.js';
import { runService } from '../../utils/runService.js';

function sanitizeUser(user: InstanceType<typeof User>) {
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatar: user.avatar,
    addresses: user.addresses,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
  };
}

async function getUserOrThrow(userId: string) {
  return ensureFound(await User.findById(userId), 'User not found');
}

export const userService = {
  async getProfile(userId: string) {
    return runService('user.getProfile', async () => {
      const user = await getUserOrThrow(userId);
      return sanitizeUser(user);
    });
  },

  async updateProfile(userId: string, data: { name?: string; avatar?: string }) {
    return runService('user.updateProfile', async () => {
      const user = ensureFound(
        await User.findByIdAndUpdate(userId, data, { new: true }),
        'User not found',
      );
      return sanitizeUser(user);
    });
  },

  async listAddresses(userId: string) {
    return runService('user.listAddresses', async () => {
      const user = await getUserOrThrow(userId);
      return user.addresses;
    });
  },

  async addAddress(
    userId: string,
    address: {
      label: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      lat: number;
      lng: number;
      isDefault?: boolean;
      deliveryOption?: 'meet_outside' | 'meet_at_door' | 'leave_at_door';
      deliveryInstructions?: string;
    },
  ) {
    return runService('user.addAddress', async () => {
      const user = await getUserOrThrow(userId);

      if (address.isDefault) {
        user.addresses.forEach((addr) => {
          addr.set('isDefault', false);
        });
      }

      user.addresses.push(address as never);
      await user.save();
      return user.addresses[user.addresses.length - 1];
    });
  },

  async updateAddress(
    userId: string,
    addressId: string,
    updates: Partial<{
      label: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      lat: number;
      lng: number;
      isDefault: boolean;
      deliveryOption: 'meet_outside' | 'meet_at_door' | 'leave_at_door';
      deliveryInstructions: string;
    }>,
  ) {
    return runService('user.updateAddress', async () => {
      const user = await getUserOrThrow(userId);

      const address = user.addresses.id(new mongoose.Types.ObjectId(addressId));
      assertFound(address, 'Address not found');

      if (updates.isDefault) {
        user.addresses.forEach((addr) => {
          addr.set('isDefault', false);
        });
      }

      Object.assign(address, updates);
      await user.save();
      return address;
    });
  },

  async deleteAddress(userId: string, addressId: string) {
    return runService('user.deleteAddress', async () => {
      const user = await getUserOrThrow(userId);

      const address = user.addresses.id(new mongoose.Types.ObjectId(addressId));
      assertFound(address, 'Address not found');

      address.deleteOne();
      await user.save();
      return { deleted: true };
    });
  },
};
