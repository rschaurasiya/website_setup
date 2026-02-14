const db = require('../db');

// Generate Sitemap.xml
const getSitemap = async (req, res) => {
    try {
        const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';

        // Static Pages
        const staticPages = [
            '',
            '/about',
            '/contact',
            '/login',
            '/signup',
            '/apply'
        ];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

        // Add Static Pages
        staticPages.forEach(page => {
            sitemap += `
    <url>
        <loc>${baseUrl}${page}</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>`;
        });

        // Fetch Blogs for Sitemap
        const blogResult = await db.query("SELECT slug, updated_at FROM blogs WHERE status = 'published'");
        blogResult.rows.forEach(blog => {
            sitemap += `
    <url>
        <loc>${baseUrl}/blog/${blog.slug}</loc>
        <lastmod>${new Date(blog.updated_at).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.9</priority>
    </url>`;
        });

        // Fetch Categories
        const catResult = await db.query("SELECT slug FROM categories");
        catResult.rows.forEach(cat => {
            sitemap += `
    <url>
        <loc>${baseUrl}/category/${cat.slug}</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
    </url>`;
        });

        // Fetch Authors
        const authorResult = await db.query("SELECT username FROM users WHERE role IN ('author', 'admin')");
        authorResult.rows.forEach(user => {
            sitemap += `
     <url>
         <loc>${baseUrl}/profile/${user.username}</loc>
         <changefreq>weekly</changefreq>
         <priority>0.7</priority>
     </url>`;
        });

        sitemap += `
</urlset>`;

        res.header('Content-Type', 'application/xml');
        res.send(sitemap);

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Generate robots.txt
const getRobots = (req, res) => {
    const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const robots = `User-agent: *
Allow: /
Sitemap: ${baseUrl}/sitemap.xml
`;
    res.type('text/plain');
    res.send(robots);
};

module.exports = {
    getSitemap,
    getRobots
};
