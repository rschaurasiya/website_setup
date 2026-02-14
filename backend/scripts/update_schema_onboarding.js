const db = require('../db');

const runMigration = async () => {
    try {
        console.log("--- STARTING MIGRATION ---");

        // 1. Update creator_requests
        console.log("Updating creator_requests table...");
        await db.query(`
            ALTER TABLE creator_requests 
            ADD COLUMN IF NOT EXISTS qualification TEXT,
            ADD COLUMN IF NOT EXISTS contact_number VARCHAR(50),
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
            ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
            ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
            ADD CONSTRAINT chk_status CHECK (status IN ('pending', 'approved', 'rejected'));
        `);

        // 2. Update blogs
        console.log("Updating blogs table...");
        await db.query(`
            ALTER TABLE blogs 
            ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
            ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft';
        `);
        // Note: Existing status column might lack constraint or have different values. 
        // We generally rely on app logic, but dropping/adding constraint is safer if needed.
        // For now, assuming VARCHAR is flexible enough.

        console.log("✅ Migration Completed Successfully");
        process.exit();
    } catch (err) {
        console.error("MIGRATION ERROR:", err);
        // Ignore "constraint already exists" errors roughly
        if (err.code === '42710') {
            console.log("Constraint likely already exists. Continuing...");
            process.exit(0);
        }
        process.exit(1);
    }
};

runMigration();
