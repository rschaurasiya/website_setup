require('dotenv').config({ path: '../.env' });
const db = require('./db');

async function checkTeamImages() {
    try {
        const result = await db.query('SELECT id, name, image FROM team_members ORDER BY id DESC LIMIT 5');
        console.log('\n--- TEAM MEMBERS DUMP ---');
        result.rows.forEach(row => {
            console.log(`[ID: ${row.id}] Name: ${row.name} | Image: "${row.image}"`);
        });
        console.log('--- END DUMP ---\n');
    } catch (err) {
        console.error('Error querying DB:', err);
    }
    // We might need to close the pool if the script hangs, but db.js might not export a close method.
    // Usually process.exit() is fine for a one-off script.
    setTimeout(() => process.exit(0), 1000);
}

checkTeamImages();
