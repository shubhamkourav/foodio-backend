import { Restaurant } from './restaurant.model.js';
import { menuService } from '../menu/menu.service.js';
import { assertAuthorized, assertCondition, assertFound, ensureFound } from '../../utils/assertions.js';
import { buildPagination, parsePageLimit } from '../../utils/pagination.js';
import { geoDistance } from '../../utils/geoDistance.js';
import { runService } from '../../utils/runService.js';
import {
  estimateDeliveryTimeHeuristic,
  kitchenPrepMinutes,
} from '../../utils/estimateDeliveryTime.js';
import { UPLOAD_FOLDERS, uploadImageToCloudinary } from '../../utils/cloudinaryUpload.js';

function formatRestaurant(
  restaurant: {
    _id: { toString(): string };
    location: { coordinates: [number, number] };
    name: string;
    slug: string;
    coverImage?: string;
    logoImage?: string;
    cuisines: string[];
    rating: number;
    reviewCount: number;
    deliveryTimeMin: number;
    deliveryFee: number;
    minOrderAmount: number;
    isOpen: boolean;
    address: string;
  },
  userLat?: number,
  userLng?: number,
) {
  const [lng, lat] = restaurant.location.coordinates;
  const distance =
    userLat !== undefined && userLng !== undefined
      ? geoDistance(userLat, userLng, lat, lng)
      : undefined;

  const deliveryEstimate =
    userLat !== undefined && userLng !== undefined
      ? estimateDeliveryTimeHeuristic({
          restaurantLat: lat,
          restaurantLng: lng,
          deliveryLat: userLat,
          deliveryLng: userLng,
          prepTimeMin: kitchenPrepMinutes(restaurant.deliveryTimeMin),
        })
      : undefined;

  return {
    id: restaurant._id.toString(),
    name: restaurant.name,
    slug: restaurant.slug,
    coverImage: restaurant.coverImage,
    logoImage: restaurant.logoImage,
    cuisine: restaurant.cuisines,
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
    deliveryTimeMin: deliveryEstimate?.totalMinutes ?? restaurant.deliveryTimeMin,
    deliveryFee: restaurant.deliveryFee,
    minOrderAmount: restaurant.minOrderAmount,
    isOpen: restaurant.isOpen,
    distance,
    coordinates: { lat, lng },
    address: restaurant.address,
    deliveryEstimate,
  };
}

async function listNearbyRestaurants(
  filter: Record<string, unknown>,
  lat: number,
  lng: number,
  radius: number,
  skip: number,
  limit: number,
) {
  const [result] = await Restaurant.aggregate<{
    items: Parameters<typeof formatRestaurant>[0][];
    totalCount: Array<{ count: number }>;
  }>([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: [lng, lat] },
        distanceField: 'distanceMeters',
        maxDistance: radius,
        spherical: true,
        query: filter,
      },
    },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: 'count' }],
      },
    },
  ]);

  return {
    restaurants: result?.items ?? [],
    total: result?.totalCount[0]?.count ?? 0,
  };
}

export const restaurantService = {
  async list(query: Record<string, unknown>) {
    return runService('restaurant.list', async () => {
      const { page, limit, skip } = parsePageLimit(query);
      const filter: Record<string, unknown> = { isActive: true };

      if (query.cuisine) {
        filter.cuisines = query.cuisine;
      }

      if (query.minRating) {
        filter.rating = { $gte: Number(query.minRating) };
      }

      const lat = query.lat !== undefined ? Number(query.lat) : undefined;
      const lng = query.lng !== undefined ? Number(query.lng) : undefined;
      const radius = query.radius !== undefined ? Number(query.radius) : 5000;

      let restaurants: Parameters<typeof formatRestaurant>[0][];
      let total: number;

      if (lat !== undefined && lng !== undefined && !Number.isNaN(lat) && !Number.isNaN(lng)) {
        const nearby = await listNearbyRestaurants(filter, lat, lng, radius, skip, limit);
        restaurants = nearby.restaurants;
        total = nearby.total;
      } else {
        restaurants = await Restaurant.find(filter).skip(skip).limit(limit).sort({ rating: -1 });
        total = await Restaurant.countDocuments(filter);
      }

      return {
        items: restaurants.map((r) => formatRestaurant(r, lat, lng)),
        pagination: buildPagination(page, limit, total),
      };
    });
  },

  async getById(id: string, userLat?: number, userLng?: number) {
    return runService('restaurant.getById', async () => {
      const restaurant = await Restaurant.findOne({ _id: id, isActive: true });
      return formatRestaurant(ensureFound(restaurant, 'Restaurant not found'), userLat, userLng);
    });
  },

  async getMenu(restaurantId: string) {
    return runService('restaurant.getMenu', async () => {
      const categories = await menuService.listCategories(restaurantId);
      return { categories };
    });
  },

  async create(ownerId: string, data: {
    name: string;
    slug: string;
    coverImage?: string;
    logoImage?: string;
    cuisines: string[];
    deliveryTimeMin: number;
    deliveryFee: number;
    minOrderAmount: number;
    isOpen?: boolean;
    lat: number;
    lng: number;
    address: string;
  }) {
    return runService('restaurant.create', async () => {
      const existing = await Restaurant.findBySlug(data.slug);
      assertCondition(!existing, 409, 'Slug already exists');

      const restaurant = await Restaurant.create({
        ...data,
        owner: ownerId,
        location: { type: 'Point', coordinates: [data.lng, data.lat] },
        isOpen: data.isOpen ?? true,
      });

      return formatRestaurant(restaurant);
    });
  },

  async update(id: string, userId: string, role: string, data: Record<string, unknown>) {
    return runService('restaurant.update', async () => {
      const restaurant = ensureFound(await Restaurant.findById(id), 'Restaurant not found');

      assertAuthorized(
        role === 'admin' || restaurant.owner.toString() === userId,
        'Not authorized to update this restaurant',
      );

      if (data.lat !== undefined && data.lng !== undefined) {
        restaurant.location = {
          type: 'Point',
          coordinates: [Number(data.lng), Number(data.lat)],
        };
        delete data.lat;
        delete data.lng;
      }

      Object.assign(restaurant, data);
      await restaurant.save();
      return formatRestaurant(restaurant);
    });
  },

  async uploadCover(
    id: string,
    userId: string,
    role: string,
    file: Express.Multer.File,
  ) {
    return runService('restaurant.uploadCover', async () => {
      const restaurant = ensureFound(await Restaurant.findById(id), 'Restaurant not found');

      assertAuthorized(
        role === 'admin' || restaurant.owner.toString() === userId,
        'Not authorized to update this restaurant',
      );

      const { url } = await uploadImageToCloudinary(file, UPLOAD_FOLDERS.restaurantCovers);
      restaurant.coverImage = url;
      await restaurant.save();
      return formatRestaurant(restaurant);
    });
  },

  async uploadLogo(
    id: string,
    userId: string,
    role: string,
    file: Express.Multer.File,
  ) {
    return runService('restaurant.uploadLogo', async () => {
      const restaurant = ensureFound(await Restaurant.findById(id), 'Restaurant not found');

      assertAuthorized(
        role === 'admin' || restaurant.owner.toString() === userId,
        'Not authorized to update this restaurant',
      );

      const { url } = await uploadImageToCloudinary(file, UPLOAD_FOLDERS.restaurantLogos);
      restaurant.logoImage = url;
      await restaurant.save();
      return formatRestaurant(restaurant);
    });
  },
};
