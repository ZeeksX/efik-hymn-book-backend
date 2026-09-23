import { Router } from 'express';
import { searchController } from '../hymns/hymn.controller';

const router = Router();

router.get('/', searchController);

export default router;
