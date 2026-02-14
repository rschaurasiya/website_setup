const { Pool } = require('pg');
require('dotenv').config({ path: '.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'legal_blog_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function checkAboutSchema() {
    try {
        console.log('Checking about_page schema...');
        const client = await pool.connect();
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'about_page';
        `);
        console.table(res.rows);

        const hasSections = res.rows.some(r => r.column_name === 'sections');
        console.log('Has sections column:', hasSections);

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error:', err);
    }
}

checkAboutSchema();
