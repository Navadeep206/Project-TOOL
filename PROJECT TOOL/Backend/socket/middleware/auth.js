import jwt from 'jsonwebtoken';
import cookie from 'cookie';
import User from '../../models/userModel.js';

export const authMiddleware = async (socket, next) => {
    let token = socket.handshake.auth.token;

    // Fallback: Check cookies in the handshake headers (useful for HttpOnly cookies)
    if (!token && socket.handshake.headers.cookie) {
        const cookies = cookie.parse(socket.handshake.headers.cookie);
        token = cookies.jwt;
    }

    if (!token) {
        console.warn(`[Socket Auth] Connection attempt failed: No token provided (Socket ID: ${socket.id})`);
        return next(new Error('Authentication error: No token provided'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return next(new Error('Authentication error: User not found'));
        }

        if (user.isBlocked) {
            return next(new Error('Authentication error: User is blocked'));
        }

        // Attach user to socket instance
        socket.user = user;
        next();
    } catch (err) {
        console.error(`[Socket Auth] Token verification failed: ${err.message}`);
        next(new Error('Authentication error: Invalid or expired token'));
    }
};
