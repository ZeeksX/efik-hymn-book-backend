import type { NextFunction, Request, Response } from 'express';
import { ValidationError } from '../../shared/errors';
import { getHymnByNumber, listHymns, relatedHymns, searchHymns, getRandomHymn } from './hymn.service';

export const listHymnsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const data = await listHymns({
      page,
      limit,
      category: typeof req.query.category === 'string' ? req.query.category : undefined,
      letter: typeof req.query.letter === 'string' ? req.query.letter : undefined,
      sort: (typeof req.query.sort === 'string' ? req.query.sort : 'number') as 'number' | 'title' | 'createdAt' | 'updatedAt',
      order: (typeof req.query.order === 'string' ? req.query.order : 'asc') as 'asc' | 'desc',
    });

    res.json({ success: true, data: data.items, meta: data.meta });
  } catch (error) {
    next(error);
  }
};

export const getHymnByNumberController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const number = Number(req.params.number);
    if (!Number.isFinite(number)) {
      throw new ValidationError('The hymn number must be a valid integer.', { number: req.params.number });
    }

    const hymn = await getHymnByNumber(number);
    res.json({ success: true, data: hymn });
  } catch (error) {
    next(error);
  }
};

export const randomHymnController = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const hymn = await getRandomHymn();
    res.json({ success: true, data: hymn });
  } catch (error) {
    next(error);
  }
};

export const relatedHymnsController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const number = Number(req.params.number);
    const items = await relatedHymns(number);
    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};

export const searchController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = typeof req.query.q === 'string' ? req.query.q : '';
    const results = await searchHymns(q);
    res.json({ success: true, data: results });
  } catch (error) {
    next(error);
  }
};
