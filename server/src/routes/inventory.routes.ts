import { Router } from 'express';
import { getInventory, getInventoryStats } from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(['Admin', 'ADMIN', 'Hospital', 'LAB_TECHNICIAN', 'LabTechnician']), getInventory);
router.get('/stats', authenticate, authorize(['Admin', 'ADMIN']), getInventoryStats);

export default router;
