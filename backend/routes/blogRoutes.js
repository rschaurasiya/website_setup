const express = require('express');
const router = express.Router();
const { getBlogs, getBlogBySlug, getBlogById, createBlog, updateBlog, deleteBlog, getAdminBlogs, getMyBlogs, reviewBlog } = require('../controllers/blogController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload, optimizeImage } = require('../middlewares/uploadMiddleware');

router.get('/', getBlogs);
router.get('/admin/all', protect, admin, getAdminBlogs);
router.get('/author/my', protect, getMyBlogs);
router.get('/id/:id', getBlogById);
router.get('/:slug', getBlogBySlug);
router.post('/', protect, upload.single('image'), optimizeImage, createBlog);
router.put('/:id', protect, upload.single('image'), optimizeImage, updateBlog);
router.put('/:id/review', protect, admin, reviewBlog); // New Route
router.delete('/:id', protect, deleteBlog);

module.exports = router;
