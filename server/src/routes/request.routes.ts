import { Router } from 'express';
import { submitRequest, getAllRequests, getHospitalRequests, processRequest, issueBlood } from '../controllers/request.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authenticate, authorize(['Hospital']), submitRequest);
router.get('/hospital', authenticate, authorize(['Hospital']), getHospitalRequests);
router.get('/', authenticate, authorize(['Admin']), getAllRequests);
router.post('/:requestId/process', authenticate, authorize(['Admin']), processRequest);
router.post('/:requestId/issue', authenticate, authorize(['Admin']), issueBlood);

export default router;
