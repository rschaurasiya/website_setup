const http = require('http');

console.log('Testing GET /api/settings...');
const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/settings',
    method: 'GET',
};

const req = http.request(options, (res) => {
    console.log(`GET /api/settings Status: ${res.statusCode}`);
    res.on('data', (d) => {
        // console.log('GET Data:', d.toString());
    });
});

req.on('error', (error) => {
    console.error('GET Error:', error);
});

req.end();

console.log('Testing PUT /api/settings...');
const optionsPut = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/settings',
    method: 'PUT',
};

const reqPut = http.request(optionsPut, (res) => {
    console.log(`PUT /api/settings Status: ${res.statusCode}`);
});

reqPut.on('error', (error) => {
    console.error('PUT Error:', error);
});

reqPut.end();

console.log('Testing GET /api/debug-settings...');
const optionsDebug = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/debug-settings',
    method: 'GET',
};

const reqDebug = http.request(optionsDebug, (res) => {
    console.log(`GET /api/debug-settings Status: ${res.statusCode}`);
    res.on('data', (d) => {
        console.log('GET Debug Data:', d.toString());
    });
});

reqDebug.on('error', (error) => {
    console.error('Debug Error:', error);
});

reqDebug.end();
