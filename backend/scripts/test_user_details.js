const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'rradheshyamkr2000@gmail.com';
const PASSWORD = 'radhe123';

const runTest = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: EMAIL,
            password: PASSWORD
        });
        const token = loginRes.data.token;
        const userId = loginRes.data.id;
        console.log(`✅ Login successful. Token received. User ID: ${userId}`);

        console.log(`2. Fetching details for user ${userId}...`);
        const detailsRes = await axios.get(`${API_URL}/users/${userId}/details`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Details response:', detailsRes.data);

        if (detailsRes.data.id === userId && detailsRes.data.blogCount !== undefined) {
            console.log('✅ Structure verified.');
        } else {
            console.error('❌ Structure mismatch.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.response ? error.response.data : error.message);
    }
};

runTest();
