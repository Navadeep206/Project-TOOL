/**
 * Access Expiry Middleware
 * Purpose: Global gatekeeper to block expired temporary users from accessing APIs.
 * 
 * INSTRUCTIONS: 
 * Inject this middleware globally AFTER your authentication middleware.
 * e.g., app.use('/api', isAuthenticated, accessExpiryMiddleware);
 */
export const accessExpiryMiddleware = async (req, res, next) => {
    try {
        const user = req.user; // Assumes `req.user` is populated by prior auth middleware

        // 1. Bypass check if auth didn't populate user or user is permanent
        if (!user || user.accessType !== 'temporary') {
            return next();
        }

        // 2. Validate expiration date presence
        if (!user.accessExpiresAt) {
            console.warn(`[Access System] Temporary user ${user._id} missing accessExpiresAt date.`);
            return res.status(403).json({
                success: false,
                message: 'Account configuration error. Temporary access date missing.'
            });
        }

        // 3. Check expiration
        const now = new Date();
        const expiresAt = new Date(user.accessExpiresAt);

        if (now > expiresAt) {
            // Log the event for security auditing
            console.log(`[SECURITY] Blocked expired access attempt by user: ${user._id} (Expired at: ${expiresAt.toISOString()})`);

            return res.status(403).json({
                success: false,
                code: 'ACCESS_EXPIRED',
                message: 'Your temporary access window has expired. Please contact an administrator to request an extension.',
                expiredAt: expiresAt
            });
        }

        // 4. Access is valid, proceed
        next();
    } catch (error) {
        console.error('[Access Expiry Middleware Error]:', error);
        return res.status(500).json({ success: false, message: 'Internal server error validating access.' });
    }
};
