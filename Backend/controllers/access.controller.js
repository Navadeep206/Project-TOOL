import { accessService } from '../services/access.service.js';
import User from '../models/userModel.js';

/**
 * Access Controller
 * Secured endpoints for Administrators to manage temporary user accounts.
 */
export const accessController = {
    /**
     * POST /api/v1/access/grant
     */
    grantAccess: async (req, res) => {
        try {
            const { targetUserId, durationHours, reason } = req.body;
            const adminId = req.user._id;

            if (!targetUserId || !durationHours) {
                return res.status(400).json({ success: false, message: 'Missing required fields: targetUserId, durationHours.' });
            }

            await accessService.grantTemporaryAccess(targetUserId, adminId, durationHours, reason);

            return res.status(200).json({
                success: true,
                message: `Successfully granted temporary access to ${targetUserId} for ${durationHours} hours.`
            });
        } catch (error) {
            console.error('[Access Controller - Grant Error]:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    /**
     * PATCH /api/v1/access/extend
     */
    extendAccess: async (req, res) => {
        try {
            const { targetUserId, additionalHours } = req.body;
            const adminId = req.user._id;

            if (!targetUserId || !additionalHours) {
                return res.status(400).json({ success: false, message: 'Missing targetUserId or additionalHours.' });
            }

            await accessService.extendAccess(targetUserId, adminId, additionalHours);

            return res.status(200).json({
                success: true,
                message: `Success. Extended access by ${additionalHours} hours.`
            });
        } catch (error) {
            console.error('[Access Controller - Extend Error]:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    /**
     * PATCH /api/v1/access/revoke
     */
    revokeAccess: async (req, res) => {
        try {
            const { targetUserId } = req.body;
            const adminId = req.user._id;

            if (!targetUserId) {
                return res.status(400).json({ success: false, message: 'Missing targetUserId.' });
            }

            await accessService.revokeAccess(targetUserId, adminId);

            return res.status(200).json({
                success: true,
                message: 'Temporary access instantly revoked and deactivated.'
            });
        } catch (error) {
            console.error('[Access Controller - Revoke Error]:', error);
            return res.status(400).json({ success: false, message: error.message });
        }
    },

    /**
     * GET /api/v1/access/temporary-users
     */
    listTemporaryUsers: async (req, res) => {
        try {
            // Find all users marked temporary, active or not
            const users = await User.find({ accessType: 'temporary' })
                .select('fullname email role accessExpiresAt isActive grantReason')
                .populate('grantedBy', 'fullname email role') // Who gave them access
                .sort({ accessExpiresAt: 1 })
                .lean();

            return res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('[Access Controller - List Error]:', error);
            return res.status(500).json({ success: false, message: 'Internal server error fetching users.' });
        }
    }
};
