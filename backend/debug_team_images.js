const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'legal_blog_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function checkTeamImages() {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT id, name, image FROM team_members ORDER BY id DESC LIMIT 5');
        console.log('Recent Team Members:');
        console.table(res.rows);
        client.release();
        await pool.end();
    } catch (err) {
        console.error(err);
    }
}

checkTeamImages();
