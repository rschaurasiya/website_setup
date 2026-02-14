const { Comment, Blog } = require('../models');

// @desc    Add a comment
// @route   POST /api/blogs/:id/comments
// @access  Private
const addComment = async (req, res) => {
    try {
        const { content } = req.body;
        const blog = await Blog.findByPk(req.params.id);

        if (!blog) {
            return res.status(404).json({ message: 'Blog not found' });
        }

        const comment = await Comment.create({
            content,
            blogId: req.params.id,
            userId: req.user.id
        });

        res.status(201).json(comment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private/Admin
const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        // Check if user is owner or admin
        if (comment.userId !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await comment.destroy();
        res.json({ message: 'Comment removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { addComment, deleteComment };
