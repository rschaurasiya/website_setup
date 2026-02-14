import api from './api';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';

const authService = {
    // Legacy Login - Deprecated
    // login: async (email, password) => {
    //     const response = await api.post('/users/login', { email, password });
    //     if (response.data.token) {
    //         localStorage.setItem('user', JSON.stringify(response.data));
    //     }
    //     return response.data;
    // },

    register: async (userData) => {
        const response = await api.post('/users', userData);
        if (response.data.token) {
            localStorage.setItem('user', JSON.stringify(response.data));
        }
        return response.data;
    },

    logout: async () => {
        await auth.signOut();
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    },

    getCurrentUser: () => {
        return JSON.parse(localStorage.getItem('user'));
    },

    forgotPassword: async (email) => {
        // Firebase handles the email sending
        await sendPasswordResetEmail(auth, email);
        return { message: 'Password reset email sent.' };
    },

    // Legacy - Removed/Deprecated
    // verifyOtp: async (email, otp) => { ... },
    // resetPassword: async (email, otp, newPassword) => { ... },

    firebaseSignup: async (userData) => {
        const response = await api.post('/users/firebase-signup', userData);
        return response.data;
    }
};

export default authService;
