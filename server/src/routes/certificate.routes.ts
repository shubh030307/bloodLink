import { Router } from 'express';
import { getMyCertificates, generateCertificate, generateMilestoneCertificate } from '../controllers/certificate.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authenticate, authorize(['Donor']), getMyCertificates);
router.post('/generate', authenticate, authorize(['Donor']), generateCertificate);
router.post('/milestone', authenticate, authorize(['Donor']), generateMilestoneCertificate);

export default router;
