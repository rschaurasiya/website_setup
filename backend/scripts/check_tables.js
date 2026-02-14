const db = require('../db');

const checkAboutSchema = async () => {
    try {
        // List all tables to find the 'about' one
        const tables = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        console.log("TABLES FOUND:");
        console.table(tables.rows);

        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkAboutSchema();
