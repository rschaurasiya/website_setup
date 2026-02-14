const { Client } = require('pg');

const client = new Client({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'radhe123',
    database: 'llb_website_db',
});

async function checkUser() {
    try {
        await client.connect();
        console.log('Connected to DB');
        const res = await client.query("SELECT email, role FROM users WHERE email = 'rradheshyamkr2000@gmail.com'");
        if (res.rows.length > 0) {
            console.log('User Found:', res.rows[0]);
        } else {
            console.log('User NOT found');
        }
    } catch (err) {
        console.error('Error:', err);
    } finally {
        await client.end();
    }
}

checkUser();
