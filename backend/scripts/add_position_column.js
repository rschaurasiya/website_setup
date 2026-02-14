const { pool } = require('../db');

const addPositionColumn = async () => {
    try {
        const client = await pool.connect();
        console.log('Checking for position column in users table...');

        const checkQuery = `
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='position';
        `;

        const res = await client.query(checkQuery);

        if (res.rows.length === 0) {
            console.log('Adding position column...');
            await client.query('ALTER TABLE users ADD COLUMN position VARCHAR(255);');
            console.log('✅ Position column added successfully.');
        } else {
            console.log('✅ Position column already exists.');
        }

        client.release();
    } catch (err) {
        console.error('❌ Error updating database:', err);
    } finally {
        // We don't close the pool here because it might be used by the app, but for a standalone script we should.
        // However, looking at db.js, the pool is exported.
        // If we run this as a script, we should exit.
        process.exit();
    }
};

addPositionColumn();
