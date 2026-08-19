import { Router } from 'express';
import { 
  getCollectionQueue, 
  scanVisitQr, 
  startCollection, 
  scanSticker, 
  assignSticker, 
  completeCollection, 
  verifyOtp,
  uploadCollectionForm,
  rejectCollection
} from '../controllers/collection.controller';
import { ocrVerify } from '../controllers/ocr.controller';

import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middleware/upload';

const router = Router();

router.use(authenticate);
router.use(authorize(['CollectionStaff', 'Admin']));

router.get('/queue', getCollectionQueue);
router.post('/scan-visit', scanVisitQr);
router.post('/ocr-verify', ocrVerify);
router.post('/start', startCollection);
router.post('/upload-form', upload.single('formDocument'), uploadCollectionForm);
router.post('/reject', rejectCollection);
router.post('/scan-sticker', scanSticker);
router.post('/assign-sticker', assignSticker);
router.post('/complete', completeCollection);
router.post('/verify-otp', verifyOtp);

export default router;
