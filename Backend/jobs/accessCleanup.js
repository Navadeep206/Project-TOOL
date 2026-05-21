import cron from 'node-cron';
import { accessService } from '../services/access.service.js';

/**
 * Scheduled Cron Job to cull expired temporary accounts.
 * Runs independently of Express requests on a set interval.
 * 
 * INSTRUCTIONS:
 * Import and initialize this file in your main `server.js` or `app.js`:
 * `import './jobs/accessCleanup.js';`
 */

// Schedule: "0 * * * *" -> Top of every hour (e.g. 1:00, 2:00, 3:00)
// You can adjust this to "*/15 * * * *" (Every 15 minutes) for tighter security
cron.schedule('0 * * * *', async () => {
    console.log('[CRON Worker] Starting scheduled access cleanup cycle...');

    try {
        const culledCount = await accessService.cullExpiredAccounts();
        console.log(`[CRON Worker] Cleanup cycle finished. Deactivated ${culledCount} accounts.`);
    } catch (error) {
        console.error('[CRON Worker Error] Failed to complete cleanup cycle:', error);
    }
});

// Immediately export a utility to run it manually (e.g. via an Admin Dashboard button)
export const forceCleanupRun = async () => {
    return await accessService.cullExpiredAccounts();
};
