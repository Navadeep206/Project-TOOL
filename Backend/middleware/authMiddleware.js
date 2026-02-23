import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';

/**
 * Middleware to protect routes.
 * Verifies JWT token and attaches the authenticated user to the request object.
 */
export const protect = async (req, res, next) => {
    let token;

    // Check for token in cookies first (best practice for web apps)
    if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }
    // Fallback to Bearer token in headers (useful for APIs/mobile clients)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
    }

    try {
        // Verify token
        const secret = process.env.JWT_SECRET || 'fallback_secret';
        const decoded = jwt.verify(token, secret);

        // Fetch user from DB, excluding password
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'Not authorized, user not found' });
        }

        if (user.isBlocked) {
            return res.status(403).json({ message: 'User account is blocked. Contact administrator.' });
        }

        // Attach user object to the request
        req.user = user;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
};