import type { NextFunction, Request, Response } from 'express';
import { ConflictError, AuthenticationError } from '../../shared/errors';
import { getUserProfile, loginUser, registerUser, refreshToken } from './auth.service';

export const registerController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error instanceof Error ? error : new ConflictError('Registration failed.', 'CONFLICT'));
  }
};

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await loginUser(req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error instanceof Error ? error : new AuthenticationError('Login failed.'));
  }
};

export const refreshController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await refreshToken(req.body.refreshToken);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error instanceof Error ? error : new AuthenticationError('Could not refresh the session.'));
  }
};

export const logoutController = (_req: Request, res: Response) => {
  res.json({ success: true, data: { loggedOut: true } });
};

export const meController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    if (!user) {
      throw new AuthenticationError();
    }

    const profile = await getUserProfile(user.id);
    res.json({ success: true, data: profile });
  } catch (error) {
    next(error instanceof Error ? error : new AuthenticationError());
  }
};
