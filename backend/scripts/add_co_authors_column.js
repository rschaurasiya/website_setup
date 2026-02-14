const db = require('../db');

const addColumn = async () => {
    try {
        console.log("Adding co_authors column to blogs table...");
        const res = await db.query(`
            ALTER TABLE blogs 
            ADD COLUMN IF NOT EXISTS co_authors JSONB DEFAULT '[]'::jsonb;
        `);
        console.log("Column added successfully.");
        process.exit();
    } catch (err) {
        console.error("Failed to add column:", err);
        process.exit(1);
    }
};

addColumn();
