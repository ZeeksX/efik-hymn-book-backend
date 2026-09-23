/**
 * @openapi
 * /api/v1/search:
 *   get:
 *     tags: [Search]
 *     summary: Search hymns by number, title, lyrics, and tags
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search text
 *     responses:
 *       200:
 *         description: Matching hymns
 */

import { Router } from 'express';
import { searchController } from '../hymns/hymn.controller';

const router = Router();

router.get('/', searchController);

export default router;
