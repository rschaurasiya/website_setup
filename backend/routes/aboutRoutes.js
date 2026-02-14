const express = require('express');
const router = express.Router();
const { getAboutData, updateAboutData } = require('../controllers/aboutController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload, optimizeImage } = require('../middlewares/uploadMiddleware');

router.get('/', getAboutData);
router.put('/', protect, admin, upload.single('image'), optimizeImage, updateAboutData);

// Member Routes removed - Team management is now handled via teamRoutes.js


module.exports = router;
