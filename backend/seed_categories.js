const { pool } = require('./db');

const seedCategories = async () => {
    const client = await pool.connect();
    try {
        console.log('Seeding categories...');

        const categories = [
            'Civil Law',
            'Constitution',
            'Case Studies'
        ];

        for (const cat of categories) {
            const slug = cat.toLowerCase().replace(/ /g, '-');

            // Check if exists
            const check = await client.query('SELECT * FROM categories WHERE name = $1', [cat]);

            if (check.rows.length === 0) {
                await client.query('INSERT INTO categories (name, slug) VALUES ($1, $2)', [cat, slug]);
                console.log(`✅ Added: ${cat}`);
            } else {
                console.log(`ℹ️ Already exists: ${cat}`);
            }
        }

    } catch (err) {
        console.error('❌ Error seeding categories:', err);
    } finally {
        client.release();
        process.exit();
    }
};

seedCategories();
