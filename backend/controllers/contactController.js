const db = require('../db');

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
    const { firstName, lastName, email, message } = req.body;

    if (!firstName || !lastName || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO messages (first_name, last_name, email, message) VALUES ($1, $2, $3, $4) RETURNING *',
            [firstName, lastName, email, message]
        );
        res.status(201).json({ message: 'Message sent successfully', data: result.rows[0] });
    } catch (error) {
        console.error('Error saving message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private (Admin)
const getMessages = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM messages ORDER BY created_at DESC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a message
// @route   DELETE /api/contact/:id
// @access  Private (Admin)
const deleteMessage = async (req, res) => {
    try {
        await db.query('DELETE FROM messages WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: 'Message deleted' });
    } catch (error) {
        console.error('Error deleting message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    submitContact,
    getMessages,
    deleteMessage
};
