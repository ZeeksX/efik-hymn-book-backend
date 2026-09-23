/**
 * @openapi
 * /api/v1/categories:
 *   get:
 *     tags: [Categories]
 *     summary: List all hymn categories
 *     responses:
 *       200:
 *         description: Categories list
 * /api/v1/categories/{slug}:
 *   get:
 *     tags: [Categories]
 *     summary: Get a single category by slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 */

import { Router } from 'express';
import { getCategoryBySlugController, getCategoryHymnsController, listCategoriesController } from './category.controller';

const router = Router();

router.get('/', listCategoriesController);
router.get('/:slug', getCategoryBySlugController);
router.get('/:slug/hymns', getCategoryHymnsController);

export default router;
