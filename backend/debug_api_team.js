const axios = require('axios');

async function checkApi() {
    try {
        console.log('Fetching /api/team...');
        const res = await axios.get('http://localhost:5000/api/team');
        console.log('Status:', res.status);
        console.log('Count:', res.data.length);
        res.data.forEach(m => {
            console.log(`[${m.id}] ${m.name} | Image: ${m.image} | Bio: ${m.bio?.substring(0, 20)}...`);
        });
    } catch (e) {
        console.error('API Error:', e.message);
    }
}

checkApi();
