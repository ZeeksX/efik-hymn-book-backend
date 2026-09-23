import type { NextFunction, Request, Response } from 'express';
import { ZodError, type AnyZodObject } from 'zod';
import { ValidationError } from '../shared/errors';

export const validate = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const fields = error.flatten().fieldErrors;
        next(new ValidationError('Invalid request.', fields as Record<string, unknown>));
        return;
      }

      next(error);
    }
  };
};
