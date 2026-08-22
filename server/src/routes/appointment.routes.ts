import { Router } from '../utils/expressRouter';
import { bookAppointment, getMyAppointments, cancelAppointment, getAvailableSlots, getAllBloodBanks, staffBookAppointment, getAllAppointments, getAppointmentQr } from '../controllers/appointment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Donor specific
router.post('/book', authenticate, authorize(['Donor']), bookAppointment);
router.get('/my', authenticate, authorize(['Donor']), getMyAppointments);
router.post('/:id/cancel', authenticate, authorize(['Donor']), cancelAppointment);
router.get('/:id/qr', authenticate, authorize(['Donor']), getAppointmentQr);

// Staff specific
router.post('/staff-book', authenticate, authorize(['Admin', 'Receptionist']), staffBookAppointment);
router.get('/all', authenticate, authorize(['Admin', 'Receptionist']), getAllAppointments);

// General auth
router.get('/slots', authenticate, getAvailableSlots);
router.get('/blood-banks', authenticate, getAllBloodBanks);

export default router;
