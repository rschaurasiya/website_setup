const { pool } = require('./db');

const checkConstraints = async () => {
    const client = await pool.connect();
    try {
        console.log('Checking constraints on comments table...');
        const res = await client.query(`
            SELECT con.conname, 
                   request_conf.relname AS conf_table
            FROM pg_constraint con
            JOIN pg_class rel_request ON rel_request.oid = con.conrelid
            JOIN pg_namespace ns_request ON ns_request.oid = rel_request.relnamespace
            JOIN pg_class request_conf ON request_conf.oid = con.confrelid
            WHERE rel_request.relname = 'comments' 
              AND con.contype = 'f';
        `);

        console.log("Constraints:", res.rows);
    } catch (err) {
        console.error('Error:', err);
    } finally {
        client.release();
        process.exit();
    }
};

checkConstraints();
