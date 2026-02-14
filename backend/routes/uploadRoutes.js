const express = require('express');
const router = express.Router();
const { upload, optimizeImage } = require('../middlewares/uploadMiddleware');

router.post('/', upload.single('image'), optimizeImage, (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No image uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({ url: imageUrl });
});

module.exports = router;
