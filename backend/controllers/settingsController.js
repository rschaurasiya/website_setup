const db = require('../db');
const fs = require('fs');
const path = require('path');

// @desc    Get Homepage Settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM homepage_settings ORDER BY id DESC LIMIT 1');
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ message: 'Server error fetching settings' });
    }
};

// @desc    Update Homepage Settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
    try {
        console.log("updateSettings called");
        console.log("req.body:", req.body);
        console.log("req.file:", req.file);

        const { headline, subheadline, cta_text, background_type, overlay_opacity } = req.body;
        let background_url = undefined;

        if (req.file) {
            background_url = `/uploads/${req.file.filename}`;
        }

        // Check if settings exist
        const check = await db.query('SELECT id FROM homepage_settings LIMIT 1');

        if (check.rows.length === 0) {
            // Insert
            await db.query(
                `INSERT INTO homepage_settings (headline, subheadline, cta_text, background_type, background_url, overlay_opacity)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [headline, subheadline, cta_text, background_type, background_url || '', overlay_opacity || 0.5]
            );
        } else {
            // Update
            const id = check.rows[0].id;
            let query = `UPDATE homepage_settings SET headline = $1, subheadline = $2, cta_text = $3, overlay_opacity = $4, updated_at = NOW()`;
            const params = [headline, subheadline, cta_text, overlay_opacity || 0.5];

            let paramIndex = 5;

            // Only update background info if a new file is uploaded OR types changed explicitly
            // If background_url is present (new file), update it.
            if (background_url) {
                query += `, background_url = $${paramIndex++}, background_type = $${paramIndex++}`;
                params.push(background_url);
                params.push(background_type); // ensure type matches file
            } else if (background_type) {
                // Even if no new file, possibly changing type (e.g. if user pastes a URL in future, but here we prioritize file based)
                // For now, if no file, we assume we keep existing unless explicitly cleared? 
                // Simple logic: if file uploaded, update type & url.
                query += `, background_type = $${paramIndex++}`;
                params.push(background_type);
            }

            query += ` WHERE id = $${paramIndex}`;
            params.push(id);

            await db.query(query, params);
        }

        const updated = await db.query('SELECT * FROM homepage_settings LIMIT 1');
        res.status(200).json(updated.rows[0]);

    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ message: 'Server error updating settings', error: error.message });
    }
};

module.exports = {
    getSettings,
    updateSettings
};
