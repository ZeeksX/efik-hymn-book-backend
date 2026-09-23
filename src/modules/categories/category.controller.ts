import type { NextFunction, Request, Response } from 'express';
import { listCategories, getCategoryBySlug, getCategoryHymns } from './category.service';

export const listCategoriesController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await listCategories();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const getCategoryBySlugController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await getCategoryBySlug(req.params.slug);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const getCategoryHymnsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const hymns = await getCategoryHymns(req.params.slug);
    res.json({ success: true, data: hymns });
  } catch (error) {
    next(error);
  }
};
