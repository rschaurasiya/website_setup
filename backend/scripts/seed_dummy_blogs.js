const db = require('../db');

const seedBlogs = async () => {
    try {
        console.log('🌱 Seeding dummy blogs...');

        // Get an author (admin)
        const userRes = await db.query('SELECT id FROM users LIMIT 1');
        if (userRes.rows.length === 0) {
            console.error('❌ No users found. Create a user first.');
            process.exit(1);
        }
        const authorId = userRes.rows[0].id;

        // Get a category
        const catRes = await db.query('SELECT id FROM categories LIMIT 1');
        let categoryId = null;
        if (catRes.rows.length > 0) {
            categoryId = catRes.rows[0].id;
        }

        const blogs = [
            { title: 'Understanding Constitutional Law', slug: 'understanding-constitutional-law', content: 'Content about constitutional law...' },
            { title: 'Criminal Justice System', slug: 'criminal-justice-system', content: 'Content about criminal justice...' },
            { title: 'Civil Rights Movement', slug: 'civil-rights-movement', content: 'Content about civil rights...' }
        ];

        for (const blog of blogs) {
            await db.query(
                'INSERT INTO blogs (title, slug, content, author_id, category_id, status) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (slug) DO NOTHING',
                [blog.title, blog.slug, blog.content, authorId, categoryId, 'published']
            );
        }

        console.log(`✅ Seeded ${blogs.length} blogs.`);

        const countRes = await db.query('SELECT COUNT(*) FROM blogs');
        console.log('Total Blogs Now:', countRes.rows[0].count);

    } catch (err) {
        console.error('Error seeding blogs:', err);
    }
    process.exit();
};

seedBlogs();
