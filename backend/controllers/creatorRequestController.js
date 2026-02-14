const pool = require('../db').pool;
const bcrypt = require('bcryptjs');

exports.submitRequest = async (req, res) => {
    const { name, email, password, reason, social_link } = req.body;

    if (!name || !email || !password || !reason) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if email already exists in users or creator_requests
        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        const requestCheck = await pool.query('SELECT * FROM creator_requests WHERE email = $1 AND status = $2', [email, 'pending']);
        if (requestCheck.rows.length > 0) {
            return res.status(400).json({ message: 'A pending request with this email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            `INSERT INTO creator_requests (name, email, password, reason, social_link) 
             VALUES ($1, $2, $3, $4, $5)`,
            [name, email, hashedPassword, reason, social_link]
        );

        res.status(201).json({ message: 'Request submitted successfully. Waiting for admin approval.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.getAllRequests = async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, reason, social_link, status, created_at FROM creator_requests ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};

exports.approveRequest = async (req, res) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const { id } = req.params;

        // Get Request Data
        const requestRes = await client.query('SELECT * FROM creator_requests WHERE id = $1', [id]);
        if (requestRes.rows.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Request not found' });
        }
        const request = requestRes.rows[0];

        if (request.status !== 'pending') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Request is handled already' });
        }

        let resultUser;

        if (request.user_id) {
            // Upgrade Existing User
            const updateUserText = `
                UPDATE users SET role = 'author' WHERE id = $1 RETURNING id, name, email, role
            `;
            const updatedUser = await client.query(updateUserText, [request.user_id]);
            resultUser = updatedUser.rows[0];
        } else {
            // Create New User
            // Check if email exists (double check)
            const emailCheck = await client.query('SELECT * FROM users WHERE email = $1', [request.email]);
            if (emailCheck.rows.length > 0) {
                await client.query('ROLLBACK');
                return res.status(400).json({ message: 'Email already registered to an existing user.' });
            }

            const insertUserText = `
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, 'author')
                RETURNING id, name, email, role
            `;
            const newUser = await client.query(insertUserText, [request.name, request.email, request.password]);
            resultUser = newUser.rows[0];
        }

        // Update Request Status
        await client.query('UPDATE creator_requests SET status = $1 WHERE id = $2', ['approved', id]);

        await client.query('COMMIT');
        res.json({ message: 'Request approved', user: resultUser });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    } finally {
        client.release();
    }
};

exports.rejectRequest = async (req, res) => {
    const { id } = req.params;
    const { rejection_reason } = req.body;

    try {
        const result = await pool.query(
            'UPDATE creator_requests SET status = $1, rejection_reason = $2 WHERE id = $3 RETURNING *',
            ['rejected', rejection_reason, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Request not found' });
        }

        res.json({ message: 'Request rejected', request: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};
