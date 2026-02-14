const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const { processImage } = require('../utils/imageProcessor');

// Multer Setup
const storage = multer.memoryStorage(); // Store files in memory for processing

const fileFilter = (req, file, cb) => {
    // Allowed Mime Types
    const allowedImages = ['image/jpeg', 'image/png', 'image/webp'];
    const allowedVideos = ['video/mp4', 'video/webm'];

    if (allowedImages.includes(file.mimetype)) {
        cb(null, true);
    } else if (allowedVideos.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, WEBP images and MP4, WEBM videos are allowed.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB Limit
});

// Middleware to process image after upload
const optimizeImage = async (req, res, next) => {
    if (!req.file) return next();

    // If it's a video, we need to save it manually since we are using memoryStorage now
    if (req.file.mimetype.startsWith('video/')) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'video-' + uniqueSuffix + path.extname(req.file.originalname);
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const outputPath = path.join(uploadDir, filename);

        try {
            fs.writeFileSync(outputPath, req.file.buffer);
            req.file.filename = filename;
            req.file.path = outputPath;
            req.file.destination = uploadDir;
            return next();
        } catch (error) {
            return next(error);
        }
    }

    // Process Image
    try {
        const processed = await processImage(req.file.buffer, req.file.originalname);
        req.file.filename = processed.filename;
        req.file.path = processed.path;
        req.file.destination = processed.destination;
        req.file.mimetype = processed.mimetype;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { upload, optimizeImage };
