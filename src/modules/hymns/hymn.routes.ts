/**
 * @openapi
 * /api/v1/hymns:
 *   get:
 *     tags: [Hymns]
 *     summary: List published hymns
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: letter
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Published hymn list
 * /api/v1/hymns/random:
 *   get:
 *     tags: [Hymns]
 *     summary: Return a random published hymn
 *     responses:
 *       200:
 *         description: A random hymn
 * /api/v1/hymns/{number}:
 *   get:
 *     tags: [Hymns]
 *     summary: Get a hymn by hymn number
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Hymn details
 *       404:
 *         description: Hymn not found
 */

import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { hymnNumberParamSchema, hymnQuerySchema } from './hymn.schema';
import { getHymnByNumberController, listHymnsController, randomHymnController, relatedHymnsController } from './hymn.controller';

const router = Router();

router.get('/', validate(hymnQuerySchema), listHymnsController);
router.get('/random', randomHymnController);
router.get('/:number/related', validate(hymnNumberParamSchema), relatedHymnsController);
router.get('/:number', validate(hymnNumberParamSchema), getHymnByNumberController);

export default router;
