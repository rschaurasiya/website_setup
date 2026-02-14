const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Process Image Function
const processImage = async (buffer, originalName) => {
    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'blog-' + uniqueSuffix + '.webp';
        const outputPath = path.join(uploadDir, filename);

        await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true }) // Resize to max 1200px width
            .webp({ quality: 80 }) // Convert to WebP, 80% quality
            .toFile(outputPath);

        return {
            filename: filename,
            path: outputPath,
            destination: uploadDir,
            mimetype: 'image/webp' // Update mime type
        };
    } catch (error) {
        throw error;
    }
};

module.exports = { processImage };
