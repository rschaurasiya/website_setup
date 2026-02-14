const axios = require('axios');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const API_URL = 'http://localhost:5000/api/users/firebase-signup';

const testLogin = async () => {
    try {
        const payload = {
            name: 'Test Admin',
            email: 'admin@lawblog.com', // Use the email from user's screenshot
            firebaseUid: 'test_uid_' + Date.now(),
            profile_photo: 'http://example.com/photo.jpg'
        };

        console.log('Sending payload:', payload);

        const res = await axios.post(API_URL, payload);
        console.log('Response status:', res.status);
        console.log('Response data:', res.data);
    } catch (error) {
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error data:', error.response.data);
        } else {
            console.error('Error:', error);
        }
    }
};

testLogin();
