import { hashPassword } from '../../src/utils/hashPassword.js';
import { User } from '../../src/modules/users/user.model.js';

export async function createTestUser(overrides: Partial<{
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin' | 'driver';
  isVerified: boolean;
}> = {}) {
  const password = overrides.password ?? 'Password123!';
  const passwordHash = await hashPassword(password);

  return User.create({
    name: overrides.name ?? 'Test User',
    email: overrides.email ?? `test-${Date.now()}@foodio.app`,
    passwordHash,
    role: overrides.role ?? 'user',
    isVerified: overrides.isVerified ?? true,
  });
}
