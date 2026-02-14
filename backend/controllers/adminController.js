const db = require('../db');

// @desc    Get all author requests
// @route   GET /api/admin/author-requests
// @access  Private/Admin
const getAuthorRequests = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT ar.*, u.name, u.email 
            FROM author_requests ar
            JOIN users u ON ar.user_id = u.id
            ORDER BY ar.created_at DESC
        `);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Approve author request
// @route   PUT /api/admin/author-requests/:id/approve
// @access  Private/Admin
const approveAuthorRequest = async (req, res) => {
    const { id } = req.params;

    try {
        // Start transaction
        await db.query('BEGIN');

        // Get request
        const requestRes = await db.query('SELECT user_id FROM author_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ message: 'Request not found' });
        }
        const userId = requestRes.rows[0].user_id;

        // Update Request Status
        await db.query("UPDATE author_requests SET status = 'approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1", [id]);

        // Update User Role
        await db.query("UPDATE users SET role = 'author' WHERE id = $1", [userId]);

        await db.query('COMMIT');
        res.status(200).json({ message: 'Request approved and user role updated' });
    } catch (error) {
        await db.query('ROLLBACK');
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reject author request
// @route   PUT /api/admin/author-requests/:id/reject
// @access  Private/Admin
const rejectAuthorRequest = async (req, res) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    if (!rejection_reason) {
        return res.status(400).json({ message: 'Rejection reason is required' });
    }

    try {
        await db.query(
            "UPDATE author_requests SET status = 'rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2",
            [rejection_reason, id]
        );
        res.status(200).json({ message: 'Request rejected' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const blogsCount = await db.query('SELECT COUNT(*) FROM blogs');
        const usersCount = await db.query('SELECT COUNT(*) FROM users');
        const commentsCount = await db.query('SELECT COUNT(*) FROM comments');

        res.status(200).json({
            totalBlogs: parseInt(blogsCount.rows[0].count),
            totalUsers: parseInt(usersCount.rows[0].count),
            totalComments: parseInt(commentsCount.rows[0].count)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAuthorRequests,
    approveAuthorRequest,
    rejectAuthorRequest,
    getDashboardStats
};
