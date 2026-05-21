import mongoose from 'mongoose';
import User from '../models/userModel.js';

/**
 * Access Management Service
 * Handles granting, extending, revoking, and auto-downgrading access.
 */
export const accessService = {
    /**
     * Grant temporary access to a specific user
     * @param {string} targetUserId - The ID of the user receiving access
     * @param {string} adminId - The ID of the admin granting access
     * @param {number} durationHours - How long the access lasts
     * @param {string} reason - Why access was granted
     */
    grantTemporaryAccess: async (targetUserId, adminId, durationHours, reason) => {
        if (targetUserId.toString() === adminId.toString()) {
            throw new Error('Security Error: Administrators cannot self-grant temporary access modifications.');
        }

        if (!durationHours || durationHours <= 0 || durationHours > 720) { // Max 30 days
            throw new Error('Invalid duration. Must be between 1 and 720 hours.');
        }

        const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000);

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            {
                accessType: 'temporary',
                accessExpiresAt: expiresAt,
                grantedBy: adminId,
                grantReason: reason,
                isActive: true // Re-enable if disabled
            },
            { new: true }
        );

        if (!updatedUser) throw new Error('Target user not found.');

        // Audit Hook
        console.log(`[AUDIT] Temporary access granted to ${targetUserId} by ${adminId} for ${durationHours}h.`);

        return updatedUser;
    },

    /**
     * Extend existing temporary access
     */
    extendAccess: async (targetUserId, adminId, additionalHours) => {
        if (targetUserId.toString() === adminId.toString()) {
            throw new Error('Security Error: Administrators cannot self-grant extensions.');
        }

        const user = await User.findById(targetUserId);
        if (!user) throw new Error('User not found.');
        if (user.accessType !== 'temporary') throw new Error('Cannot extend permanent accounts.');

        const currentExpiry = user.accessExpiresAt ? new Date(user.accessExpiresAt).getTime() : Date.now();
        const newExpiry = new Date(Math.max(Date.now(), currentExpiry) + additionalHours * 60 * 60 * 1000);

        user.accessExpiresAt = newExpiry;
        user.isActive = true; // Ensure active
        await user.save();

        console.log(`[AUDIT] Access extended for ${targetUserId} by ${adminId}. New Expiry: ${newExpiry.toISOString()}`);

        return user;
    },

    /**
     * Immediately revoke temporary access and deactivate
     */
    revokeAccess: async (targetUserId, adminId) => {
        if (targetUserId.toString() === adminId.toString()) {
            throw new Error('Security Error: Cannot self-revoke if acting as Admin.');
        }

        const updatedUser = await User.findByIdAndUpdate(
            targetUserId,
            {
                accessType: 'temporary',
                accessExpiresAt: new Date(Date.now() - 1000), // Expire immediately in the past
                isActive: false // Directly disable them
            },
            { new: true }
        );

        if (!updatedUser) throw new Error('User not found.');

        console.log(`[AUDIT] Access revoked for ${targetUserId} by ${adminId}.`);
        return updatedUser;
    },

    /**
     * Sweeps the database for expired temporary accounts and deactivates them.
     * Called by the Cron Job.
     */
    cullExpiredAccounts: async () => {
        try {
            const now = new Date();

            const result = await User.updateMany(
                {
                    accessType: 'temporary',
                    accessExpiresAt: { $lt: now },
                    isActive: true // Only update those that are currently active
                },
                {
                    $set: { isActive: false }
                }
            );

            if (result.modifiedCount > 0) {
                console.log(`[CRON] Access Cleanup Complete. Deactivated ${result.modifiedCount} expired accounts.`);
                // Optional: Trigger bulk notification to admins here via Notification Service
            }

            return result.modifiedCount;
        } catch (error) {
            console.error('[CRON ERROR] Failed to cull expired accounts:', error);
            throw error;
        }
    }
};
