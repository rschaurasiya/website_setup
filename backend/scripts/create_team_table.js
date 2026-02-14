const db = require('../db');

const createTeamTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS team_members (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                bio TEXT,
                image TEXT,
                social_linkedin TEXT,
                social_twitter TEXT,
                social_email TEXT,
                ordering INT DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log("✅ team_members table created successfully");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error creating table:", error);
        process.exit(1);
    }
};

createTeamTable();
