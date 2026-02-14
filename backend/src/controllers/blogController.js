const { Blog, User, Category, Comment } = require('../models');

// @desc    Get all blogs
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
    try {
        const { category } = req.query;
        let where = { status: 'published' }; // Default to published only for public

        // Filter by category slug if provided
        if (category) {
            const cat = await Category.findOne({ where: { slug: category } });
            if (cat) {
                where.categoryId = cat.id;
            }
        }

        const blogs = await Blog.findAll({
            where,
            include: [
                { model: User, as: 'author', attributes: ['name'] },
                { model: Category, as: 'category', attributes: ['name', 'slug'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single blog by slug or ID
// @route   GET /api/blogs/:id
// @access  Public
const getBlogById = async (req, res) => {
    try {
        // Try to find by ID first, if not UUID, try slug (if logic permits, but here ID is UUID)
        // Simplest is generic find
        const blog = await Blog.findByPk(req.params.id, {
            include: [
                { model: User, as: 'author', attributes: ['name'] },
                { model: Category, as: 'category', attributes: ['name', 'slug'] },
                {
                    model: Comment,
                    as: 'comments',
                    include: { model: User, as: 'user', attributes: ['name'] }
                }
            ]
        });

        if (blog) {
            res.json(blog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get author's own blogs
// @route   GET /api/blogs/author/my
// @access  Private/Author
const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            where: { authorId: req.user.id },
            include: [
                { model: Category, as: 'category', attributes: ['name', 'slug'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(blogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all blogs for admin (with pagination)
// @route   GET /api/blogs/admin/all
// @access  Private/Admin
const getAdminBlogs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const { count, rows } = await Blog.findAndCountAll({
            include: [
                { model: User, as: 'author', attributes: ['name'] },
                { model: Category, as: 'category', attributes: ['name', 'slug'] }
            ],
            order: [['createdAt', 'DESC']],
            limit,
            offset
        });

        res.json({
            blogs: rows,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            totalBlogs: count
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a blog
// @route   POST /api/blogs
// @access  Private (Admin/Author)
const createBlog = async (req, res) => {
    try {
        const { title, content, categoryId, status } = req.body;

        // Simple slug generation
        const slug = title.toLowerCase().replace(/ /g, '-') + '-' + Date.now();
        const image = req.file ? `/uploads/blog-images/${req.file.filename}` : null;

        const blog = await Blog.create({
            title,
            slug,
            content,
            image,
            status: status || 'draft',
            authorId: req.user.id,
            categoryId
        });

        res.status(201).json(blog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin/Author)
const updateBlog = async (req, res) => {
    try {
        const { title, content, categoryId, status } = req.body;
        const blog = await Blog.findByPk(req.params.id);

        if (blog) {
            // Check if user is author or admin
            if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to update this blog' });
            }

            blog.title = title || blog.title;
            blog.content = content || blog.content;
            blog.categoryId = categoryId || blog.categoryId;
            blog.status = status || blog.status;

            if (req.file) {
                blog.image = `/uploads/blog-images/${req.file.filename}`;
            }

            const updatedBlog = await blog.save();
            res.json(updatedBlog);
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin/Author)
const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.id);

        if (blog) {
            // Check if user is author or admin
            if (blog.authorId !== req.user.id && req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Not authorized to delete this blog' });
            }

            await blog.destroy();
            res.json({ message: 'Blog removed' });
        } else {
            res.status(404).json({ message: 'Blog not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog, getMyBlogs, getAdminBlogs };
