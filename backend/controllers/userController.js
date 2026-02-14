const db = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');
const { admin } = require('../config/firebaseAdmin');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Helper to create slug
const createSlug = (text) => {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/[\s\W-]+/g, '-') // Replace spaces and non-word chars with -
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing -
};

// Helper to generate unique username
const generateUniqueUsername = async (identifier) => {
    // Generate base slug from first 3 chars of email/identifier if it's an email-like string, otherwise normal slug
    let baseSlug;
    if (identifier.includes('@')) {
        baseSlug = createSlug(identifier.split('@')[0].substring(0, 3));
    } else {
        baseSlug = createSlug(identifier);
    }

    if (!baseSlug || baseSlug.length < 3) baseSlug = createSlug(identifier) || 'user';

    let username = baseSlug;
    let counter = 1;
    let isUnique = false;

    while (!isUnique) {
        const existingUser = await db.query('SELECT id FROM users WHERE username = $1', [username]);
        if (existingUser.rows.length === 0) {
            isUnique = true;
        } else {
            // Append random 4 digit number for better uniqueness than sequential
            const randomSuffix = Math.floor(1000 + Math.random() * 9000);
            username = `${baseSlug}-${randomSuffix}`;
        }
    }
    return username;
};

// @desc    Register new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res, next) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return next(new AppError('Please add all fields', 400));
    }

    try {
        // Check if user exists
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length > 0) {
            return next(new AppError('User already exists', 400));
        }

        // Generate Username
        const username = await generateUniqueUsername(email);

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const newUser = await db.query(
            'INSERT INTO users (name, email, password, username) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role, username',
            [name, email, hashedPassword, username]
        );

        const user = newUser.rows[0];

        res.status(201).json({
            ...user,
            token: generateToken(user.id),
        });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Unique violation
            return next(new AppError('User already exists (email or username collision)', 400));
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    console.log(`Attempting login for: ${email}`);

    try {
        // Check for user email
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            console.log('User not found');
            return next(new AppError('Invalid credentials', 401));
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(`User found: ${user.email}, Role: ${user.role}, Password Match: ${isMatch}`);

        if (isMatch) {
            res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                username: user.username,
                role: user.role,
                profile_photo: user.profile_photo,
                bio: user.bio,
                phone: user.phone,
                address: user.address,
                college: user.college,
                position: user.position,
                token: generateToken(user.id),
            });
        } else {
            console.log('Password mismatch');
            return next(new AppError('Invalid credentials', 401));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
const getMe = async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, email, role, profile_photo, bio, phone, address, college, position, social_links, username FROM users WHERE id = $1', [req.user.id]);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// ... (skipping unchanged functions) ...

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private (All users)
const updateProfile = async (req, res) => {
    const { name, bio, password, phone, address, college, position, username } = req.body;
    const userId = req.user.id;

    // DEBUG LOGGING
    console.log(`[${new Date().toISOString()}] Update Profile Request - User: ${userId}`);
    console.log('Body:', req.body);
    console.log('File:', req.file ? req.file.filename : 'No File');

    try {
        let updateQuery = 'UPDATE users SET ';
        const queryParams = [userId];
        let paramCount = 1;

        if (name) {
            paramCount++;
            updateQuery += `name = $${paramCount}, `;
            queryParams.push(name);
        }
        if (username) {
            // Check uniqueness
            const userExists = await db.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
            if (userExists.rows.length > 0) {
                return res.status(400).json({ message: 'Username is already taken' });
            }
            paramCount++;
            updateQuery += `username = $${paramCount}, `;
            queryParams.push(username);
        }
        if (bio) {
            paramCount++;
            updateQuery += `bio = $${paramCount}, `;
            queryParams.push(bio);
        }
        if (phone) {
            paramCount++;
            updateQuery += `phone = $${paramCount}, `;
            queryParams.push(phone);
        }
        if (address) {
            paramCount++;
            updateQuery += `address = $${paramCount}, `;
            queryParams.push(address);
        }
        if (college) {
            paramCount++;
            updateQuery += `college = $${paramCount}, `;
            queryParams.push(college);
        }
        if (position) {
            paramCount++;
            updateQuery += `position = $${paramCount}, `;
            queryParams.push(position);
        }
        if (req.body.social_links) {
            console.log('Received social_links:', req.body.social_links);

            // Validate it's valid JSON if sent as string
            let links = req.body.social_links;
            if (typeof links === 'string') {
                try {
                    links = JSON.parse(links);
                } catch (e) {
                    console.error("Invalid JSON for social_links", e);
                    links = [];
                }
            }

            // ENFORCE 2 LINKS REQUIREMENT
            if (Array.isArray(links) && links.length < 2) {
                return res.status(400).json({ message: 'You must provide at least 2 social media links.' });
            }

            // Ensure unique platforms? (Optional but good practice)
            // For now, minimal intervention.

            paramCount++;
            updateQuery += `social_links = $${paramCount}::jsonb, `;
            queryParams.push(JSON.stringify(links));
        }

        if (password) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            paramCount++;
            updateQuery += `password = $${paramCount}, `;
            queryParams.push(hashedPassword);

            // Sync with Firebase
            try {
                const userRes = await db.query('SELECT firebase_uid FROM users WHERE id = $1', [userId]);
                const firebaseUid = userRes.rows[0]?.firebase_uid;

                if (firebaseUid) {
                    await admin.auth().updateUser(firebaseUid, {
                        password: password
                    });
                    console.log(`Firebase password updated for UID: ${firebaseUid}`);
                }
            } catch (fbError) {
                console.error('Firebase Password Update Error:', fbError);
                // Non-blocking error, but good to log
            }
        }
        if (req.file) {
            paramCount++;
            updateQuery += `profile_photo = $${paramCount}, `;
            queryParams.push(`/uploads/${req.file.filename}`);
        }

        // Remove trailing comma
        if (updateQuery.endsWith(', ')) {
            updateQuery = updateQuery.slice(0, -2);
        }

        updateQuery += ` WHERE id = $1 RETURNING id, name, email, role, profile_photo, bio, phone, address, college, position, social_links, username`;

        // If no fields to update, return current user
        if (paramCount === 1 && !req.file) {
            console.log('Update Profile: No changes detected.');
            const currentUser = await db.query('SELECT id, name, email, role, profile_photo, bio, phone, address, college, position, social_links, username FROM users WHERE id = $1', [userId]);
            return res.json(currentUser.rows[0]);
        }

        console.log('Executing Update Query:', updateQuery);
        console.log('Query Params:', queryParams);

        const result = await db.query(updateQuery, queryParams);

        console.log('Update Success:', result.rows[0]);
        // Return updated info (should update context in frontend)
        res.json(result.rows[0]);
    } catch (error) {
        try {
            const fs = require('fs');
            fs.appendFileSync('debug_log.txt', `\n[${new Date().toISOString()}] ERROR: ${error.stack}\n`);
        } catch (e) { console.error("Log failed", e); }
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
};

// @desc    Forgot Password - Send OTP
// @route   POST /api/users/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const userExists = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userExists.rows.length === 0) {
            return res.status(404).json({ message: 'Email not found. Please sign up.' });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Expires in 10 minutes. Postgres syntax: NOW() + interval '10 minutes'
        // Or calculate in JS. JS is safer for consistency.
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await db.query(
            'UPDATE users SET reset_code = $1, reset_code_expires = $2 WHERE email = $3',
            [otp, expiresAt, email]
        );

        // Send Email
        const nodemailer = require('nodemailer');

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS,
                },
            });

            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Password Reset Code - Law Blog',
                text: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
                html: `<p>Your password reset code is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`
            });
            console.log(`OTP sent to ${email}`);
        } else {
            console.log(`[DEV MODE] OTP for ${email}: ${otp}`);
        }

        res.json({ message: 'Security code sent to your email.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Verify OTP
// @route   POST /api/users/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.reset_code !== otp) {
            return res.status(400).json({ message: 'Invalid security code' });
        }

        if (new Date() > new Date(user.reset_code_expires)) {
            return res.status(400).json({ message: 'Security code expired' });
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
    const { email, otp, newPassword } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.reset_code !== otp || new Date() > new Date(user.reset_code_expires)) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query(
            'UPDATE users SET password = $1, reset_code = NULL, reset_code_expires = NULL WHERE email = $2',
            [hashedPassword, email]
        );

        res.json({ message: 'Password reset successfully. You can now login.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Firebase Signup / Login
// @route   POST /api/users/firebase-signup
// @access  Public
const firebaseSignup = async (req, res) => {
    console.log('FIREBASE SIGNUP REQUEST:', req.body);
    // Debug Log
    const fs = require('fs');
    const path = require('path');
    const logPath = path.join(__dirname, '..', 'debug_auth.log');
    try {
        fs.appendFileSync(logPath, `\n[${new Date().toISOString()}] REQ: ${JSON.stringify(req.body)}`);
    } catch (e) { }

    const { name, email, firebaseUid, profile_photo, role, creator_reason, social_link } = req.body;

    if (!email || !firebaseUid) {
        return res.status(400).json({ message: 'Email and Firebase UID are required' });
    }

    try {
        // Check if user exists by email or firebase_uid
        const result = await db.query('SELECT * FROM users WHERE email = $1 OR firebase_uid = $2', [email, firebaseUid]);
        let user = result.rows[0];

        if (user) {
            // User exists - Update firebase_uid if missing (Link accounts)
            if (!user.firebase_uid) {
                const updateRes = await db.query(
                    'UPDATE users SET firebase_uid = $1 WHERE id = $2 RETURNING *',
                    [firebaseUid, user.id]
                );
                user = updateRes.rows[0];
            } else if (user.firebase_uid !== firebaseUid) {
                // Fix: Update UID if it changes (e.g. dev env reset)
                const updateRes = await db.query(
                    'UPDATE users SET firebase_uid = $1 WHERE id = $2 RETURNING *',
                    [firebaseUid, user.id]
                );
                user = updateRes.rows[0];
            }

            // Update profile photo if provided and user doesn't have one? (Optional, maybe skip to avoid overwriting)

            // If user is logging in but also requested creator access in this flow (rare but possible if re-submitting)
            if (creator_reason) {
                // Check if request pending
                const existingReq = await db.query('SELECT * FROM creator_requests WHERE user_id = $1 AND status = $2', [user.id, 'pending']);
                if (existingReq.rows.length === 0 && user.role !== 'author' && user.role !== 'admin') {
                    await db.query(
                        'INSERT INTO creator_requests (user_id, name, email, reason, social_link) VALUES ($1, $2, $3, $4, $5)',
                        [user.id, user.name, user.email, creator_reason, social_link]
                    );
                }
            }

            return res.json({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                profile_photo: user.profile_photo,
                bio: user.bio,
                phone: user.phone,
                address: user.address,
                college: user.college,
                token: generateToken(user.id),
                firebase_uid: user.firebase_uid
            });
        }

        // Create New User
        // Create New User
        const username = await generateUniqueUsername(email);

        const newUserQuery = `
            INSERT INTO users (name, email, firebase_uid, profile_photo, role, password, username)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING id, name, email, role, profile_photo, bio, phone, address, college, firebase_uid, username
        `;
        // Password is null for firebase users
        const newUserRes = await db.query(newUserQuery, [
            name || email.split('@')[0],
            email,
            firebaseUid,
            profile_photo,
            'reader', // Default role
            null, // No password
            username
        ]);

        user = newUserRes.rows[0];

        // If 'Become a Creator' flow
        if (creator_reason) {
            await db.query(
                'INSERT INTO creator_requests (user_id, name, email, reason, social_link) VALUES ($1, $2, $3, $4, $5)',
                [user.id, user.name, user.email, creator_reason, social_link]
            );
        }

        res.status(201).json({
            ...user,
            token: generateToken(user.id)
        });

    } catch (error) {
        console.error('Firebase Auth Error:', error);
        // Log to file for debugging
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '..', 'debug_auth.log');
        const errLog = `\n[${new Date().toISOString()}] Firebase Signup Error: ${error.message}\nStack: ${error.stack}\nBody: ${JSON.stringify(req.body)}\n`;
        try {
            fs.appendFileSync(logPath, errLog);
        } catch (e) { console.error("Failed to write log", e); }

        // Handle specific DB errors likely to occur
        if (error.code === '23505') { // Unique violation
            return res.status(409).json({ message: 'User already exists with this email or UID.' });
        }

        res.status(500).json({ message: 'Server error during auth sync', error: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const users = await db.query("SELECT id, name, email, role, is_blocked, created_at, phone, college FROM users WHERE role != 'admin' ORDER BY created_at DESC LIMIT $1 OFFSET $2", [limit, offset]);
        const count = await db.query("SELECT COUNT(*) FROM users WHERE role != 'admin'");

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

// @desc    Get full user details (Admin only)
// @route   GET /api/users/:id/details
// @access  Private/Admin
const getUserDetails = async (req, res) => {
    try {
        const userId = req.params.id;

        // 1. Fetch User Details
        const userQuery = `
            SELECT id, name, email, role, profile_photo, bio, phone, address, college, position, created_at, is_blocked 
            FROM users 
            WHERE id = $1
        `;
        const userRes = await db.query(userQuery, [userId]);
        const user = userRes.rows[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Fetch Blog Count
        const blogCountQuery = 'SELECT COUNT(*) FROM blogs WHERE author_id = $1';
        const blogCountRes = await db.query(blogCountQuery, [userId]);
        const blogCount = parseInt(blogCountRes.rows[0].count, 10);

        // 3. Fetch Creator Request Status
        const requestQuery = 'SELECT status, created_at FROM creator_requests WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1';
        const requestRes = await db.query(requestQuery, [userId]);
        const latestRequest = requestRes.rows[0];

        res.json({
            ...user,
            blogCount,
            creatorRequest: latestRequest ? latestRequest : null
        });

    } catch (error) {
        console.error('Get User Details Error:', error);
        res.status(500).json({ message: 'Failed to fetch user details' });
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

// @desc    Get authors (creators + admins) - Fixed to exclude admin from public list
// @route   GET /api/users/authors
// @access  Public
const getAuthors = async (req, res, next) => {
    try {
        const query = `
            SELECT u.id, u.name, u.bio, u.profile_photo, u.role, u.social_links, u.username, COUNT(b.id) AS article_count
            FROM users u
            LEFT JOIN blogs b ON u.id = b.author_id AND b.status = 'published'
            WHERE u.role IN ('author', 'creator')
            GROUP BY u.id
        `;
        const result = await db.query(query);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

// @desc    Submit Creator Application
// @route   POST /api/users/apply
// @access  Private
const submitApplication = async (req, res) => {
    const { reason, social_link, name } = req.body;
    try {
        // Update user name if provided and different
        if (name && name !== req.user.name) {
            await db.query('UPDATE users SET name = $1 WHERE id = $2', [name, req.user.id]);
        }

        const result = await db.query(
            'INSERT INTO creator_requests (user_id, name, email, reason, social_link) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [req.user.id, name || req.user.name, req.user.email, reason, social_link]
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
// @desc    Review Application
// @route   PUT /api/users/applications/:id
// @access  Private/Admin
const reviewApplication = async (req, res) => {
    let { status, rejection_reason, action, reason } = req.body;
    const applicationId = req.params.id;

    console.log(`Reviewing App ID: ${applicationId}. Body:`, req.body); // Debug Log

    // Handle frontend sending 'action' instead of 'status'
    if (!status && action) {
        if (action === 'approve') status = 'approved';
        else if (action === 'reject') status = 'rejected';
    }

    console.log(`Determined Status: ${status}`); // Debug Log

    // Handle frontend sending 'reason' instead of 'rejection_reason'
    if (!rejection_reason && reason) {
        rejection_reason = reason;
    }

    try {
        const appRes = await db.query('UPDATE creator_requests SET status = $1, rejection_reason = $2 WHERE id = $3 RETURNING *', [status, rejection_reason, applicationId]);
        const application = appRes.rows[0];

        // Also update the user record if it's an approval
        if (status === 'approved') {
            console.log(`Approving user ${application.user_id} to author`);
            await db.query("UPDATE users SET role = 'author' WHERE id = $1", [application.user_id]);
        }

        res.json(application);
    } catch (error) {
        console.error("Review Application Error:", error);
        res.status(500).json({ message: 'Server error' });
    }
};


// @desc    Get public user profile
// @route   GET /api/users/:id/profile
// @access  Public
const getPublicUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        let query = 'SELECT id, name, profile_photo, bio, college, role, position, social_links, username, created_at FROM users WHERE ';
        let param;

        // Check if id is a transparent UUID
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

        if (isUuid) {
            query += 'id = $1';
            param = id;
        } else {
            query += 'username = $1';
            param = id;
        }

        const userResult = await db.query(query, [param]);

        if (userResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(userResult.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    registerUser,
    loginUser,
    firebaseSignup,
    getMe,
    submitApplication,
    getApplicationStatus,
    reviewApplication,
    getApplications,
    getAllUsers,
    getAuthors,
    updateUserStatus,
    deleteUser,
    updateProfile,
    forgotPassword,
    verifyOtp,
    resetPassword,
    getUserDetails,
    getPublicUserProfile
};
