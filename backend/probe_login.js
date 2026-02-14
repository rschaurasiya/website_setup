const db = require('./db');
const bcrypt = require('bcryptjs');

async function testLogin() {
    console.log('--- Testing DB Connection ---');
    try {
        const res = await db.query('SELECT NOW()');
        console.log('DB Connection OK:', res.rows[0]);
    } catch (err) {
        console.error('DB Connection FAILED:', err);
        return;
    }

    console.log('\n--- Testing User Query ---');
    const email = 'rradheshyamkr2000@gmail.com'; // Admin email
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        console.log('Query executed. Row count:', result.rows.length);

        if (result.rows.length === 0) {
            console.log('User not found.');
            return;
        }

        const user = result.rows[0];
        console.log('User data keys:', Object.keys(user));

        console.log('\n--- Testing Password Compare ---');
        // We can't verify password without knowing the plain text, but we can check if bcrypt works
        console.log('User password hash:', user.password);

        // Just hashing a dummy password to ensure bcrypt is working
        const hash = await bcrypt.hash('test', 10);
        console.log('Bcrypt test hash generated:', hash);

        console.log('College field:', user.college);
        console.log('Phone field:', user.phone);

    } catch (err) {
        console.error('Login Probe FAILED:', err);
    } finally {
        // Force exit because db pool might keep open
        process.exit();
    }
}

testLogin();
