const { pool } = require('./db');

const checkSchema = async () => {
    const client = await pool.connect();
    try {
        console.log('Checking comments table columns...');
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'comments';
        `);
        console.log("COLUMNS:", res.rows.map(r => r.column_name));
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit();
    }
};

checkSchema();
