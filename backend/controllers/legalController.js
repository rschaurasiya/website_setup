const pool = require('../db');

// @desc    Get legal page content
// @route   GET /api/legal/:type
// @access  Public
const getLegalPage = async (req, res) => {
    try {
        const { type } = req.params;
        const result = await pool.query('SELECT * FROM legal_pages WHERE page_type = $1', [type]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// @desc    Update legal page sections (Description only)
// @route   PUT /api/legal/:type
// @access  Private/Admin
const updateLegalPage = async (req, res) => {
    try {
        const { type } = req.params;
        const { sections } = req.body; // Expecting array of { title, content }

        // Fetch existing page to validate titles
        const existingPage = await pool.query('SELECT * FROM legal_pages WHERE page_type = $1', [type]);

        if (existingPage.rows.length === 0) {
            return res.status(404).json({ message: 'Page not found' });
        }

        const currentSections = existingPage.rows[0].sections;

        // Validation: Ensure no titles are changed or deleted
        // We iterate through current sections and update their content if provided
        const updatedSections = currentSections.map(originalSection => {
            const incomingSection = sections.find(s => s.title === originalSection.title);
            if (incomingSection) {
                return { ...originalSection, content: incomingSection.content };
            }
            return originalSection;
        });

        // Update DB
        const updateResult = await pool.query(
            'UPDATE legal_pages SET sections = $1, updated_at = CURRENT_TIMESTAMP WHERE page_type = $2 RETURNING *',
            [JSON.stringify(updatedSections), type]
        );

        res.json(updateResult.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

module.exports = {
    getLegalPage,
    updateLegalPage
};
