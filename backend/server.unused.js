const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: '../.env' }); // Adjust path to point to root .env

const compression = require('compression'); // Performance: Gzip compression

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(compression()); // Enable Gzip compression
app.use(express.json({ limit: '10mb' })); // Strict limit but allowing for some data
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Uploads Directory
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

const uploadsPath = path.join(__dirname, '../uploads');
console.log('Static Uploads Path:', uploadsPath);
app.use('/uploads', express.static(uploadsPath));

// Routes Import
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/commentRoutes');
const creatorRequestRoutes = require('./routes/creatorRequestRoutes');
const contactRoutes = require('./routes/contactRoutes');
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
app.use('/api/about', aboutRoutes);
app.use('/api/team', teamRoutes);

console.log('Registering /api/settings route...');
app.use('/api/settings', require('./routes/settingsRoutes'));
console.log('Settings routes registered at /api/settings');

app.get('/api/debug-settings', (req, res) => {
    res.json({ message: 'Debug settings route is working' });
});

// Base Route
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handling
// Error Handling
const { errorHandler } = require('./middlewares/errorMiddleware');
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
