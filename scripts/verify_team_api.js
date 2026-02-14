const http = require('http');

const testEndpoints = async () => {
    console.log('Starting API Verification...');

    const endpoints = [
        { path: '/api/team', method: 'GET', name: 'Get All Team Members' },
        { path: '/api/users/values/authors', method: 'GET', name: 'Get Authors' }
    ];

    for (const endpoint of endpoints) {
        console.log(`Testing ${endpoint.name} (${endpoint.path})...`);
        try {
            await new Promise((resolve, reject) => {
                const req = http.request({
                    hostname: 'localhost',
                    port: 5000,
                    path: endpoint.path,
                    method: endpoint.method,
                }, (res) => {
                    let data = '';
                    res.on('data', (chunk) => data += chunk);
                    res.on('end', () => {
                        console.log(`Status: ${res.statusCode}`);
                        if (res.statusCode === 200) {
                            try {
                                const parsed = JSON.parse(data);
                                console.log('Response is valid JSON.');
                                console.log(`Item count: ${parsed.length}`);
                                resolve();
                            } catch (e) {
                                console.error('Response is NOT valid JSON.');
                                reject(e);
                            }
                        } else {
                            console.error(`Request failed with status ${res.statusCode}`);
                            reject(new Error(`Status ${res.statusCode}`));
                        }
                    });
                });

                req.on('error', (e) => {
                    console.error(`Problem with request: ${e.message}`);
                    reject(e);
                });

                req.end();
            });
            console.log(`${endpoint.name} PASSED ✅\n`);
        } catch (error) {
            console.error(`${endpoint.name} FAILED ❌\n`);
        }
    }
};

testEndpoints();
