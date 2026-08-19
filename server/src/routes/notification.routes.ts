import { Router } from 'express';
import { getMyNotifications, markAsRead } from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, getMyNotifications);
router.post('/:id/read', authenticate, markAsRead);

export default router;
