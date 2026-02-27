import app from './app.js';
import './jobs/accessCleanup.js'; // Start Temp Access Cleanup Cron Job
import { initCleanupJob } from './jobs/cleanupInvites.js';

// Initialize Invitation Cleanup
initCleanupJob();

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});