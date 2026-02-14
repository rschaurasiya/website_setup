const db = require('../db');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
    const { category, author, search, date, sort, page = 1, limit = 9 } = req.query; // Default limit 9
    const offset = (page - 1) * limit;

    try {
        let queryText = `
            SELECT b.*, u.name as author_name, u.username as author_username, u.profile_photo as author_photo, c.name as category_name, c.slug as category_slug, c.parent_id
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.status = 'published'
        `;
        const queryParams = [];
        let paramCount = 0;

        if (category) {
            // First, find the category to check if it's a parent or child
            const catResult = await db.query('SELECT id, parent_id FROM categories WHERE slug = $1', [category]);

            if (catResult.rows.length > 0) {
                const catData = catResult.rows[0];

                if (catData.parent_id === null) {
                    // It's a main category, fetch blogs for this category AND its subcategories
                    // 1. Get all subcategory IDs
                    const subCats = await db.query('SELECT id FROM categories WHERE parent_id = $1', [catData.id]);
                    const allCatIds = [catData.id, ...subCats.rows.map(sc => sc.id)];

                    paramCount++;
                    queryText += ` AND b.category_id = ANY($${paramCount}:: int[])`;
                    queryParams.push(allCatIds);
                } else {
                    // It's a subcategory, strict match
                    paramCount++;
                    queryText += ` AND c.slug = $${paramCount} `;
                    queryParams.push(category);
                }
            } else {
                // Category not found (ignore or return empty?)
                // If slug provided but invalid, return empty matches
                paramCount++;
                queryText += ` AND c.slug = $${paramCount} `; // Will return 0 rows
                queryParams.push(category);
            }
        }

        if (author) {
            paramCount++;
            queryText += ` AND b.author_id = $${paramCount} `;
            queryParams.push(author);
        }

        if (search) {
            paramCount++;
            queryText += ` AND(b.title ILIKE $${paramCount} OR b.content ILIKE $${paramCount})`;
            queryParams.push(`%${search}%`);
        }

        if (date) {
            paramCount++;
            queryText += ` AND DATE(b.created_at) = $${paramCount} `;
            queryParams.push(date);
        }

        // Count total matching rows for pagination metadata
        // Build a separate count query with same filters
        let countQueryText = `
            SELECT COUNT(*) FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.status = 'published'
        `;

        // Apply the same filters to count query
        let countParamIndex = 0;
        const countParams = [];

        if (category) {
            const catResult = await db.query('SELECT id, parent_id FROM categories WHERE slug = $1', [category]);
            if (catResult.rows.length > 0) {
                const catData = catResult.rows[0];
                if (catData.parent_id === null) {
                    const subCats = await db.query('SELECT id FROM categories WHERE parent_id = $1', [catData.id]);
                    const allCatIds = [catData.id, ...subCats.rows.map(sc => sc.id)];
                    countParamIndex++;
                    countQueryText += ` AND b.category_id = ANY($${countParamIndex}::int[])`;
                    countParams.push(allCatIds);
                } else {
                    countParamIndex++;
                    countQueryText += ` AND c.slug = $${countParamIndex}`;
                    countParams.push(category);
                }
            } else {
                countParamIndex++;
                countQueryText += ` AND c.slug = $${countParamIndex}`;
                countParams.push(category);
            }
        }

        if (author) {
            countParamIndex++;
            countQueryText += ` AND b.author_id = $${countParamIndex}`;
            countParams.push(author);
        }

        if (search) {
            countParamIndex++;
            countQueryText += ` AND (b.title ILIKE $${countParamIndex} OR b.content ILIKE $${countParamIndex})`;
            countParams.push(`%${search}%`);
        }

        if (date) {
            countParamIndex++;
            countQueryText += ` AND DATE(b.created_at) = $${countParamIndex}`;
            countParams.push(date);
        }

        const countResult = await db.query(countQueryText, countParams);
        const total = parseInt(countResult.rows[0].count);


        // Sorting
        if (sort === 'oldest') {
            queryText += ` ORDER BY b.created_at ASC`;
        } else {
            queryText += ` ORDER BY b.created_at DESC`; // Default newset
        }

        // Pagination
        paramCount++;
        queryText += ` LIMIT $${paramCount} `;
        queryParams.push(limit);

        paramCount++;
        queryText += ` OFFSET $${paramCount} `;
        queryParams.push(offset);


        const result = await db.query(queryText, queryParams);

        res.status(200).json({
            blogs: result.rows,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error in getBlogs:', error);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, u.name as author_name, u.username as author_username, u.profile_photo as author_photo, u.college as author_college, u.role as author_role, c.name as category_name, c.slug as category_slug
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.slug = $1
            `, [req.params.slug]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const blog = result.rows[0];

        // Fetch Co-Authors details
        if (blog.co_authors && Array.isArray(blog.co_authors) && blog.co_authors.length > 0) {
            const coAuthorIds = blog.co_authors;
            const coAuthorsRes = await db.query(`
                SELECT id, name, profile_photo, college, role 
                FROM users 
                WHERE id = ANY($1:: int[])
            `, [coAuthorIds]);
            blog.co_author_details = coAuthorsRes.rows;
        } else {
            blog.co_author_details = [];
        }

        res.status(200).json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get single blog by ID
// @route   GET /api/blogs/id/:id
// @access  Public
const getBlogById = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, u.name as author_name, u.username as author_username, u.profile_photo as author_photo, u.college as author_college, u.role as author_role, c.name as category_name, c.slug as category_slug
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.id = $1
            `, [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const blog = result.rows[0];

        // Fetch Co-Authors details
        if (blog.co_authors && Array.isArray(blog.co_authors) && blog.co_authors.length > 0) {
            const coAuthorIds = blog.co_authors;
            const coAuthorsRes = await db.query(`
                SELECT id, name, profile_photo, college, role 
                FROM users 
                WHERE id = ANY($1:: int[])
            `, [coAuthorIds]);
            blog.co_author_details = coAuthorsRes.rows;
        } else {
            blog.co_author_details = [];
        }

        res.status(200).json(blog);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private
const createBlog = async (req, res) => {
    const { title, content, categoryId, status, created_at, coAuthors } = req.body;

    if (!title || !content) {
        return res.status(400).json({ message: 'Please add title and content' });
    }

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const finalDate = created_at || new Date(); // Use provided date or now

    // Ensure coAuthors is a valid JSON array or empty
    const coAuthorsJson = coAuthors ? JSON.stringify(JSON.parse(coAuthors)) : '[]';

    // FORCE STATUS TO DRAFT OR PENDING
    // Admin can create published immediately
    let initialStatus = 'draft';
    if (req.user.role === 'admin') {
        initialStatus = status || 'published';
    } else {
        initialStatus = status === 'pending' ? 'pending' : 'draft';
    }

    try {
        const result = await db.query(
            'INSERT INTO blogs (title, slug, content, image, status, author_id, category_id, created_at, co_authors) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [title, slug, content, image, initialStatus, req.user.id, categoryId, finalDate, coAuthorsJson]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private
const updateBlog = async (req, res) => {
    const { title, content, categoryId, status, created_at, coAuthors } = req.body;
    const { id } = req.params;

    try {
        // First check ownership
        const blogCheck = await db.query('SELECT * FROM blogs WHERE id = $1', [id]);
        if (blogCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const currentBlog = blogCheck.rows[0];

        // Ensure user is author (or admin)
        if (currentBlog.author_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        let updateQuery = 'UPDATE blogs SET updated_at = CURRENT_TIMESTAMP';
        const queryParams = [id];
        let paramCount = 1;

        if (title !== undefined) {
            paramCount++;
            updateQuery += `, title = $${paramCount} `;
            queryParams.push(title);
        }
        if (content !== undefined) {
            paramCount++;
            updateQuery += `, content = $${paramCount} `;
            queryParams.push(content);
        }
        if (categoryId !== undefined && categoryId !== '') {
            paramCount++;
            updateQuery += `, category_id = $${paramCount} `;
            queryParams.push(categoryId);
        }

        // Status Logic
        if (status !== undefined) {
            // Creators can only set to 'draft' or 'pending'
            let newStatus = status;
            if (req.user.role !== 'admin' && (status === 'published' || status === 'approved')) {
                newStatus = 'pending'; // Auto-demote to pending if they try to publish
            }

            paramCount++;
            updateQuery += `, status = $${paramCount} `;
            queryParams.push(newStatus);
        }

        if (created_at !== undefined) {
            paramCount++;
            updateQuery += `, created_at = $${paramCount} `;
            queryParams.push(created_at);
        }

        if (coAuthors !== undefined) {
            let parsedCoAuthors = [];
            try {
                // Handle both JSON string (from FormData) and raw array (if sent via JSON)
                parsedCoAuthors = typeof coAuthors === 'string' ? JSON.parse(coAuthors) : coAuthors;
                if (!Array.isArray(parsedCoAuthors)) parsedCoAuthors = [];
            } catch (e) {
                console.error("Failed to parse coAuthors", e);
                parsedCoAuthors = [];
            }

            paramCount++;
            updateQuery += `, co_authors = $${paramCount} `;
            queryParams.push(JSON.stringify(parsedCoAuthors));
        }

        if (req.file) {
            paramCount++;
            updateQuery += `, image = $${paramCount} `;
            queryParams.push(`/uploads/${req.file.filename}`);
        }

        updateQuery += ` WHERE id = $1 RETURNING * `;

        const result = await db.query(updateQuery, queryParams);
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Update Blog Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Review Blog (Admin)
// @route   PUT /api/blogs/:id/review
// @access  Private/Admin
const reviewBlog = async (req, res) => {
    const { action, reason } = req.body;
    const { id } = req.params;

    try {
        const blogCheck = await db.query(`
            SELECT b.*, u.name, u.email 
            FROM blogs b
            JOIN users u ON b.author_id = u.id
            WHERE b.id = $1
            `, [id]);

        if (blogCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }
        const blog = blogCheck.rows[0];
        const { sendBlogStatusUpdate } = require('../services/emailService');

        if (action === 'publish' || action === 'approve') {
            await db.query("UPDATE blogs SET status = 'published', rejection_reason = NULL WHERE id = $1", [id]);
            await sendBlogStatusUpdate({ name: blog.name, email: blog.email }, blog, 'published');
            res.json({ message: 'Blog published' });
        } else if (action === 'reject') {
            await db.query("UPDATE blogs SET status = 'rejected', rejection_reason = $2 WHERE id = $1", [id, reason]);
            await sendBlogStatusUpdate({ name: blog.name, email: blog.email }, blog, 'rejected', reason);
            res.json({ message: 'Blog rejected' });
        } else {
            res.status(400).json({ message: 'Invalid action' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private
const deleteBlog = async (req, res) => {
    try {
        // Check ownership
        const blogCheck = await db.query('SELECT * FROM blogs WHERE id = $1', [req.params.id]);
        if (blogCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        if (blogCheck.rows[0].author_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        await db.query('DELETE FROM blogs WHERE id = $1', [req.params.id]);
        res.status(200).json({ message: 'Blog removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all blogs (Admin)
// @route   GET /api/blogs/admin/all
// @access  Private/Admin
const getAdminBlogs = async (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    try {
        const result = await db.query(`
            SELECT b.*, u.name as author_name, u.username as author_username, c.name as category_name 
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            LEFT JOIN categories c ON b.category_id = c.id
            ORDER BY b.created_at DESC
            LIMIT $1 OFFSET $2
            `, [limit, offset]);

        const count = await db.query('SELECT COUNT(*) FROM blogs');

        res.status(200).json({
            blogs: result.rows,
            totalPages: Math.ceil(count.rows[0].count / limit),
            currentPage: parseInt(page)
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get my blogs (Author)
// @route   GET /api/blogs/author/my
// @access  Private
const getMyBlogs = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT b.*, u.name as author_name, u.username as author_username, c.name as category_name 
            FROM blogs b
            LEFT JOIN users u ON b.author_id = u.id
            LEFT JOIN categories c ON b.category_id = c.id
            WHERE b.author_id = $1
            ORDER BY b.created_at DESC
            `, [req.user.id]);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getBlogs,
    getBlogBySlug,
    getBlogById,
    createBlog,
    updateBlog,
    deleteBlog,
    getAdminBlogs,
    getMyBlogs,
    reviewBlog // New
};
