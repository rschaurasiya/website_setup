const db = require('../db');

const addBlockedAt = async () => {
    try {
        await db.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS blocked_at TIMESTAMP;");
        console.log("Added blocked_at column successfully.");
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

addBlockedAt();
