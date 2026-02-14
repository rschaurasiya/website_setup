const { pool } = require('./db');

const seedCategories = async () => {
    // We create a new client to ensure we have a fresh connection
    // and we don't rely only on the exported pool if it's busy
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding hierarchical categories...');

        // 1. Ensure parent_id column exists
        // This makes the script robust against race conditions in db.js
        console.log('🔍 Checking for parent_id column...');
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='parent_id') THEN 
                    RAISE NOTICE 'Adding parent_id column...';
                    ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL; 
                END IF; 
            END $$;
        `);

        // 2. Data Structure
        const hierarchy = [
            {
                name: "Law",
                subs: [
                    "Constitutional Law",
                    "Criminal Law",
                    "Civil Law",
                    "Corporate Law",
                    "Human Rights",
                    "International Law",
                    "Environmental Law",
                    "Cyber Law",
                    "Family Law",
                    "Property Law"
                ]
            },
            {
                name: "Legal Studies & Practice",
                subs: [
                    "Legal Research & Methodology",
                    "Case Analysis / Case Commentary",
                    "Moot Court & Advocacy",
                    "Legal Updates & Amendments",
                    "Judicial Decisions Review"
                ]
            },
            {
                name: "Political & Social Affairs",
                subs: [
                    "Political Analysis",
                    "Governance & Public Policy",
                    "Democracy & Elections",
                    "Social Justice",
                    "Social Reforms",
                    "International Relations",
                    "Public Administration",
                    "Youth & Leadership"
                ]
            }
        ];

        // 3. Begin Transaction
        await client.query('BEGIN');

        console.log('🧹 Clearing old categories...');
        await client.query('TRUNCATE categories RESTART IDENTITY CASCADE');

        for (const mainCat of hierarchy) {
            const mainSlug = mainCat.name.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');

            console.log(`📌 Creating Main Category: ${mainCat.name}`);
            const mainRes = await client.query(
                'INSERT INTO categories (name, slug) VALUES ($1, $2) RETURNING id',
                [mainCat.name, mainSlug]
            );
            const mainId = mainRes.rows[0].id;

            for (const subName of mainCat.subs) {
                const subSlug = subName.toLowerCase().replace(/ & /g, '-').replace(/ \/ /g, '-').replace(/ /g, '-').replace(/[^\w-]+/g, '');

                console.log(`   ↳ Creating Subcategory: ${subName}`);
                await client.query(
                    'INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3)',
                    [subName, subSlug, mainId]
                );
            }
        }

        await client.query('COMMIT');
        console.log('✅ Categories seeded successfully!');

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Error seeding categories:', err);
    } finally {
        // Ensure we release the client
        client.release();
        // Give time for logs to flush
        setTimeout(() => {
            process.exit(0);
        }, 1000);
    }
};

// Use a timeout to ensure db.js connection is ready if possible, 
// though we handle the column check explicitly now.
setTimeout(seedCategories, 1000);
