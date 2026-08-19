import { Router } from 'express';
import { getAllStaff, createStaff } from '../controllers/staff.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only admin can manage staff
router.get('/', authenticate, authorize(['Admin']), getAllStaff);
router.post('/', authenticate, authorize(['Admin']), createStaff);

export default router;
