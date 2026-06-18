import { Driver } from './driver.model.js';
import { ensureFound } from '../../utils/assertions.js';
import { runService } from '../../utils/runService.js';

export const driverService = {
  async getByUserId(userId: string) {
    return runService('driver.getByUserId', async () => {
      return ensureFound(await Driver.findByUserId(userId), 'Driver profile not found');
    });
  },

  async updateLocation(userId: string, lat: number, lng: number) {
    return runService('driver.updateLocation', async () => {
      const driver = ensureFound(await Driver.findByUserId(userId), 'Driver profile not found');

      driver.currentLocation = { type: 'Point', coordinates: [lng, lat] };
      await driver.save();
      return { updated: true };
    });
  },
};
