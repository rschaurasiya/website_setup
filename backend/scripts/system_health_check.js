const db = require('../db');

const checkSystemHealth = async () => {
    try {
        console.log("--- SYSTEM HEALTH CHECK ---");

        // 1. Users
        const users = await db.query("SELECT id, name, email, role, firebase_uid, is_blocked FROM users");
        console.log(`\n[USERS] Count: ${users.rowCount}`);
        console.table(users.rows);

        // 2. Blogs
        const blogs = await db.query("SELECT id, title, author_id, status FROM blogs");
        console.log(`\n[BLOGS] Count: ${blogs.rowCount}`);
        if (blogs.rowCount > 0) console.table(blogs.rows.slice(0, 5));

        // 3. Team
        const team = await db.query("SELECT id, name, role FROM team_members");
        console.log(`\n[TEAM] Count: ${team.rowCount}`);
        console.table(team.rows);

        // 4. About
        // Assuming about data might be in a specific table or hardcoded? User said "About page... empty".
        // Let's check for an 'about' table if it exists
        try {
            const about = await db.query("SELECT * FROM about_page");
            console.log(`\n[ABOUT] Count: ${about.rowCount}`);
            console.table(about.rows);
        } catch (e) {
            console.log("\n[ABOUT] Table 'about_page' not found or error:", e.message);
        }

        process.exit();
    } catch (err) {
        console.error("\nCRITICAL DATABASE ERROR:", err);
        process.exit(1);
    }
};

checkSystemHealth();
