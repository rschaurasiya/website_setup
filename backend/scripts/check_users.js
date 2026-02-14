const db = require('../db');

const checkUsers = async () => {
    try {
        const res = await db.query("SELECT id, name, email, role, is_blocked, blocked_at FROM users;");
        console.log("Users Found:", res.rowCount);
        console.table(res.rows);
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUsers();
