/**
 * Middleware to restrict access based on roles.
 * Must be used AFTER the `protect` middleware.
 * 
 * @param {...String} allowedRoles - Spread of allowed roles (e.g., ROLES.ADMIN, ROLES.MANAGER)
 */
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        // Ensure protect middleware ran first
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized, user missing' });
        }

        // Check if user's role is in the allowed list
        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                message: `Forbidden: Role '${req.user.role}' is not allowed to access this resource`
            });
        }

        // User is authorized
        next();
    };
};
