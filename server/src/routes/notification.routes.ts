import { Router } from '../utils/expressRouter';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.post('/:id/read', authenticate, markAsRead);

export default router;
