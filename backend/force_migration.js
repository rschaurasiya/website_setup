const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 5432,
});

async function runMigration() {
    const client = await pool.connect();
    try {
        console.log('Running migration...');
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='college') THEN 
                    ALTER TABLE users ADD COLUMN college VARCHAR(255); 
                    RAISE NOTICE 'Added college column';
                ELSE
                    RAISE NOTICE 'College column already exists';
                END IF;
            END $$;
        `);
        console.log('Migration finished.');

        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND column_name = 'college';
        `);
        console.log('Check result:', res.rows);
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        client.release();
        pool.end();
    }
}

runMigration();
