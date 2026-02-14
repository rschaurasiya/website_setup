const axios = require('axios');
const { pool } = require('./db');

const testComment = async () => {
    try {
        console.log('Testing comment submission...');

        // 1. Get a valid blog ID
        const blogRes = await pool.query('SELECT id FROM blogs LIMIT 1');
        if (blogRes.rows.length === 0) {
            console.log('❌ No blogs found to comment on. Please create a blog first.');
            return;
        }
        const blogId = blogRes.rows[0].id;
        console.log(`Found blog ID: ${blogId}`);

        // 2. Submit Comment
        const response = await axios.post('http://localhost:5000/api/comments', {
            content: 'Test comment from script',
            blogId: blogId,
            guestName: 'Tester',
            guestEmail: 'test@example.com'
        });

        console.log('✅ Comment submitted successfully!');
        console.log('Response:', response.data);

    } catch (error) {
        console.error('❌ Comment submission failed:', error.response ? error.response.data : error.message);
    } finally {
        process.exit();
    }
};

testComment();
