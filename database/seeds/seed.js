const sequelize = require('../../backend/src/config/database');
const { User, Category, Blog } = require('../../backend/src/models');
require('../../backend/src/models/index'); // Ensure associations

const seed = async () => {
    try {
        console.log('Connecting to database...');
        await sequelize.authenticate();
        console.log('Syncing models...');
        // force: true drops tables and re-creates them
        await sequelize.sync({ force: true });

        console.log('Creating Admin User...');
        const admin = await User.create({
            name: 'Chand Chaurasiya',
            email: 'admin@lawblog.com',
            password: 'adminpassword', // Will be hashed by User model hook
            role: 'admin'
        });

        console.log('Creating Categories...');
        const criminal = await Category.create({ name: 'Criminal Law', slug: 'criminal-law' });
        const civil = await Category.create({ name: 'Civil Law', slug: 'civil-law' });
        const constitution = await Category.create({ name: 'Constitution', slug: 'constitution' });
        await Category.create({ name: 'Case Studies', slug: 'case-studies' });

        console.log('Creating Sample Blog...');
        await Blog.create({
            title: 'Welcome to your Law Blog',
            slug: 'welcome-to-law-blog',
            content: 'This is your first blog post. You can edit or delete it from the Admin Dashboard.',
            status: 'published',
            authorId: admin.id,
            categoryId: constitution.id,
            image: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80'
        });

        console.log('✅ Database seeded successfully!');
        console.log('Admin Credentials: email=admin@lawblog.com, password=adminpassword');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seed();
