const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' }); // Load env vars from root

// Database Connection Configuration
// Supports both DATABASE_URL (production) and individual env vars (development)
const pool = new Pool(
    process.env.DATABASE_URL
        ? {
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        }
        : {
            user: process.env.DB_USER,
            host: process.env.DB_HOST,
            database: process.env.DB_NAME,
            password: process.env.DB_PASSWORD,
            port: process.env.DB_PORT || 5432,
        }
);

// Test Connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('❌ Error acquiring client', err.stack);
    }
    console.log('✅ Connected to PostgreSQL Database');
    release();
});

// Initialize Tables (Run this once or on startup)
const createTables = async () => {
    const client = await pool.connect();
    try {
        // Users Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(20) DEFAULT 'reader',
                is_blocked BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration for existing users table (is_blocked)
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='is_blocked') THEN 
                    ALTER TABLE users ADD COLUMN is_blocked BOOLEAN DEFAULT FALSE; 
                END IF; 
            END $$;
        `);

        // Migration for reset password (reset_code, reset_code_expires)
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_code') THEN 
                    ALTER TABLE users ADD COLUMN reset_code VARCHAR(10); 
                END IF; 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='reset_code_expires') THEN 
                    ALTER TABLE users ADD COLUMN reset_code_expires TIMESTAMP; 
                END IF;
            END $$;
        `);

        // Migration to make password nullable for Firebase Auth users
        await client.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password' AND is_nullable='NO') THEN 
                    ALTER TABLE users ALTER COLUMN password DROP NOT NULL; 
                END IF; 
            END $$;
        `);

        // Migration for profile fields (phone, address)
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN 
                    ALTER TABLE users ADD COLUMN phone VARCHAR(20); 
                END IF; 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='address') THEN 
                    ALTER TABLE users ADD COLUMN address TEXT; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='college') THEN 
                    ALTER TABLE users ADD COLUMN college VARCHAR(255); 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='position') THEN 
                    ALTER TABLE users ADD COLUMN position VARCHAR(255); 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='social_links') THEN 
                    ALTER TABLE users ADD COLUMN social_links JSONB DEFAULT '[]'; 
                END IF;
            END $$;
        `);

        // Categories Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                slug VARCHAR(100) UNIQUE NOT NULL,
                parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration for existing categories table
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='slug') THEN 
                    ALTER TABLE categories ADD COLUMN slug VARCHAR(100); 
                END IF; 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='categories' AND column_name='parent_id') THEN 
                    ALTER TABLE categories ADD COLUMN parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL; 
                END IF;
            END $$;
        `);

        // Blogs Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS blogs (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                slug VARCHAR(255) UNIQUE NOT NULL,
                content TEXT NOT NULL,
                image VARCHAR(255),
                status VARCHAR(20) DEFAULT 'draft',
                author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Creator Requests Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS creator_requests (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL,
                password VARCHAR(255),
                reason TEXT NOT NULL,
                social_link VARCHAR(255),
                status VARCHAR(20) DEFAULT 'pending',
                rejection_reason TEXT,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration for creator_requests (make password nullable, add user_id)
        await client.query(`
            DO $$ 
            BEGIN 
                IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creator_requests' AND column_name='password' AND is_nullable='NO') THEN 
                    ALTER TABLE creator_requests ALTER COLUMN password DROP NOT NULL; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='creator_requests' AND column_name='user_id') THEN 
                    ALTER TABLE creator_requests ADD COLUMN user_id INTEGER REFERENCES users(id) ON DELETE CASCADE; 
                END IF;
            END $$;
        `);

        // Comments Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS comments (
                id SERIAL PRIMARY KEY,
                content TEXT NOT NULL,
                blog_id INTEGER REFERENCES blogs(id) ON DELETE CASCADE,
                user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
                guest_name VARCHAR(100),
                guest_email VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // About Page Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS about_page (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                title VARCHAR(255),
                image VARCHAR(255),
                bio TEXT,
                email VARCHAR(255),
                phone VARCHAR(100),
                social_links JSONB DEFAULT '[]',
                education JSONB DEFAULT '[]',
                admissions JSONB DEFAULT '[]',
                speaking_engagements JSONB DEFAULT '[]',
                publications JSONB DEFAULT '[]',
                sections JSONB DEFAULT '[]',
                members JSONB DEFAULT '[]',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration for about_page (sections)
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='about_page' AND column_name='sections') THEN 
                    ALTER TABLE about_page ADD COLUMN sections JSONB DEFAULT '[]'; 
                END IF; 
            END $$;
        `);

        // Migration for about_page (members)
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='about_page' AND column_name='members') THEN 
                    ALTER TABLE about_page ADD COLUMN members JSONB DEFAULT '[]'; 
                END IF; 
            END $$;
        `);

        // Legal Pages Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS legal_pages (
                id SERIAL PRIMARY KEY,
                page_type VARCHAR(50) UNIQUE NOT NULL,
                sections JSONB DEFAULT '[]',
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Seed Default Legal Pages
        const seedLegalPages = async () => {
            const termsSections = [
                { title: "1. Introduction", content: "<p>Welcome to our platform. By accessing this website, you agree to these terms.</p>" },
                { title: "2. Intellectual Property Rights", content: "<p>We own the intellectual property rights for all material on this website.</p>" },
                { title: "3. Restrictions", content: "<p>You are specifically restricted from all of the following: publishing any website material in any other media.</p>" },
                { title: "4. Your Content", content: "<p>In these Website Standard Terms and Conditions, 'Your Content' shall mean any audio, video text, images or other material you choose to display on this Website.</p>" },
                { title: "5. No Warranties", content: "<p>This Website is provided 'as is,' with all faults, and we express no representations or warranties.</p>" },
                { title: "6. Governing Law", content: "<p>These Terms will be governed by and interpreted in accordance with the laws of the State of Country.</p>" }
            ];

            const privacySections = [
                { title: "1. Information We Collect", content: "<p>We utilize the following types of information...</p>" },
                { title: "2. How We Use Your Information", content: "<p>We use the information we collect in various ways, including to provide, operate, and maintain our website.</p>" },
                { title: "3. Cookies and Tracking", content: "<p>Like any other website, we use 'cookies'. These cookies are used to store information including visitors' preferences.</p>" },
                { title: "4. Third-Party Links", content: "<p>Our Service may contain links to other sites that are not operated by us.</p>" },
                { title: "5. Data Security", content: "<p>We value your trust in providing us your Personal Information, thus we are striving to use commercially acceptable means of protecting it.</p>" }
            ];

            await client.query(`
                INSERT INTO legal_pages (page_type, sections)
                VALUES ('terms', $1)
                ON CONFLICT (page_type) DO NOTHING;
            `, [JSON.stringify(termsSections)]);

            await client.query(`
                INSERT INTO legal_pages (page_type, sections)
                VALUES ('privacy', $1)
                ON CONFLICT (page_type) DO NOTHING;
            `, [JSON.stringify(privacySections)]);
        };
        await seedLegalPages();

        // Homepage Settings Table
        await client.query(`
            CREATE TABLE IF NOT EXISTS homepage_settings (
                id SERIAL PRIMARY KEY,
                headline TEXT,
                subheadline TEXT,
                cta_text VARCHAR(100) DEFAULT 'Read Articles',
                background_type VARCHAR(20) DEFAULT 'image',
                background_url TEXT,
                overlay_opacity DECIMAL(3,2) DEFAULT 0.50,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        // Seed default settings if empty
        const settingsCheck = await client.query('SELECT * FROM homepage_settings LIMIT 1');
        if (settingsCheck.rows.length === 0) {
            await client.query(`
                INSERT INTO homepage_settings (headline, subheadline, background_type, background_url)
                VALUES ($1, $2, 'image', 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')
            `, [
                'Decoding the Law, <span class="text-amber-400">Simplifying Justice</span>',
                'A dedicated platform for law students and professionals.'
            ]);
            console.log('✅ Default Homepage Settings Seeded');
        }

        // Seed Default Admin
        const adminEmail = 'chaurasiyachand26@gmail.com';
        const adminCheck = await client.query('SELECT * FROM users WHERE email = $1', [adminEmail]);

        if (adminCheck.rows.length === 0) {
            const bcrypt = require('bcryptjs');
            const hashedPassword = await bcrypt.hash('radhe123', 10);
            await client.query(`
                INSERT INTO users (name, email, password, role)
                VALUES ($1, $2, $3, 'admin')
            `, ['Super Admin', adminEmail, hashedPassword]);
            console.log('✅ Default Admin User Created');
        } else {
            // Ensure existing user is admin
            await client.query("UPDATE users SET role = 'admin' WHERE email = $1", [adminEmail]);
            console.log('✅ Admin Access Verified for existing user');
        }

        // Add Indexes for Performance Optimization
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug);
            CREATE INDEX IF NOT EXISTS idx_blogs_author_id ON blogs(author_id);
            CREATE INDEX IF NOT EXISTS idx_blogs_category_id ON blogs(category_id);
            CREATE INDEX IF NOT EXISTS idx_blogs_status ON blogs(status);
            CREATE INDEX IF NOT EXISTS idx_blogs_created_at ON blogs(created_at DESC);
            CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
            CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
            CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
        `);
        console.log('✅ Database Indexes Verified');

        console.log('✅ Tables created/verified successfully');
    } catch (err) {
        console.error('❌ Error creating tables:', err);
    } finally {
        client.release();
    }
};

// Call function to ensure tables exist
createTables();

module.exports = {
    query: (text, params) => pool.query(text, params),
    pool
};
