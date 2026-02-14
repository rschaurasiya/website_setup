const db = require('../db');

// @desc    Get about page data
// @route   GET /api/about
// @access  Public
const getAboutData = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM about_page ORDER BY id DESC LIMIT 1');
        res.status(200).json(result.rows[0] || {});
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Helper to safely parse JSON or return default
const parseJson = (input, defaultValue = []) => {
    if (typeof input === 'string') {
        try {
            return JSON.parse(input);
        } catch (e) {
            console.error('JSON Parse Error for:', input);
            return defaultValue;
        }
    }
    return input || defaultValue;
};

// @desc    Update about page data
// @route   PUT /api/about
// @access  Private/Admin
const updateAboutData = async (req, res) => {
    const {
        name, title, bio, email, phone,
        social_links, education, admissions,
        speaking_engagements, publications, sections
    } = req.body;

    let image = req.body.image;
    if (req.file) {
        image = `/uploads/${req.file.filename}`;
    }

    const parsedData = {
        social: JSON.stringify(parseJson(social_links)),
        edu: JSON.stringify(parseJson(education)),
        adm: JSON.stringify(parseJson(admissions)),
        speak: JSON.stringify(parseJson(speaking_engagements)),
        pub: JSON.stringify(parseJson(publications)),
        sections: JSON.stringify(parseJson(sections))
    };

    try {
        console.log('Update About Request Body:', req.body);

        // Check if record exists
        const check = await db.query('SELECT id FROM about_page LIMIT 1');

        if (check.rows.length === 0) {
            console.log('Inserting new About record...');
            // Insert
            const newAbout = await db.query(
                `INSERT INTO about_page 
                (name, title, image, bio, email, phone, social_links, education, admissions, speaking_engagements, publications, sections)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
                RETURNING *`,
                [
                    name, title, image, bio, email, phone,
                    parsedData.social, parsedData.edu, parsedData.adm, parsedData.speak, parsedData.pub, parsedData.sections
                ]
            );
            return res.status(201).json(newAbout.rows[0]);
        } else {
            console.log('Updating existing About record...');
            // Update
            const id = check.rows[0].id;

            let updateFields = [
                'name = $1', 'title = $2', 'bio = $3', 'email = $4', 'phone = $5',
                'social_links = $6', 'education = $7', 'admissions = $8',
                'speaking_engagements = $9', 'publications = $10', 'sections = $11'
            ];
            let updateParams = [
                name, title, bio, email, phone,
                parsedData.social, parsedData.edu, parsedData.adm, parsedData.speak, parsedData.pub, parsedData.sections
            ];

            if (image) {
                updateFields.push(`image = $${updateParams.length + 1}`);
                updateParams.push(image);
            }

            const finalQuery = `UPDATE about_page SET ${updateFields.join(', ')}, updated_at = NOW() WHERE id = $${updateParams.length + 1} RETURNING *`;
            updateParams.push(id);

            const updated = await db.query(finalQuery, updateParams);
            res.status(200).json(updated.rows[0]);
        }
    } catch (error) {
        console.error('About Controller Error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports = {
    getAboutData,
    updateAboutData
};
