const db = require('../db');

// @desc    Add a comment to a blog
// @route   POST /api/comments
// @access  Public (with email) / Private
const addComment = async (req, res) => {
    const { content, blogId, guestName, guestEmail } = req.body;

    if (!content || !blogId) {
        return res.status(400).json({ message: 'Content and Blog ID are required' });
    }

    try {
        let userId = null;
        let finalGuestName = guestName;
        let finalGuestEmail = guestEmail;

        // Check if user is logged in (middleware might attach user)
        // Since this route can be public, we need to check if req.user exists if we use optional auth middleware
        // Or we check the token manually if sent. 
        // For simplicity, let's assume the frontend sends a token if logged in, 
        // and we use a middleware that sets req.user if valid token is found, but doesn't block if not.

        if (req.user) {
            userId = req.user.id;
        } else {
            // If strictly public, require email
            if (!guestEmail) {
                return res.status(400).json({ message: 'Email is required for guests' });
            }
        }

        const result = await db.query(
            'INSERT INTO comments (content, blog_id, user_id, guest_name, guest_email) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [content, blogId, userId, finalGuestName, finalGuestEmail]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ message: error.message || 'Server error', error: error.message });
    }
};

// @desc    Get comments for a blog
// @route   GET /api/comments/:blogId
// @access  Public
const getComments = async (req, res) => {
    const { blogId } = req.params;

    try {
        const result = await db.query(`
            SELECT c.*, u.name as user_name 
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            WHERE c.blog_id = $1
            ORDER BY c.created_at DESC
        `, [blogId]);

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all comments (Admin)
// @route   GET /api/comments/admin/all
// @access  Private/Admin
const getAllComments = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const comments = await db.query(`
            SELECT c.*, u.name as user_name, b.title as blog_title
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN blogs b ON c.blog_id = b.id
            ORDER BY c.created_at DESC
            LIMIT $1 OFFSET $2
        `, [limit, offset]);

        const count = await db.query('SELECT COUNT(*) FROM comments');

        res.status(200).json({
            comments: comments.rows,
            totalPages: Math.ceil(count.rows[0].count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    addComment,
    getComments,
    getAllComments
};
