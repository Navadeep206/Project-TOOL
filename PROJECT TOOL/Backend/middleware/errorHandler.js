/**
 * Centralized error handling middleware.
 * Catch-all for async routes if errors are passed to next(err)
 */
export const errorHandler = (err, req, res, next) => {
    // If headers are already sent, delegate to Express default handler
    if (res.headersSent) {
        return next(err);
    }

    // Log error for debugging
    console.error(`[Error Handler] ${err.message}`, err.stack);

    // Determine status code 
    // If it's a CORS error, we want 403
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    if (err.message === 'Not allowed by CORS') statusCode = 403;

    res.status(statusCode).json({
        success: false,
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
