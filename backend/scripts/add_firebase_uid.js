const { pool } = require('../db');

const addFirebaseUid = async () => {
    try {
        console.log('Adding firebase_uid column to users table...');

        await pool.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='firebase_uid') THEN
                    ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(255) UNIQUE;
                END IF;
            END
            $$;
        `);

        console.log('✅ firebase_uid column added successfully.');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error adding column:', err);
        process.exit(1);
    }
};

addFirebaseUid();
