import { Router } from 'express';
import { generateReport } from '../controllers/report.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/:type/download', authenticate, authorize(['Admin']), generateReport);

export default router;
