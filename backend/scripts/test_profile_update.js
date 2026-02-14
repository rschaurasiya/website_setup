const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
const EMAIL = 'rradheshyamkr2000@gmail.com';
const PASSWORD = 'radhe123';

const runVerification = async () => {
    try {
        console.log('1. Logging in...');
        const loginRes = await axios.post(`${API_URL}/users/login`, {
            email: EMAIL,
            password: PASSWORD
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful. Token received.');

        console.log('2. Updating Profile with new fields...');
        const updateData = {
            position: 'Chief Editor',
            college: 'Test University',
            phone: '1234567890',
            bio: 'Updated bio from script'
        };

        const updateRes = await axios.put(`${API_URL}/users/profile`, updateData, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Update request sent.');
        console.log('Position:', updateRes.data.position);
        console.log('College:', updateRes.data.college);
        console.log('Phone:', updateRes.data.phone);

        if (updateRes.data.position === 'Chief Editor' &&
            updateRes.data.college === 'Test University' &&
            updateRes.data.phone === '1234567890') {
            console.log('✅ Profile fields updated correctly in response.');
        } else {
            console.error('❌ Profile fields mismatch in response.');
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.response ? error.response.data : error.message);
    }
};

runVerification();
