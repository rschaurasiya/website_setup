const { pool } = require('../db');
const bcrypt = require('bcryptjs');

const resetAdminPassword = async () => {
    try {
        const client = await pool.connect();
        const email = 'rradheshyamkr2000@gmail.com';
        const password = 'radhe123';

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await client.query('UPDATE users SET password = $1 WHERE email = $2', [hashedPassword, email]);
        console.log(`✅ Password reset for ${email}`);

        client.release();
    } catch (err) {
        console.error('Error:', err);
    } finally {
        process.exit();
    }
};

resetAdminPassword();
