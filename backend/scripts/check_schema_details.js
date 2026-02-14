const db = require('../db');

const checkSchema = async () => {
    try {
        console.log("--- SCHEMA CHECK ---");

        // 1. Creator Requests
        const requests = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'creator_requests'
        `);
        console.log("\n[CREATOR_REQUESTS] Columns:");
        console.table(requests.rows);

        // 2. Blogs
        const blogs = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'blogs'
        `);
        console.log("\n[BLOGS] Columns:");
        console.table(blogs.rows);

        process.exit();
    } catch (err) {
        console.error("SCHEMA ERROR:", err);
        process.exit(1);
    }
};

checkSchema();
