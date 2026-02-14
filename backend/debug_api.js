const axios = require('axios');
const FormData = require('form-data');

async function debugTeamAdd() {
    try {
        const form = new FormData();
        form.append('name', 'Debug User');
        form.append('role', 'Tester');
        form.append('bio', 'Testing bio');
        form.append('social_email', 'test@test.com');
        form.append('social_links', JSON.stringify([{ platform: 'LinkedIn', url: 'https://linkedin.com' }]));

        // We are NOT sending image first to see if that works (nullable check)
        // If that works, then we try with image

        console.log('Attempting to add team member...');
        // Note: This endpoint is protected (admin). If we don't have a token, it will fail with 401.
        // Assuming we need to just hit it and see if we get a 500 or 401.
        // If 401, we confirm the server is running. If 500, we see the error.

        const response = await axios.post('http://localhost:5000/api/team', form, {
            headers: {
                ...form.getHeaders()
            },
            validateStatus: () => true // Resolve promise for all status codes
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

    } catch (error) {
        console.error('Request Failed:', error.message);
    }
}

debugTeamAdd();
