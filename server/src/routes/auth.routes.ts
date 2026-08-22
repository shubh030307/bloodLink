import { Router } from '../utils/expressRouter';
import { register, login, getMe, changePassword } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema, changePasswordSchema } from '../validators/auth.validator';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

router.get('/me', authenticate, getMe);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

router.get('/test-middleware', authenticate, async (req: any, res: any) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;
