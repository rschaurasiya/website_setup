const { pool } = require('./db');

(async () => {
    try {
        console.log('--- Categories ---');
        const cats = await pool.query('SELECT * FROM categories');
        console.table(cats.rows);

        console.log('\n--- Blogs in "Criminal Law" (or similar) ---');
        // Find category id for criminal law
        const crimCat = cats.rows.find(c => c.name.toLowerCase().includes('criminal'));

        if (crimCat) {
            console.log(`Found Category: ${crimCat.name} (ID: ${crimCat.id}, Slug: ${crimCat.slug})`);
            const blogs = await pool.query('SELECT id, title, status, category_id FROM blogs WHERE category_id = $1', [crimCat.id]);
            console.table(blogs.rows);
        } else {
            console.log('No "Criminal" category found.');
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
