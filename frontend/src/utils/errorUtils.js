export const getFirebaseErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred.';
    const code = error.code || '';

    switch (code) {
        case 'auth/email-already-in-use':
            return 'This email is already registered. Please login instead.';
        case 'auth/invalid-email':
            return 'Please enter a valid email address.';
        case 'auth/user-not-found':
            return 'No account found with this email.';
        case 'auth/wrong-password':
            return 'Incorrect password. Please try again.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/too-many-requests':
            return 'Too many attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        case 'auth/requires-recent-login':
            return 'Please log out and log in again to perform this action.';
        case 'auth/credential-already-in-use':
            return 'This account is already linked to another user.';
        default:
            return error.message || 'Authentication failed. Please try again.';
    }
};

export const getApiErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred.';

    // Check for response from backend (axios)
    if (error.response && error.response.data) {
        // Backend returns { status, message, stack? }
        return error.response.data.message || 'Server Error';
    }

    // Network errors
    if (error.message === 'Network Error') {
        return 'Cannot connect to server. Please check your internet connection.';
    }

    return error.message || 'Something went wrong.';
};
