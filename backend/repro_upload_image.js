const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Create a dummy image file for testing
const dummyImagePath = path.join(__dirname, 'test_image.jpg');
// Simple 1x1 pixel JPEG hex string
const dummyImageBuffer = Buffer.from('ffd8ffe000104a46494600010101006000600000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffdb0043010909090c0b0c180d0d1832211c213232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232323232ffc00011080001000103012200021101031101ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc400b5100002010303020403050504040000017d01020300041105122131410613516107227114328191a1082342b1c11552d1f02433627282090a161718191a25262728292a3435363738393a434445464748494a535455565758595a636465666768696a737475767778797a838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aaf0f1f2f3f4f5f6f7f8f9faffc4001f0100030101010101010101010000000000000102030405060708090a0bffc400b51100020102040403040705040400010277000102031104052131061241510761711322328108144291a1b1c109233352f0156272d10a162434e125f11718191a262728292a35363738393a434445464748494a535455565758595a636465666768696a737475767778797a82838485868788898a92939495969798999aa2a3a4a5a6a7a8a9aaf0f1f2f3f4f5f6f7f8f9faffda000c03010002110311003f00bf0001ffd9', 'hex');
fs.writeFileSync(dummyImagePath, dummyImageBuffer);

async function reproUpload() {
    try {
        const form = new FormData();
        form.append('name', 'Repro User');
        form.append('role', 'Debugger');
        form.append('bio', 'Debugging upload');
        form.append('social_email', 'debug@test.com');
        form.append('social_links', JSON.stringify([{ platform: 'LinkedIn', url: 'https://linkedin.com' }]));
        form.append('image', fs.createReadStream(dummyImagePath));

        console.log('Attempting to upload image...');

        // NOTE: We need a valid JWT token if the route is protected.
        // Assuming 'protect' middleware checks Authorization header.
        // For repro, we might need to login first or temporarily disable protect in route (risky but fast).
        // Let's try to login first if possible, OR assume the user has a token we can use? 
        // Actually, let's look at authMiddleware. It checks DB.
        // I will first login as admin to get token.

        // LOGIN Step
        console.log('Logging in as admin...');
        // Assuming there is an admin user. If not, this might fail.
        // Using a hardcoded admin login if known, otherwise we might skip Auth by modifying code temporarily?
        // Wait, I don't know the admin credentials.
        // I'll check 'seed_users' or similar if available, or just check the DB content I printed earlier? No passwords there.
        // The user said "when i edit this...". They ARE logged in.

        // PLAN B: I will use the 'protect' middleware bypass for localhost, OR
        // I will temporarily comment out 'protect, admin' in teamRoutes.js to verify the UPLOAD part.
        // This isolates Auth issues from Upload issues.

        const response = await axios.post('http://localhost:5000/api/team', form, {
            headers: {
                ...form.getHeaders()
                // Authorization: `Bearer ${token}` // Commented out, expecting open route or failure
            },
            validateStatus: () => true
        });

        console.log('Response Status:', response.status);
        console.log('Response Data:', response.data);

    } catch (error) {
        console.error('Repro Failed:', error.message);
    }
}

reproUpload();
