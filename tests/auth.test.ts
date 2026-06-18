import request from 'supertest';
import { afterAll, afterEach, beforeAll, describe, expect, it } from '@jest/globals';

import app from '../src/app.js';
import { connectTestDb, clearTestDb, disconnectTestDb } from './helpers/testDb';
import { createTestUser } from './helpers/factories';

describe('Auth API', () => {
  beforeAll(async () => {
    await connectTestDb();
  });

  afterEach(async () => {
    await clearTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  it('registers a new user', async () => {
    const res = await request(app).post('/api/v1/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@foodio.app',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.email).toBe('jane@foodio.app');
  });

  it('logs in a verified user', async () => {
    await createTestUser({ email: 'login@foodio.app', isVerified: true });

    const res = await request(app).post('/api/v1/auth/login').send({
      email: 'login@foodio.app',
      password: 'Password123!',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.accessToken).toBeDefined();
    expect(res.body.data.refreshToken).toBeDefined();
  });
});
