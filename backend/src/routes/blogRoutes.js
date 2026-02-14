const express = require('express');
const { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog, getMyBlogs, getAdminBlogs } = require('../controllers/blogController');
const { addComment } = require('../controllers/commentController');
const { protect, admin, author } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.get('/', getBlogs);

// Specific routes must come before /:id
router.get('/admin/all', protect, admin, getAdminBlogs);
router.get('/author/my', protect, author, getMyBlogs);

router.get('/:id', getBlogById);

// Admin/Author Routes
router.post('/', protect, author, upload.single('image'), createBlog);
router.put('/:id', protect, author, upload.single('image'), updateBlog);
router.delete('/:id', protect, author, deleteBlog);

// Nested Comment Route
router.post('/:id/comments', protect, addComment);

module.exports = router;
