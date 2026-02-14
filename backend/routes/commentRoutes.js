const express = require('express');
const router = express.Router();
const { addComment, getComments, getAllComments } = require('../controllers/commentController');
const { protect, admin } = require('../middlewares/authMiddleware');

// Middleware to optionally populate req.user if token is present
const optionalAuth = async (req, res, next) => {
    try {
        const jwt = require('jsonwebtoken');
        const db = require('../db');

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            const token = req.headers.authorization.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const result = await db.query('SELECT id, name, email FROM users WHERE id = $1', [decoded.id]);
                req.user = result.rows[0];
            } catch (err) {
                // If token is provided but invalid/expired, return 401 so frontend knows to logout/refresh
                return res.status(401).json({ message: 'Session expired or invalid token. Please login again.' });
            }
        }
    } catch (error) {
        console.error("Auth Middleware Error:", error);
    }
    next();
};

router.post('/', optionalAuth, addComment);
router.get('/admin/all', protect, admin, getAllComments);
router.get('/:blogId', getComments);

module.exports = router;
