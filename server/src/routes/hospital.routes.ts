import { Router } from 'express';
import { getAllHospitals, updateHospitalStatus } from '../controllers/hospital.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(['Admin', 'Staff', 'Donor']), getAllHospitals);
router.put('/:id/status', authenticate, authorize(['Admin']), updateHospitalStatus);

export default router;
