const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'legal_blog_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function runMigration() {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();

        console.log('Adding social_links column...');
        // Use TEXT to store JSON string to be compatible with basic POSTGRES setups without JSONB complexity if not needed
        await client.query(`
            ALTER TABLE team_members 
            ADD COLUMN IF NOT EXISTS social_links TEXT DEFAULT '[]';
        `);

        console.log('Migration successful: social_links column added.');
        client.release();
        await pool.end();
    } catch (err) {
        console.error('Migration failed:', err);
    }
}

runMigration();
