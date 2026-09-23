import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import User from '../modules/users/user.model';
import { AuthenticationError, NotFoundError } from '../shared/errors';

interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) {
      throw new AuthenticationError();
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtPayload;
    const user = await User.findById(decoded.sub).select('-passwordHash').lean();

    if (!user) {
      throw new NotFoundError('User not found.', 'USER_NOT_FOUND');
    }

    req.user = {
      id: String(user._id),
      email: String(user.email),
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    next(error instanceof Error ? error : new AuthenticationError());
  }
};
