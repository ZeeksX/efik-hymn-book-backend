import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import User from '../users/user.model';
import { ConflictError, NotFoundError, AuthenticationError } from '../../shared/errors';
import { normalizeEmail } from '../../shared/utils/normalize';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export const sanitizeUser = (user: Record<string, any>) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
  status: user.status,
  emailVerified: user.emailVerified,
  avatarUrl: user.avatarUrl,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const signToken = (user: { id: string; role: string }, expiresIn: string, secret: string) =>
  jwt.sign({ sub: user.id, role: user.role }, secret, { expiresIn });

export const registerUser = async (payload: RegisterInput) => {
  const email = normalizeEmail(payload.email);
  const existing = await User.findOne({ emailNormalized: email });

  if (existing) {
    throw new ConflictError('A user with that email already exists.', 'CONFLICT');
  }

  const passwordHash = await argon2.hash(payload.password);
  const user = await User.create({
    name: payload.name,
    email,
    emailNormalized: email,
    passwordHash,
    role: 'user',
    status: 'active',
  });

  const accessToken = signToken({ id: String(user._id), role: user.role }, env.JWT_ACCESS_EXPIRES_IN, env.JWT_ACCESS_SECRET);
  const refreshToken = signToken({ id: String(user._id), role: user.role }, env.JWT_REFRESH_EXPIRES_IN, env.JWT_REFRESH_SECRET);

  return {
    user: sanitizeUser(user.toObject()),
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (payload: LoginInput) => {
  const email = normalizeEmail(payload.email);
  const user = await User.findOne({ emailNormalized: email }).select('+passwordHash');

  if (!user) {
    throw new AuthenticationError('Invalid email or password.');
  }

  const isValid = await argon2.verify(String(user.passwordHash), payload.password);

  if (!isValid) {
    throw new AuthenticationError('Invalid email or password.');
  }

  if (user.status !== 'active') {
    throw new AuthenticationError('This account is suspended.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const accessToken = signToken({ id: String(user._id), role: user.role }, env.JWT_ACCESS_EXPIRES_IN, env.JWT_ACCESS_SECRET);
  const refreshToken = signToken({ id: String(user._id), role: user.role }, env.JWT_REFRESH_EXPIRES_IN, env.JWT_REFRESH_SECRET);

  return {
    user: sanitizeUser(user.toObject()),
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (refreshTokenValue: string) => {
  try {
    const payload = jwt.verify(refreshTokenValue, env.JWT_REFRESH_SECRET) as { sub: string; role: string };
    const user = await User.findById(payload.sub).select('-passwordHash');

    if (!user) {
      throw new NotFoundError('User not found.', 'USER_NOT_FOUND');
    }

    const accessToken = signToken({ id: String(user._id), role: user.role }, env.JWT_ACCESS_EXPIRES_IN, env.JWT_ACCESS_SECRET);

    return {
      accessToken,
      user: sanitizeUser(user.toObject()),
    };
  } catch {
    throw new AuthenticationError('The refresh token is invalid or expired.');
  }
};

export const getUserProfile = async (id: string) => {
  const user = await User.findById(id).select('-passwordHash');

  if (!user) {
    throw new NotFoundError('User not found.', 'USER_NOT_FOUND');
  }

  return sanitizeUser(user.toObject());
};
