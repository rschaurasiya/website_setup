const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: '../.env' }); // Adjust path to point to root .env

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Uploads Directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes Import
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/commentRoutes');
const creatorRequestRoutes = require('./routes/creatorRequestRoutes');
const contactRoutes = require('./routes/contactRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aboutRoutes = require('./routes/aboutRoutes');
const teamRoutes = require('./routes/teamRoutes');

// Routes Usage
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/creator-requests', creatorRequestRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/about', aboutRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/legal', require('./routes/legalRoutes'));
app.use('/', require('./routes/seoRoutes')); // Mount at root for /sitemap.xml and /robots.txt

// Base Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Start Server
const { initCronJobs } = require('./src/utils/cronJobs');
initCronJobs();

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
