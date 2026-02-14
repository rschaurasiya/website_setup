const admin = require('firebase-admin');
const path = require('path');

// Try to load service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let initialized = false;

try {
    if (require('fs').existsSync(serviceAccountPath)) {
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        initialized = true;
        console.log("Firebase Admin initialized successfully.");
    } else {
        console.warn("WARNING: Firebase Admin Service Account Key not found at:", serviceAccountPath);
        console.warn("User deletion from Firebase Auth will NOT work until this file is added.");
    }
} catch (error) {
    console.error("Error initializing Firebase Admin:", error);
}

module.exports = {
    admin,
    initialized
};
