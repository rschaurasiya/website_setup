const { pool } = require('../db');

const verifyAdmin = async () => {
    const adminEmail = 'chaurasiyachand26@gmail.com';
    try {
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [adminEmail]);
        if (res.rows.length === 0) {
            console.log(`❌ User ${adminEmail} not found.`);
        } else {
            const user = res.rows[0];
            if (user.role === 'admin') {
                console.log(`✅ User ${adminEmail} found and has admin role.`);
            } else {
                console.log(`❌ User ${adminEmail} found but has role: ${user.role}`);
            }
        }
    } catch (err) {
        console.error('❌ Error verifying admin:', err);
    } finally {
        pool.end();
    }
};

// Wait for db connection
setTimeout(verifyAdmin, 2000);
