const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testAddMember() {
    try {
        const form = new FormData();
        form.append('name', 'Test User');
        form.append('role', 'Developer');
        form.append('bio', 'Bio test');
        form.append('social_linkedin', 'https://linkedin.com');
        form.append('social_twitter', 'https://twitter.com');
        form.append('social_email', 'test@test.com');

        // Mock image file if needed, or leave empty to test null case
        // form.append('image', fs.createReadStream('someimage.jpg'));

        const response = await axios.post('http://localhost:5000/api/team', form, {
            headers: {
                ...form.getHeaders()
                // You might need an auth token here if protected?
                // The route says 'protect, admin'. So this script will fail 401 without token. 
                // I need to login first.
            }
        });
        console.log('Success:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

// Since I don't have a token easily, I'll rely on the DB schema check first.
// If DB schema shows Image is NOT NULL, that's the likely culprit if user skips it.
// If Image IS nullable, then something else. 
// I'll skip running this script for now and trust the schema check + manual analysis.
console.log("Script created but I will rely on DB schema check first.");
