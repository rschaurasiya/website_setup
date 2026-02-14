const AppError = require('../utils/AppError');

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log error for debugging
    console.error('Error Middleware:', err);

    // Mongoose bad ObjectId (if using Mongo, but here we use Postgres/SQL mostly via pg)
    // Postgres unique violation
    if (err.code === '23505') {
        const message = 'Duplicate field value entered. Please use another value.';
        error = new AppError(message, 400);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        const message = 'Invalid token. Please log in again.';
        error = new AppError(message, 401);
    }

    if (err.name === 'TokenExpiredError') {
        const message = 'Your token has expired. Please log in again.';
        error = new AppError(message, 401);
    }

    res.status(error.statusCode || 500).json({
        status: error.status || 'error',
        message: error.message || 'Server Error',
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

module.exports = { errorHandler };
