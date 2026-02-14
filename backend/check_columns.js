const { pool } = require('./db');

(async () => {
    try {
        console.log('Checking columns in users table...');
        const res = await pool.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users'");
        console.log('Columns found:');
        res.rows.forEach(r => console.log(` - ${r.column_name} (${r.data_type})`));
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
})();
