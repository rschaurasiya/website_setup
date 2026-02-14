const { pool } = require('./db');

const migrateComments = async () => {
    const client = await pool.connect();
    try {
        console.log('Checking comments table schema...');

        // Add guest_name if not exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='guest_name') THEN 
                    ALTER TABLE comments ADD COLUMN guest_name VARCHAR(100); 
                    RAISE NOTICE 'Added guest_name column';
                END IF; 
            END $$;
        `);

        // Add guest_email if not exists
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='guest_email') THEN 
                    ALTER TABLE comments ADD COLUMN guest_email VARCHAR(100); 
                    RAISE NOTICE 'Added guest_email column';
                END IF; 
            END $$;
        `);

        console.log('✅ Comments table migration completed.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

migrateComments();
