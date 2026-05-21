import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for invitation endpoints to prevent spamming.
 * Max 5 invitations every 15 minutes per IP.
 */
export const inviteLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per window
    message: {
        message: 'Too many invitation requests from this IP, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
