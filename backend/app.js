const express = require('express');
const cors = require('cors');
// const path = require('path');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const blogRoutes = require('./routes/blogRoutes');
const adminRoutes = require('./routes/adminRoutes');
const commentRoutes = require('./routes/commentRoutes');

app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
    res.send('Minimal API is running...');
});

app.listen(PORT, () => {
    console.log(`🚀 Minimal Server running on port ${PORT}`);
});
