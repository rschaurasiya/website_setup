const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory, updateCategory } = require('../controllers/categoryController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/', getCategories);
router.post('/', protect, admin, createCategory);
router.put('/:id', protect, admin, updateCategory);
router.delete('/:id', protect, admin, deleteCategory);

module.exports = router;
