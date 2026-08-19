import { Router } from 'express';
import { createCamp, getCamps, getCampById, updateCampStatus } from '../controllers/camp.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only admin or staff can manage camps
router.post('/', authenticate, authorize(['Admin', 'Receptionist']), createCamp);
router.patch('/:id/status', authenticate, authorize(['Admin', 'Receptionist']), updateCampStatus);

// Anyone can view active camps
router.get('/', authenticate, getCamps);
router.get('/:id', authenticate, getCampById);

export default router;
