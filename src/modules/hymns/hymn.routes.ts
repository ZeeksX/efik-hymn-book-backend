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
