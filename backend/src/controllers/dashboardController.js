const { Blog, User, Comment, Category } = require('../models');

// @desc    Get dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
    try {
        const totalBlogs = await Blog.count();
        const totalUsers = await User.count();
        const totalComments = await Comment.count();
        const totalCategories = await Category.count();

        // Get recent 5 blogs
        const recentBlogs = await Blog.findAll({
            limit: 5,
            order: [['createdAt', 'DESC']],
            include: [{ model: User, as: 'author', attributes: ['name'] }]
        });

        res.json({
            totalBlogs,
            totalUsers,
            totalComments,
            totalCategories,
            recentBlogs
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardStats };
