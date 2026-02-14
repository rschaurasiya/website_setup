
const db = require('../db');

const checkDB = async () => {
    try {
        console.log('Checking database connection...');
        const res = await db.query('SELECT NOW()');
        console.log('Database connected:', res.rows[0]);

        console.log('Checking about_page table columns...');
        const columns = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'about_page';
        `);
        console.table(columns.rows);

        console.log('Checking about_page row count...');
        const rows = await db.query('SELECT count(*) FROM about_page');
        console.log('Row count:', rows.rows[0].count);

        if (parseInt(rows.rows[0].count) > 0) {
            const data = await db.query('SELECT id, members FROM about_page LIMIT 1');
            console.log('First Row Data (Members):', data.rows[0]);
        }

    } catch (err) {
        console.error('Database Check Error:', err);
    } finally {
        // We can't easily close the pool if it's exported from db.js without an explicit end method,
        // but we can just let the script exit.
        process.exit();
    }
};

checkDB();
