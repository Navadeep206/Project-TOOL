import express from 'express';
import { activityController } from '../controllers/activity.controller.js';
// Replace with actual authentication middleware if required:
// import isAuthenticated from '../middleware/isAuthenticated.js';

const router = express.Router();

/**
 * Note: It is assumed that you will mount this router securely.
 * Example in app.js:
 * app.use('/api/v1/activities', isAuthenticated, activityRoutes);
 * 
 * Secure this route with a middleware to Verify Project Membership
 * before handing off to the controller!
 */

// Get paginated activities for a specific project
router.get('/project/:projectId', activityController.getProjectActivities);

export default router;
