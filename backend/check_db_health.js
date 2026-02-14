const db = require('./db');

async function checkHealth() {
    console.log('--- Checking Database Health ---');
    try {
        const time = await db.query('SELECT NOW()');
        console.log('✅ Database Connected:', time.rows[0].now);

        const tables = ['users', 'blogs', 'about_page', 'homepage_settings', 'creator_requests', 'legal_pages'];

        for (const table of tables) {
            try {
                const count = await db.query(`SELECT COUNT(*) FROM ${table}`);
                console.log(`- ${table}: ${count.rows[0].count} records`);
            } catch (e) {
                console.log(`❌ ${table}: Error - ${e.message}`);
            }
        }

        // Check Admin User
        const admin = await db.query("SELECT email, role FROM users WHERE role = 'admin' LIMIT 1");
        if (admin.rows.length > 0) {
            console.log('✅ Admin User Found:', admin.rows[0].email);
        } else {
            console.log('❌ NO ADMIN USER FOUND');
        }

    } catch (err) {
        console.error('❌ FATAL: Database Connection Failed', err);
    } finally {
        process.exit();
    }
}

checkHealth();
