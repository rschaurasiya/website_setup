const { pool } = require('./db');

const addProfileFields = async () => {
    try {
        console.log('Adding profile fields to users table...');

        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='profile_photo') THEN 
                    ALTER TABLE users ADD COLUMN profile_photo VARCHAR(255); 
                    RAISE NOTICE 'Added profile_photo column';
                END IF;

                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bio') THEN 
                    ALTER TABLE users ADD COLUMN bio TEXT; 
                    RAISE NOTICE 'Added bio column';
                END IF;
            END $$;
        `);

        console.log('✅ Profile fields verified/added successfully.');
        process.exit(0);

    } catch (err) {
        console.error('❌ Error updating table:', err);
        process.exit(1);
    }
};

addProfileFields();
