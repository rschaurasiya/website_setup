const { pool } = require('./db');

(async () => {
    try {
        console.log('--- Fixing Slugs ---');
        const cats = await pool.query('SELECT * FROM categories');

        for (const cat of cats.rows) {
            const newSlug = cat.name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
            if (cat.slug !== newSlug) {
                console.log(`Updating ${cat.name}: '${cat.slug}' -> '${newSlug}'`);
                await pool.query('UPDATE categories SET slug = $1 WHERE id = $2', [newSlug, cat.id]);
            } else {
                console.log(`OK: ${cat.name} (${cat.slug})`);
            }
        }

        console.log('\n--- Checking Blogs in Criminal Law ---');
        const crimCat = await pool.query("SELECT * FROM categories WHERE slug LIKE '%criminal%'");
        if (crimCat.rows.length > 0) {
            const cat = crimCat.rows[0];
            console.log(`Category: ${cat.name}, Slug: ${cat.slug}`);
            const blogs = await pool.query('SELECT id, title, status FROM blogs WHERE category_id = $1', [cat.id]);
            console.log(`Found ${blogs.rows.length} blogs:`);
            console.table(blogs.rows);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
