import nodeCron from 'node-cron';
import Invitation from '../models/invitationModel.js';

/**
 * Initializes a cron job to cleanup/expire old invitations.
 * Runs every hour.
 */
export const initCleanupJob = () => {
    // Run every hour
    nodeCron.schedule('0 * * * *', async () => {
        try {
            console.log('[JOBS] Running Invitation Cleanup...');
            const result = await Invitation.updateMany(
                {
                    status: 'pending',
                    expiresAt: { $lt: new Date() }
                },
                { status: 'expired' }
            );
            console.log(`[JOBS] Marked ${result.modifiedCount} invitations as expired.`);
        } catch (error) {
            console.error('[JOBS] Invitation Cleanup Error:', error);
        }
    });
};
