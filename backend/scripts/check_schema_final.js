const db = require('../db');

const checkSchema = async () => {
    try {
        const res = await db.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users';
        `);
        console.table(res.rows);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkSchema();
