const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { upload, optimizeImage } = require('../middlewares/uploadMiddleware');

router.get('/', getSettings);
router.put('/', protect, admin, upload.single('file'), optimizeImage, updateSettings);

module.exports = router;
