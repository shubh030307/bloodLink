import { Router } from '../utils/expressRouter';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(['Admin']), getAuditLogs);

export default router;
