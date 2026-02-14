const db = require('../db');

const migrate = async () => {
    try {
        console.log('🔄 Starting migration: Add username column...');

        // 1. Add column if not exists
        await db.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='username') THEN 
                    ALTER TABLE users ADD COLUMN username VARCHAR(100) UNIQUE; 
                END IF; 
            END $$;
        `);
        console.log('✅ Column check/add complete.');

        // 2. Populate usernames for existing users
        const users = await db.query('SELECT id, name, email FROM users WHERE username IS NULL');

        for (const user of users.rows) {
            let baseParams = user.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (baseParams.length < 3) {
                baseParams = user.email.split('@')[0].replace(/[^a-z0-9]/g, '');
            }

            let username = baseParams;
            let counter = 1;

            // Check uniqueness
            while (true) {
                const check = await db.query('SELECT 1 FROM users WHERE username = $1', [username]);
                if (check.rows.length === 0) break;
                username = `${baseParams}${counter}`;
                counter++;
            }

            await db.query('UPDATE users SET username = $1 WHERE id = $2', [username, user.id]);
            console.log(`   Updated user ${user.email} -> username: ${username}`);
        }

        console.log('🎉 Migration complete!');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    }
    process.exit();
};

migrate();
