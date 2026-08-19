import { Router } from 'express';
import { getPendingScreenings, startScreening, completeScreening } from '../controllers/medical.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/pending', authenticate, authorize(['MedicalStaff', 'Admin']), getPendingScreenings);
router.post('/:visitId/start', authenticate, authorize(['MedicalStaff', 'Admin']), startScreening);
router.post('/:visitId/complete', authenticate, authorize(['MedicalStaff', 'Admin']), completeScreening);

export default router;
