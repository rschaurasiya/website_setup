const { pool } = require('./db');

const fixConstraints = async () => {
    const client = await pool.connect();
    try {
        console.log('Fixing constraints on comments table...');

        // 1. Drop the specific bad constraint that caused the error
        console.log('Dropping constraint comments_post_id_fkey...');
        await client.query('ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_post_id_fkey;');

        // 2. Drop the potential new constraint name if it exists, to ensure we add it continuously
        console.log('Dropping constraint comments_blog_id_fkey (if exists)...');
        await client.query('ALTER TABLE comments DROP CONSTRAINT IF EXISTS comments_blog_id_fkey;');

        // 3. Add the correct constraint
        // Note: Assuming the column is already named 'blog_id' (renamed from post_id)
        console.log('Adding constraint comments_blog_id_fkey...');
        await client.query(`
            ALTER TABLE comments 
            ADD CONSTRAINT comments_blog_id_fkey 
            FOREIGN KEY (blog_id) 
            REFERENCES blogs(id) 
            ON DELETE CASCADE;
        `);

        console.log('✅ Constraints fixed successfully.');
    } catch (err) {
        console.error('❌ Constraint fix failed:', err.message);
    } finally {
        client.release();
        process.exit();
    }
};

fixConstraints();
