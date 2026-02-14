const db = require('../db');

// @desc    Get all team members
// @route   GET /api/team
// @access  Public
const getTeamMembers = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM team_members ORDER BY ordering ASC, created_at ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add team member
// @route   POST /api/team
// @access  Private/Admin
// @desc    Add team member
// @route   POST /api/team
// @access  Private/Admin
const addTeamMember = async (req, res) => {


    console.log('Request Body:', req.body); // Log body
    console.log('Request File:', req.file); // Log file

    const { name, role, bio, social_email, ordering, social_links } = req.body;

    // Legacy fields handling if passed
    const linkedin = req.body.social_linkedin;
    const twitter = req.body.social_twitter;

    // Construct final social_links array
    let finalSocialLinks = [];
    try {
        if (social_links) {
            finalSocialLinks = typeof social_links === 'string' ? JSON.parse(social_links) : social_links;
        }
        // If legacy fields exist and not in new structure, add them (backward compatibility)
        if (linkedin && !finalSocialLinks.some(l => l.platform && l.platform.toLowerCase().includes('linkedin'))) {
            finalSocialLinks.push({ platform: 'LinkedIn', url: linkedin });
        }
        if (twitter && !finalSocialLinks.some(l => l.platform && l.platform.toLowerCase().includes('twitter'))) {
            finalSocialLinks.push({ platform: 'Twitter', url: twitter });
        }
    } catch (e) {
        console.error('Error parsing social_links:', e);
        finalSocialLinks = [];
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null;

    if (!name || !role) {
        return res.status(400).json({ message: 'Name and Role are required' });
    }

    try {
        const result = await db.query(
            'INSERT INTO team_members (name, role, bio, image, social_email, ordering, social_links) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
            [name, role, bio, image, social_email, ordering || 0, JSON.stringify(finalSocialLinks)]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Database Insertion Error:', error); // Detailed log
        res.status(500).json({ message: 'Server error saving team member', error: error.message });
    }
};

// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
// @desc    Update team member
// @route   PUT /api/team/:id
// @access  Private/Admin
const updateTeamMember = async (req, res) => {
    const { id } = req.params;
    const { name, role, bio, social_email, ordering, social_links } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;



    // Handle social_links parsing
    let finalSocialLinks = undefined;
    if (social_links !== undefined) {
        try {
            finalSocialLinks = JSON.stringify(typeof social_links === 'string' ? JSON.parse(social_links) : social_links);
        } catch (e) {
            finalSocialLinks = '[]';
        }
    }

    try {
        let query = 'UPDATE team_members SET ';
        const params = [id];
        let paramCount = 1;

        const addField = (field, value) => {
            if (value !== undefined) {
                paramCount++;
                query += `${field} = $${paramCount}, `;
                params.push(value);
            }
        };

        addField('name', name);
        addField('role', role);
        addField('bio', bio);
        addField('social_email', social_email);
        addField('ordering', ordering);
        addField('social_links', finalSocialLinks);
        if (image) addField('image', image);

        // Remove trailing comma
        if (query.endsWith(', ')) query = query.slice(0, -2);

        query += ' WHERE id = $1 RETURNING *';

        if (params.length === 1) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        const result = await db.query(query, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.status(200).json(result.rows[0]);

    } catch (error) {
        console.error('Update Error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete team member
// @route   DELETE /api/team/:id
// @access  Private/Admin
const deleteTeamMember = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Team member not found' });
        }
        res.status(200).json({ message: 'Team member deleted' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getTeamMembers,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember
};
