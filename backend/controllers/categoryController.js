const db = require('../db');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM categories ORDER BY id ASC'); // Order by ID to keep parents first usually, or specific order
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Create a category
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = async (req, res) => {
    const { name, parent_id } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Please add a category name' });
    }

    // Simple slug generation
    const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');

    try {
        const result = await db.query(
            'INSERT INTO categories (name, slug, parent_id) VALUES ($1, $2, $3) RETURNING *',
            [name, slug, parent_id || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Unique violation
            return res.status(400).json({ message: 'Category already exists' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res) => {
    try {
        const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING *', [req.params.id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.status(200).json({ message: 'Category removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res) => {
    const { name, parent_id } = req.body;
    const { id } = req.params;

    try {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        const result = await db.query(
            'UPDATE categories SET name = $1, slug = $2, parent_id = $3 WHERE id = $4 RETURNING *',
            [name, slug, parent_id || null, id]
        );
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getCategories,
    createCategory,
    deleteCategory,
    updateCategory
};
