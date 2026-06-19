import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';

import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/testDb';
import { createTestUser } from './helpers/factories';
import { MenuCategory } from '../src/modules/menu/menuCategory.model.js';
import { MenuItem } from '../src/modules/menu/menuItem.model.js';
import { Restaurant } from '../src/modules/restaurants/restaurant.model.js';

describe('Search API', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('searches restaurants and dishes by query', async () => {
    const owner = await createTestUser({ role: 'admin' });

    const restaurant = await Restaurant.create({
      name: 'Spice Route Biryani House',
      slug: 'spice-route-biryani',
      owner: owner._id,
      cuisines: ['Biryani', 'North Indian'],
      deliveryTimeMin: 30,
      deliveryFee: 40,
      minOrderAmount: 149,
      isOpen: true,
      location: { type: 'Point', coordinates: [72.8777, 19.076] },
      address: 'Bandra West, Mumbai',
      isActive: true,
    });

    const category = await MenuCategory.create({
      restaurant: restaurant._id,
      name: 'Biryani',
      sortOrder: 1,
    });

    await MenuItem.create({
      restaurant: restaurant._id,
      category: category._id,
      name: 'Hyderabadi Chicken Biryani',
      price: 299,
      isAvailable: true,
      isVeg: false,
      tags: ['biryani', 'chicken'],
    });

    const res = await request(app).get('/api/v1/search').query({
      q: 'biryani',
      lat: 19.076,
      lng: 72.8777,
      radius: 12000,
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].name).toContain('Biryani');
    expect(res.body.data[0].matchedDishes).toEqual(
      expect.arrayContaining(['Hyderabadi Chicken Biryani']),
    );
  });
});
