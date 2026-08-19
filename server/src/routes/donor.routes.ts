import { Router } from 'express';
import { getDonorProfile, getDonorHistory, getAllDonors, updateDonorProfile, getDonorEligibility, submitFeedback } from '../controllers/donor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/profile', authenticate, authorize(['Donor']), getDonorProfile);
router.put('/profile', authenticate, authorize(['Donor']), updateDonorProfile);
router.get('/history', authenticate, authorize(['Donor']), getDonorHistory);
router.get('/eligibility', authenticate, authorize(['Donor']), getDonorEligibility);
router.post('/feedback', authenticate, authorize(['Donor']), submitFeedback);

// Staff specific
router.get('/all', authenticate, authorize(['Admin', 'Receptionist']), getAllDonors);

export default router;
