const { admin, initialized } = require('../config/firebaseAdmin');

if (!initialized) {
    console.error("❌ Firebase Admin not initialized. Check serviceAccountKey.json.");
    process.exit(1);
}

const syncAdmin = async () => {
    const email = 'chaurasiyachand26@gmail.com';
    const password = 'radhe123';
    const displayName = 'Super Admin';

    try {
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log(`ℹ️ User ${email} already exists.`);

            // Update user
            userRecord = await admin.auth().updateUser(userRecord.uid, {
                password: password,
                emailVerified: true,
                displayName: displayName
            });
            console.log(`✅ Successfully updated user: ${userRecord.uid}`);
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`ℹ️ User ${email} not found. Creating...`);
                userRecord = await admin.auth().createUser({
                    email: email,
                    password: password,
                    emailVerified: true,
                    displayName: displayName
                });
                console.log(`✅ Successfully created user: ${userRecord.uid}`);
            } else {
                throw error;
            }
        }
    } catch (error) {
        console.error('❌ Error syncing admin user:', error);
        process.exit(1);
    }
};

syncAdmin();
