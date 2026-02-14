const { pool } = require('./db');

const fixCommentsColumns = async () => {
    const client = await pool.connect();
    try {
        console.log('Fixing comments table columns...');

        // Rename post_id to blog_id
        await client.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='post_id') THEN 
                    ALTER TABLE comments RENAME COLUMN post_id TO blog_id; 
                    RAISE NOTICE 'Renamed post_id to blog_id';
                END IF; 
            END $$;
        `);

        // Rename comment to content
        await client.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comments' AND column_name='comment') THEN 
                    ALTER TABLE comments RENAME COLUMN comment TO content; 
                    RAISE NOTICE 'Renamed comment to content';
                END IF; 
            END $$;
        `);

        console.log('✅ Comments table columns fixed.');
    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        client.release();
        process.exit();
    }
};

fixCommentsColumns();
