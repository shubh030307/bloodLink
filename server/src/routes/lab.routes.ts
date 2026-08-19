import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import * as labController from '../controllers/lab.controller';

const router = Router();

// Apply auth middleware to all routes
router.use(authenticate);
router.use(authorize(['LAB_TECHNICIAN', 'ADMIN']));

// Dashboard and Queue
router.get('/dashboard', labController.getDashboardStats);
router.get('/queue', labController.getQueue);

// Scanning
router.post('/scan', labController.scanBloodBag);

// Blood Unit details
router.get('/unit/:id', labController.getUnitDetails);

// Testing Workflow
router.post('/testing/start', labController.startTesting);
router.get('/tests', labController.getConfiguredTests);
router.get('/session/:sessionId/results', labController.getSessionResults);
router.post('/testing/save', labController.saveTestResults);
router.post('/testing/complete', labController.completeTesting);

// Report & Review
router.post('/report/generate', labController.generateReport);
router.post('/review/approve', labController.approveUnit);
router.post('/review/reject', labController.rejectUnit);

// History & Exceptions
router.get('/history', labController.getLabHistory);
router.get('/exceptions', labController.getLabExceptions);
router.post('/exceptions', labController.createLabException);

export default router;
