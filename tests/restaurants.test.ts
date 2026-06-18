import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';

import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/testDb';
import { createTestUser } from './helpers/factories';
import { Restaurant } from '../src/modules/restaurants/restaurant.model.js';

describe('Restaurants API', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('lists restaurants', async () => {
    const owner = await createTestUser({ role: 'admin' });

    await Restaurant.create({
      name: 'Test Pizza',
      slug: 'test-pizza',
      owner: owner._id,
      cuisines: ['Pizza'],
      deliveryTimeMin: 30,
      deliveryFee: 2.99,
      minOrderAmount: 10,
      isOpen: true,
      location: { type: 'Point', coordinates: [-122.4194, 37.7749] },
      address: '123 Test St',
      isActive: true,
    });

    const res = await request(app).get('/api/v1/restaurants');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('Test Pizza');
  });

  it('returns 400 for invalid restaurant id', async () => {
    const res = await request(app).get('/api/v1/restaurants/not-an-id');

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Validation failed');
    expect(res.body.errors).toEqual(
      expect.arrayContaining([expect.stringContaining('Invalid id format')]),
    );
  });

  it('returns 404 for unknown restaurant id', async () => {
    const res = await request(app).get('/api/v1/restaurants/507f1f77bcf86cd799439011');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe('Restaurant not found');
  });
});
