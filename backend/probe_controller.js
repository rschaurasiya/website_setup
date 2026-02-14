const userController = require('./controllers/userController');
const db = require('./db');

// Mock Req/Res
const req = {
    body: {
        email: 'rradheshyamkr2000@gmail.com',
        password: 'test' // Wrong password, but should trigger controller logic
    }
};

const res = {
    json: (data) => console.log('Response JSON:', data),
    status: (code) => {
        console.log('Response Status:', code);
        return { json: (data) => console.log('Response JSON:', data) };
    }
};

async function testController() {
    console.log('--- Testing Controller Import ---');
    console.log('Controller loaded successfully.');

    try {
        if (userController.loginUser) {
            console.log('Calling loginUser...');
            await userController.loginUser(req, res);
        } else {
            console.error('loginUser function not found in controller exports.');
        }
    } catch (err) {
        console.error('Controller Execution Failed:', err);
    } finally {
        process.exit();
    }
}

testController();
