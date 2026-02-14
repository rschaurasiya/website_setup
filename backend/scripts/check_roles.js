const db = require('../db');

const checkRoles = async () => {
    try {
        const res = await db.query('SELECT DISTINCT role, COUNT(*) FROM users GROUP BY role');
        console.log('User Roles Distribution:', res.rows);
    } catch (err) {
        console.error('Error checking roles:', err);
    }
};

checkRoles();
