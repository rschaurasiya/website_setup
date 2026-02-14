const { pool } = require('../db');

const listUsers = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT id, name, email, role, password FROM users');
        console.log('Users found:', res.rows.length);
        res.rows.forEach(u => {
            console.log(`- ${u.name} (${u.email}) [${u.role}] - PwdHash: ${u.password ? u.password.substring(0, 10) + '...' : 'NULL'}`);
        });
        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
};

listUsers();
