import { Router } from 'express';
import { getAdminStats } from '../controllers/dashboard.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/admin', authenticate, authorize(['Admin']), getAdminStats);

export default router;
