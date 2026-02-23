/**
 * Centralized error handling middleware.
 * Catch-all for async routes if errors are passed to next(err)
 */
export const errorHandler = (err, req, res, next) => {
    // If headers are already sent, delegate to Express default handler
    if (res.headersSent) {
        return next(err);
    }

    // Determine status code (default to 500 server error)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    res.status(statusCode).json({
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

/**
 * Wrapper for async route handlers to catch errors and pass them to next().
 * Eliminates the need for repetitive try...catch blocks in controllers.
 */
export const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};
