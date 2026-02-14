const axios = require('axios');
const fs = require('fs');
const path = require('path');

// We know this file exists from previous 'list_dir'
const TEST_FILE = 'blog-1770375629170.jpg';
const URL = `http://localhost:5000/uploads/${TEST_FILE}`;

async function testFetch() {
    console.log(`Attempting to fetch: ${URL}`);
    try {
        const response = await axios.get(URL);
        console.log(`Status: ${response.status}`);
        console.log(`Content-Type: ${response.headers['content-type']}`);
        console.log('Image fetched successfully!');
    } catch (error) {
        console.error('Fetch Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Headers:', error.response.headers);
        }
    }
}

testFetch();
