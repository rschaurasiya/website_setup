const db = require('../db');

const checkBlogs = async () => {
    try {
        const res = await db.query('SELECT COUNT(*) FROM blogs');
        console.log('Total Blogs in DB:', res.rows[0].count);

        const blogs = await db.query('SELECT id, title, status FROM blogs LIMIT 5');
        console.log('Sample Blogs:', blogs.rows);
    } catch (err) {
        console.error('Error:', err);
    }
    process.exit();
};

checkBlogs();
