import { Router } from '../utils/expressRouter';
import { getDonorMilestones, claimReward, getAdminRewards, updateRewardStock } from '../controllers/milestone.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Donor routes
router.get('/donor', authenticate, authorize(['Donor']), getDonorMilestones);
router.post('/claim', authenticate, authorize(['Donor']), claimReward);

// Admin routes
router.get('/admin/rewards', authenticate, authorize(['Admin']), getAdminRewards);
router.put('/admin/rewards/:id', authenticate, authorize(['Admin']), updateRewardStock);

export default router;
