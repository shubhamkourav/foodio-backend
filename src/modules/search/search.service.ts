import type { Types } from 'mongoose';

import { Cuisine } from '../cuisines/cuisine.model.js';
import { MenuItem } from '../menu/menuItem.model.js';
import { Restaurant } from '../restaurants/restaurant.model.js';
import { formatRestaurant } from '../restaurants/restaurant.service.js';
import { buildPagination, parsePageLimit } from '../../utils/pagination.js';
import { runService } from '../../utils/runService.js';

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function getNearbyRestaurantIds(lat: number, lng: number, radius: number) {
  const nearby = await Restaurant.aggregate<{ _id: Types.ObjectId }>([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance: radius,
        spherical: true,
        query: { isActive: true },
      },
    },
    { $project: { _id: 1 } },
  ]);

  return nearby.map((item) => item._id);
}

async function getMatchedCuisineNames(pattern: RegExp) {
  const cuisines = await Cuisine.find({ isActive: true });
  return cuisines
    .filter(
      (cuisine) =>
        pattern.test(cuisine.name) ||
        cuisine.matchers.some((matcher) => pattern.test(matcher)),
    )
    .map((cuisine) => cuisine.name);
}

export const searchService = {
  async search(query: Record<string, unknown>) {
    return runService('search.query', async () => {
      const term = String(query.q ?? '').trim();
      const { page, limit, skip } = parsePageLimit(query);
      const pattern = new RegExp(escapeRegex(term), 'i');

      const lat = query.lat !== undefined ? Number(query.lat) : undefined;
      const lng = query.lng !== undefined ? Number(query.lng) : undefined;
      const radius = query.radius !== undefined ? Number(query.radius) : 12000;

      const nearbyIds =
        lat !== undefined &&
        lng !== undefined &&
        !Number.isNaN(lat) &&
        !Number.isNaN(lng)
          ? await getNearbyRestaurantIds(lat, lng, radius)
          : null;

      const scopeFilter =
        nearbyIds !== null && nearbyIds.length > 0
          ? { _id: { $in: nearbyIds } }
          : { isActive: true };

      const matchedCuisineNames = await getMatchedCuisineNames(pattern);

      const restaurantFilter = {
        ...scopeFilter,
        isActive: true,
        $or: [
          { name: pattern },
          { cuisines: pattern },
          ...(matchedCuisineNames.length > 0
            ? [{ cuisines: { $in: matchedCuisineNames } }]
            : []),
        ],
      };

      const menuFilter = {
        isAvailable: true,
        ...(nearbyIds !== null && nearbyIds.length > 0
          ? { restaurant: { $in: nearbyIds } }
          : {}),
        $or: [{ name: pattern }, { description: pattern }, { tags: pattern }],
      };

      const [restaurantMatches, dishMatches] = await Promise.all([
        Restaurant.find(restaurantFilter),
        MenuItem.find(menuFilter).select('restaurant name').limit(200),
      ]);

      const dishMatchesByRestaurant = new Map<string, string[]>();
      for (const dish of dishMatches) {
        const restaurantId = dish.restaurant.toString();
        const existing = dishMatchesByRestaurant.get(restaurantId) ?? [];
        if (!existing.includes(dish.name)) {
          existing.push(dish.name);
        }
        dishMatchesByRestaurant.set(restaurantId, existing);
      }

      const results = new Map<
        string,
        {
          restaurant: Parameters<typeof formatRestaurant>[0];
          matchedDishes: string[];
          score: number;
        }
      >();

      for (const restaurant of restaurantMatches) {
        const id = restaurant._id.toString();
        const matchedDishes = dishMatchesByRestaurant.get(id) ?? [];
        const nameMatch = pattern.test(restaurant.name);
        const cuisineMatch = restaurant.cuisines.some((cuisine) => pattern.test(cuisine));
        const score = (nameMatch ? 3 : 0) + (matchedDishes.length > 0 ? 2 : 0) + (cuisineMatch ? 1 : 0);

        results.set(id, {
          restaurant,
          matchedDishes,
          score,
        });
      }

      const dishOnlyRestaurantIds = [
        ...new Set(
          dishMatches
            .map((dish) => dish.restaurant.toString())
            .filter((restaurantId) => !results.has(restaurantId)),
        ),
      ];

      if (dishOnlyRestaurantIds.length > 0) {
        const dishOnlyRestaurants = await Restaurant.find({
          _id: { $in: dishOnlyRestaurantIds },
          isActive: true,
        });

        for (const restaurant of dishOnlyRestaurants) {
          const restaurantId = restaurant._id.toString();
          results.set(restaurantId, {
            restaurant,
            matchedDishes: dishMatchesByRestaurant.get(restaurantId) ?? [],
            score: 2,
          });
        }
      }

      const sorted = [...results.values()].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        return b.restaurant.rating - a.restaurant.rating;
      });

      const total = sorted.length;
      const pageItems = sorted.slice(skip, skip + limit);

      return {
        items: pageItems.map(({ restaurant, matchedDishes }) => ({
          ...formatRestaurant(restaurant, lat, lng),
          matchedDishes,
        })),
        pagination: buildPagination(page, limit, total),
      };
    });
  },
};
