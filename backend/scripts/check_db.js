const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

const check = async () => {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();
        console.log('Connected.');

        console.log('Checking about_page table...');
        const res = await client.query("SELECT * FROM information_schema.tables WHERE table_name = 'about_page'");

        if (res.rows.length === 0) {
            console.error('❌ Table about_page DOES NOT EXIST.');
        } else {
            console.log('✅ Table about_page exists.');

            const cols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'about_page'");
            console.log('Columns:', cols.rows);
        }

        client.release();
    } catch (e) {
        console.error('DB Error:', e);
    } finally {
        pool.end();
    }
};

check();
