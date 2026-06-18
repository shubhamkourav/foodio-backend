import crypto from 'node:crypto';

import { logger } from '../../config/logger.js';
import { User } from '../users/user.model.js';
import { ApiError } from '../../utils/ApiError.js';
import { assertCondition } from '../../utils/assertions.js';
import { comparePassword, hashPassword } from '../../utils/hashPassword.js';
import { generateTokens } from '../../utils/generateTokens.js';
import { runService } from '../../utils/runService.js';

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function sendOtp(email: string, code: string, purpose: string): void {
  logger.info(`OTP for ${email} (${purpose}): ${code}`);
}

export const authService = {
  async register(input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }) {
    return runService('auth.register', async () => {
      const existing = await User.findByEmail(input.email);
      assertCondition(!existing, 409, 'Email already registered');

      const code = generateOtp();
      const passwordHash = await hashPassword(input.password);

      const user = await User.create({
        name: input.name,
        email: input.email,
        phone: input.phone,
        passwordHash,
        isVerified: false,
        otp: { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) },
      });

      sendOtp(user.email, code, 'registration');

      return {
        id: user._id.toString(),
        email: user.email,
        message: 'OTP sent to email',
      };
    });
  },

  async verifyOtp(email: string, code: string) {
    return runService('auth.verifyOtp', async () => {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+otp');
      if (!user?.otp?.code) {
        throw new ApiError(404, 'User not found');
      }

      if (user.otp.expiresAt && user.otp.expiresAt < new Date()) {
        throw new ApiError(400, 'OTP expired');
      }

      if (user.otp.code !== code) {
        throw new ApiError(400, 'Invalid OTP');
      }

      user.isVerified = true;
      user.otp = undefined;
      await user.save();

      return { verified: true };
    });
  },

  async login(email: string, password: string) {
    return runService('auth.login', async () => {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
      if (!user) {
        throw new ApiError(401, 'Invalid credentials');
      }

      if (!user.isVerified) {
        throw new ApiError(403, 'Please verify your email first');
      }

      const valid = await comparePassword(password, user.passwordHash);
      if (!valid) {
        throw new ApiError(401, 'Invalid credentials');
      }

      const tokens = generateTokens({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      user.refreshTokenHash = await hashPassword(tokens.refreshToken);
      await user.save();

      return {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        ...tokens,
      };
    });
  },

  async refresh(refreshToken: string) {
    return runService('auth.refresh', async () => {
      const users = await User.find({ refreshTokenHash: { $exists: true } }).select('+refreshTokenHash');
      let matchedUser = null;

      for (const user of users) {
        if (user.refreshTokenHash && (await comparePassword(refreshToken, user.refreshTokenHash))) {
          matchedUser = user;
          break;
        }
      }

      if (!matchedUser) {
        throw new ApiError(401, 'Invalid refresh token');
      }

      const tokens = generateTokens({
        id: matchedUser._id.toString(),
        email: matchedUser.email,
        role: matchedUser.role,
      });

      matchedUser.refreshTokenHash = await hashPassword(tokens.refreshToken);
      await matchedUser.save();

      return tokens;
    });
  },

  async logout(userId: string) {
    return runService('auth.logout', async () => {
      await User.findByIdAndUpdate(userId, { $unset: { refreshTokenHash: 1 } });
      return { loggedOut: true };
    });
  },

  async forgotPassword(email: string) {
    return runService('auth.forgotPassword', async () => {
      const user = await User.findByEmail(email);
      if (!user) {
        throw new ApiError(404, 'User not found');
      }

      const code = generateOtp();
      user.otp = { code, expiresAt: new Date(Date.now() + 10 * 60 * 1000) };
      await user.save();

      sendOtp(user.email, code, 'password-reset');
      return { message: 'Reset OTP sent' };
    });
  },

  async resetPassword(email: string, code: string, password: string) {
    return runService('auth.resetPassword', async () => {
      const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +passwordHash');
      if (!user?.otp?.code) {
        throw new ApiError(404, 'User not found');
      }

      if (user.otp.expiresAt && user.otp.expiresAt < new Date()) {
        throw new ApiError(400, 'OTP expired');
      }

      if (user.otp.code !== code) {
        throw new ApiError(400, 'Invalid OTP');
      }

      user.passwordHash = await hashPassword(password);
      user.otp = undefined;
      user.refreshTokenHash = undefined;
      await user.save();

      return { message: 'Password reset successful' };
    });
  },
};
