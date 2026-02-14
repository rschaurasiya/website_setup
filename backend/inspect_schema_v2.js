const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'legal_blog_db',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

async function inspectSchema() {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();

        console.log('Querying table schema...');
        const res = await client.query(`
            SELECT column_name, is_nullable, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'team_members';
        `);

        console.log('Schema for team_members:');
        res.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type} (Nullable: ${row.is_nullable})`);
        });

        client.release();
        await pool.end();
    } catch (err) {
        console.error('Error querying schema:', err);
    }
}

inspectSchema();
