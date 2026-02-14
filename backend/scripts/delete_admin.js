const { pool } = require('../db');

const deleteAdmin = async () => {
    try {
        const client = await pool.connect();
        try {
            console.log("Checking for user...");
            const checkRes = await client.query("SELECT * FROM users WHERE email = $1 AND role = 'admin'", ['admin@lawblog.com']);

            if (checkRes.rows.length === 0) {
                console.log("❌ User not found or not an admin.");
            } else {
                const userId = checkRes.rows[0].id;
                console.log(`Found user: ${checkRes.rows[0].name} (ID: ${userId})`);

                // Check and delete dependent posts if they exist
                // We wrap this in try-catch in case 'posts' table doesn't exist (though error said it does)
                try {
                    console.log("Deleting/Unlinking dependent records in 'posts' table...");
                    // Try to finding column name, assuming author_id based on error "posts_author_id_fkey"
                    const deletePosts = await client.query("DELETE FROM posts WHERE author_id = $1", [userId]);
                    console.log(`✅ Deleted ${deletePosts.rowCount} posts linked to this user.`);
                } catch (fkErr) {
                    console.log("⚠️ Could not delete from 'posts' (table might not exist or column differs):", fkErr.message);
                }

                // Now delete the user
                const deleteRes = await client.query("DELETE FROM users WHERE id = $1 RETURNING *", [userId]);
                console.log(`✅ User deleted successfully: ${deleteRes.rows[0].email}`);
            }
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("❌ Error executing deletion:", err);
    } finally {
        await pool.end();
    }
};

setTimeout(deleteAdmin, 1000);
