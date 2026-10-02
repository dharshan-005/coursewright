import { Router } from 'express';
import { publicStats, myDashboard, adminDashboard } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = Router();

router.get('/public', publicStats);
router.get('/me', protect, myDashboard);
router.get('/admin', protect, authorize('admin'), adminDashboard);

export default router;
