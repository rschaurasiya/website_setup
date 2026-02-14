const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testUpdate() {
    const form = new FormData();
    form.append('name', 'Test User');
    form.append('social_links', JSON.stringify([{ platform: 'LinkedIn', url: 'https://linkedin.com' }]));
    form.append('education', JSON.stringify([]));
    form.append('admissions', JSON.stringify([]));
    form.append('speaking_engagements', JSON.stringify([]));
    form.append('publications', JSON.stringify([]));

    try {
        // Need to simulate admin login or token? The route is protected: router.put('/', protect, admin, ...)
        // We need a token.
        // Let's first log in as admin.

        const loginRes = await axios.post('http://localhost:5000/api/users/login', {
            email: 'rradheshyamkr2000@gmail.com',
            password: 'radhe123'
        });
        const token = loginRes.data.token;
        console.log('Got token:', token);

        const res = await axios.put('http://localhost:5000/api/about', form, {
            headers: {
                ...form.getHeaders(),
                Authorization: `Bearer ${token}`
            }
        });
        console.log('Update Success:', res.data);
    } catch (error) {
        console.error('Update Failed:', error.response ? error.response.data : error.message);
    }
}

testUpdate();
