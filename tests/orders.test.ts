import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';

import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/testDb';
import { createTestUser } from './helpers/factories';
import { authService } from '../src/modules/auth/auth.service.js';
import { Restaurant } from '../src/modules/restaurants/restaurant.model.js';
import { MenuCategory } from '../src/modules/menu/menuCategory.model.js';
import { MenuItem } from '../src/modules/menu/menuItem.model.js';

describe('Orders API', () => {
  let accessToken = '';
  let restaurantId = '';
  let menuItemId = '';

  beforeAll(async () => {
    await connectTestDb();
  });

  beforeEach(async () => {
    await createTestUser({ email: 'orderuser@foodio.app' });
    const login = await authService.login('orderuser@foodio.app', 'Password123!');
    accessToken = login.accessToken;

    const owner = await createTestUser({ email: 'owner@foodio.app', role: 'admin' });
    const restaurant = await Restaurant.create({
      name: 'Order Test Restaurant',
      slug: 'order-test',
      owner: owner._id,
      cuisines: ['Test'],
      deliveryTimeMin: 20,
      deliveryFee: 2,
      minOrderAmount: 5,
      isOpen: true,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      address: '1 Order St',
      isActive: true,
    });
    restaurantId = restaurant._id.toString();

    const category = await MenuCategory.create({
      restaurant: restaurant._id,
      name: 'Main',
      sortOrder: 1,
    });

    const item = await MenuItem.create({
      restaurant: restaurant._id,
      category: category._id,
      name: 'Test Item',
      price: 10,
      isAvailable: true,
    });
    menuItemId = item._id.toString();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('places a COD order', async () => {
    const res = await request(app)
      .post('/api/v1/orders')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        restaurantId,
        items: [{ menuItemId, quantity: 2 }],
        deliveryAddress: {
          label: 'Home',
          street: '123 Main',
          city: 'SF',
          state: 'CA',
          zipCode: '94102',
          lat: 37.7749,
          lng: -122.4194,
        },
        paymentMethod: 'cod',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.order.status).toBe('confirmed');
    expect(res.body.data.order.total).toBeGreaterThan(0);
  });
});
