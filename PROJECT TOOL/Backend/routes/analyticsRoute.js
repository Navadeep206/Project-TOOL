import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    getProjectMetrics,
    getProductivityMetrics,
    getPriorityDistribution,
    getBurnDownData
} from '../controllers/analyticsController.js';

const router = express.Router();

// All analytics routes protected by JWT
router.get('/metrics/:projectId', protect, getProjectMetrics);
router.get('/productivity/:projectId', protect, getProductivityMetrics);
router.get('/priority/:projectId', protect, getPriorityDistribution);
router.get('/burndown/:projectId', protect, getBurnDownData);

export default router;
