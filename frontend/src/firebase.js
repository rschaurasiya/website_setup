// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAllPoS-zKXkpYbGhh1rTiNL9OXuKcP_Aw",
    authDomain: "chand-chaurasiya.firebaseapp.com",
    projectId: "chand-chaurasiya",
    storageBucket: "chand-chaurasiya.firebasestorage.app",
    messagingSenderId: "737625817965",
    appId: "1:737625817965:web:f672e70627c07efbc41064",
    measurementId: "G-9PKNK569LM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };