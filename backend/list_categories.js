const { pool } = require('./db');

const listCategories = async () => {
    const client = await pool.connect();
    try {
        console.log('Fetching categories...');
        const res = await client.query('SELECT * FROM categories');
        console.log("Categories:", res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit();
    }
};

listCategories();
