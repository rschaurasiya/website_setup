const db = require('./db');

async function checkSchema() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.log('Columns in users table:', res.rows.map(r => `${r.column_name} (${r.data_type})`));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit();
    }
}

checkSchema();
