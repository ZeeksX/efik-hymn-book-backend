import { Router } from 'express';
import { getCategoryBySlugController, getCategoryHymnsController, listCategoriesController } from './category.controller';

const router = Router();

router.get('/', listCategoriesController);
router.get('/:slug', getCategoryBySlugController);
router.get('/:slug/hymns', getCategoryHymnsController);

export default router;
