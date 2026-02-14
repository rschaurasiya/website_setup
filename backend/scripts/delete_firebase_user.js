const { admin, initialized } = require('../config/firebaseAdmin');

async function deleteUserByEmail(email) {
    if (!initialized) {
        console.error("Firebase Admin not initialized. Cannot delete user.");
        process.exit(1);
    }

    try {
        const userRecord = await admin.auth().getUserByEmail(email);
        console.log(`Successfully fetched user data: ${userRecord.uid}`);

        await admin.auth().deleteUser(userRecord.uid);
        console.log(`Successfully deleted user details: ${userRecord.uid}`);
    } catch (error) {
        if (error.code === 'auth/user-not-found') {
            console.log(`User ${email} not found in Firebase Auth.`);
        } else {
            console.error('Error deleting user:', error);
        }
    }
}

const emailToDelete = 'radhearcade2000@gmail.com';
console.log(`Attempting to delete user: ${emailToDelete}`);
deleteUserByEmail(emailToDelete);
