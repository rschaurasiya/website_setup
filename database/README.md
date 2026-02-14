# Database - PostgreSQL

Database schema, migrations, and seed data for the law blog platform.

## 📂 Folder Structure

### `migrations/`
- Database version control
- Track schema changes over time
- **Examples**: `001_create_users_table.sql`, `002_create_blogs_table.sql`

### `seeds/`
- Sample data for development and testing
- **Examples**: `users.sql`, `sample_blogs.sql`, `categories.sql`

### `scripts/`
- Database utility scripts
- **Examples**: `backup.sh`, `restore.sh`, `reset-db.sh`

## 📊 Database Tables

### Core Tables:
1. **users** - User accounts and authentication
2. **blogs** - Blog posts content
3. **categories** - Blog categories/tags
4. **comments** - User comments on blogs
5. **roles** - User roles (admin, author, reader)
6. **media** - Uploaded files metadata

## 🔧 Setup

```bash
# Create database
createdb lawblog_db

# Run migrations
npm run migrate

# Seed database
npm run seed
```

## 🔐 Security

- Use environment variables for database credentials
- Enable SSL for production connections
- Regular backups scheduled
- Proper user permissions and roles
