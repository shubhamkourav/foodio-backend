import mongoose from 'mongoose';

import { connectDb } from '../config/db.js';
import { logger } from '../config/logger.js';
import { hashPassword } from '../utils/hashPassword.js';
import { Cuisine } from '../modules/cuisines/cuisine.model.js';
import { User } from '../modules/users/user.model.js';
import { Restaurant } from '../modules/restaurants/restaurant.model.js';
import { MenuCategory } from '../modules/menu/menuCategory.model.js';
import { MenuItem } from '../modules/menu/menuItem.model.js';
import { Promo } from '../modules/promotions/promo.model.js';
import {
  buildUserAddress,
  countGeneratedDishes,
  generateMenus,
  generateRestaurants,
  getCuisineSeedData,
} from './indiaGenerators.js';
import { INDIAN_CITIES, SEED_PROMOS, SEED_USERS } from './indiaData.js';

export async function runIndiaSeed() {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    MenuCategory.deleteMany({}),
    MenuItem.deleteMany({}),
    Promo.deleteMany({}),
    Cuisine.deleteMany({}),
  ]);

  const passwordHash = await hashPassword('Password123!');
  const cuisines = await Cuisine.insertMany(getCuisineSeedData());

  const adminSeed = SEED_USERS[0];
  const admin = await User.create({
    name: adminSeed.name,
    email: adminSeed.email,
    phone: adminSeed.phone,
    passwordHash,
    role: adminSeed.role,
    isVerified: true,
    addresses: [buildUserAddress(INDIAN_CITIES[0], 0)],
  });

  const users = await User.insertMany(
    SEED_USERS.slice(1).map((seedUser, index) => ({
      name: seedUser.name,
      email: seedUser.email,
      phone: seedUser.phone,
      passwordHash,
      role: seedUser.role,
      isVerified: true,
      addresses: [
        buildUserAddress(INDIAN_CITIES[(index + 1) % INDIAN_CITIES.length], index + 1),
        ...(index % 2 === 0
          ? [buildUserAddress(INDIAN_CITIES[(index + 3) % INDIAN_CITIES.length], index + 20, 'Work')]
          : []),
      ],
    })),
  );

  const restaurantSeeds = generateRestaurants();
  const menuSeeds = generateMenus(restaurantSeeds);

  const restaurants = await Restaurant.insertMany(
    restaurantSeeds.map((seed) => ({
      name: seed.name,
      slug: seed.slug,
      owner: admin._id,
      coverImage: seed.coverImage,
      logoImage: seed.logoImage,
      cuisines: seed.cuisines,
      rating: seed.rating,
      reviewCount: seed.reviewCount,
      deliveryTimeMin: seed.deliveryTimeMin,
      deliveryFee: seed.deliveryFee,
      minOrderAmount: seed.minOrderAmount,
      isOpen: seed.isOpen,
      location: { type: 'Point', coordinates: [seed.lng, seed.lat] },
      address: seed.address,
      isActive: true,
    })),
  );

  const restaurantBySlug = new Map(restaurants.map((restaurant) => [restaurant.slug, restaurant]));
  let menuItemCount = 0;

  for (const menu of menuSeeds) {
    const restaurant = restaurantBySlug.get(menu.restaurantSlug);
    if (!restaurant) continue;

    const categoryIds = new Map<string, mongoose.Types.ObjectId>();

    for (const category of menu.categories) {
      const doc = await MenuCategory.create({
        restaurant: restaurant._id,
        name: category.name,
        sortOrder: category.sortOrder,
      });
      categoryIds.set(category.name, doc._id);
    }

    const items = menu.items.map((item) => {
      const categoryId = categoryIds.get(item.categoryName);
      if (!categoryId) {
        throw new Error(`Missing category for ${menu.restaurantSlug} / ${item.categoryName}`);
      }

      return {
        restaurant: restaurant._id,
        category: categoryId,
        name: item.name,
        description: item.description,
        image: item.image,
        price: item.price,
        isAvailable: true,
        isPopular: item.isPopular ?? false,
        isVeg: item.isVeg,
        tags: item.tags ?? (item.isVeg ? ['veg'] : ['non-veg']),
      };
    });

    await MenuItem.insertMany(items);
    menuItemCount += items.length;
  }

  await Promo.insertMany(SEED_PROMOS);

  logger.info('India seed completed', {
    cuisines: cuisines.length,
    admin: admin.email,
    users: users.length + 1,
    restaurants: restaurants.length,
    menuItems: menuItemCount,
    promos: SEED_PROMOS.length,
    password: 'Password123!',
    sampleLogins: SEED_USERS.slice(0, 3).map((user) => user.email),
    primaryCity: 'Mumbai (clustered for nearby search)',
  });

  await mongoose.disconnect();
}
