const db = require('../db');
const bcrypt = require('bcryptjs'); // Needed for resetPassword

// ... (existing functions: registerUser, loginUser, getMe, updateProfile) are assumed present
// We need to implement the following:

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await db.query('SELECT id, name, email, role, is_blocked, created_at, phone, college FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
        const count = await db.query('SELECT COUNT(*) FROM users');

        res.json({
            users: users.rows,
            totalPages: Math.ceil(count.rows[0].count / limit),
            currentPage: page
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update user status (role/block)
// @route   PUT /api/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
    const { role, is_blocked } = req.body;
    try {
        let query = 'UPDATE users SET ';
        const params = [];
        let index = 1;

        if (role) {
            query += `role = $${index}, `;
            params.push(role);
            index++;
        }
        if (is_blocked !== undefined) {
            query += `is_blocked = $${index}, `;
            params.push(is_blocked);
            index++;
        }

        // Remove trailing comma
        if (query.endsWith(', ')) query = query.slice(0, -2);

        query += ` WHERE id = $${index} RETURNING *`;
        params.push(req.params.id);

        const result = await db.query(query, params);
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    try {
        await db.query('DELETE FROM users WHERE id = $1', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get authors (creators + admins)
// @route   GET /api/users/authors
// @access  Public
const getAuthors = async (req, res) => {
    try {
        const result = await db.query("SELECT id, name, bio, profile_photo FROM users WHERE role IN ('admin', 'creator')");
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit Creator Application
// @route   POST /api/users/apply
// @access  Private
const submitApplication = async (req, res) => {
    const { reason, social_link } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO creator_requests (user_id, name, email, reason, social_link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, req.user.name, req.user.email, reason, social_link]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Application Status
// @route   GET /api/users/application-status
// @access  Private
const getApplicationStatus = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM creator_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1', [req.user.id]);
        res.json(result.rows[0] || null);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get All Applications (Admin)
// @route   GET /api/users/applications
// @access  Private/Admin
const getApplications = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM creator_requests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Review Application
// @route   PUT /api/users/applications/:id
// @access  Private/Admin
const reviewApplication = async (req, res) => {
    const { status, rejection_reason } = req.body;
    const applicationId = req.params.id;

    try {
        const appRes = await db.query('UPDATE creator_requests SET status = $1, rejection_reason = $2 WHERE id = $3 RETURNING *', [status, rejection_reason, applicationId]);
        const application = appRes.rows[0];

        if (status === 'approved') {
            await db.query("UPDATE users SET role = 'creator' WHERE id = $1", [application.user_id]);
        }

        res.json(application);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Forgot Password
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userRes = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate 6 digit code
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 15 mins
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await db.query('UPDATE users SET reset_code = $1, reset_code_expires = $2 WHERE email = $3', [resetCode, expiresAt, email]);

        // In a real app, send email here. For now, log it (or return it for dev mostly)
        console.log(`Reset Code for ${email}: ${resetCode}`);

        res.json({ message: 'Reset code sent to email', dev_code: resetCode });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, code } = req.body;
    try {
        const userRes = await db.query('SELECT * FROM users WHERE email = $1 AND reset_code = $2', [email, code]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid code' });
        }

        const user = userRes.rows[0];
        if (new Date() > new Date(user.reset_code_expires)) {
            return res.status(400).json({ message: 'Code expired' });
        }

        res.json({ message: 'Code verified' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Reset Password
// @route   POST /api/users/reset-password
// @access  Public
const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const userRes = await db.query('SELECT * FROM users WHERE email = $1 AND reset_code = $2', [email, code]);
        if (userRes.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid code' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE users SET password = $1, reset_code = NULL, reset_code_expires = NULL WHERE email = $2', [hashedPassword, email]);

        res.json({ message: 'Password reset successful' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getAllUsers,
    updateUserStatus,
    deleteUser,
    getAuthors,
    submitApplication,
    getApplicationStatus,
    getApplications,
    reviewApplication,
    forgotPassword,
    verifyOtp,
    resetPassword
};
