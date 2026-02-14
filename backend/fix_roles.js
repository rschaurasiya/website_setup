const { pool } = require('./db');

const fixRoles = async () => {
    try {
        console.log('Fixing roles in database...');
        const result = await pool.query(`
            UPDATE users 
            SET role = 'author' 
            WHERE role = 'approved_creator'
            RETURNING id, name, email, role
        `);
        console.log(`Updated ${result.rows.length} users to 'author' role.`);
        result.rows.forEach(u => console.log(` - ${u.name} (${u.email})`));
        process.exit(0);
    } catch (err) {
        console.error('Error fixing roles:', err);
        process.exit(1);
    }
};

fixRoles();
