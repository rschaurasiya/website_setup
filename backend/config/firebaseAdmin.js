const admin = require('firebase-admin');
const path = require('path');

// Try to load service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

let initialized = false;

try {
    let serviceAccount;
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            console.log("Loading Firebase Admin SDK from environment variable.");
        } catch (e) {
            console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", e);
        }
    } else if (require('fs').existsSync(serviceAccountPath)) {
        serviceAccount = require(serviceAccountPath);
        console.log("Loading Firebase Admin SDK from local file.");
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        initialized = true;
        console.log("Firebase Admin initialized successfully.");
    } else {
        console.warn("WARNING: Firebase Admin Service Account Key not found (Env Var or File).");
        console.warn("User deletion from Firebase Auth will NOT work until this is configured.");
    }
} catch (error) {
    console.error("Error initializing Firebase Admin:", error);
}

module.exports = {
    admin,
    initialized
};
