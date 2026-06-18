import { Cuisine } from './cuisine.model.js';
import { runService } from '../../utils/runService.js';

export const cuisineService = {
  async listActive() {
    return runService('cuisine.listActive', async () => {
      const cuisines = await Cuisine.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
      return cuisines.map((cuisine) => ({
        id: cuisine._id.toString(),
        name: cuisine.name,
        slug: cuisine.slug,
        emoji: cuisine.emoji,
        sortOrder: cuisine.sortOrder,
        matchers: cuisine.matchers,
      }));
    });
  },
};
