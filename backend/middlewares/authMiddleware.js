const jwt = require('jsonwebtoken');
const db = require('../db');

const protect = async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token including blocked status
            const result = await db.query('SELECT id, name, email, role, is_blocked, profile_photo, bio FROM users WHERE id = $1', [decoded.id]);
            req.user = result.rows[0];

            if (!req.user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            if (req.user.is_blocked) {
                return res.status(403).json({ message: 'Access denied. Your account is blocked.' });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Not authorized' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Not authorized as an admin' });
    }
};

module.exports = { protect, admin };
