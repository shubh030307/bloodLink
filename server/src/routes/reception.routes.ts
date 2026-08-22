import { Router } from '../utils/expressRouter';
import { 
  scanAppointmentQr, 
  checkInDonor, 
  getTodayQueue,
  uploadIdentityDocument,
  uploadMedicalCertificate,
  submitQuestionnaire,
  assignQueue
} from '../controllers/reception.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middleware/upload';

const router = Router();

// Only Receptionists can access these routes
router.post('/scan', authenticate, authorize(['Receptionist', 'Admin']), scanAppointmentQr);

// New multi-step workflow routes
router.post('/upload-id', authenticate, authorize(['Receptionist', 'Admin']), upload.single('idDocument'), uploadIdentityDocument);
router.post('/upload-certificate', authenticate, authorize(['Receptionist', 'Admin']), upload.single('medicalCertificate'), uploadMedicalCertificate);
router.post('/questionnaire', authenticate, authorize(['Receptionist', 'Admin']), submitQuestionnaire);
router.post('/assign-queue', authenticate, authorize(['Receptionist', 'Admin']), assignQueue);

// Legacy checkin
router.post('/checkin', authenticate, authorize(['Receptionist', 'Admin']), checkInDonor);
router.get('/queue', authenticate, authorize(['Receptionist', 'Admin']), getTodayQueue);

export default router;
