const express = require('express');
const router = express.Router();
const { registerUser, loginUser, firebaseSignup, getMe, submitApplication, getApplicationStatus, reviewApplication, getApplications, getAllUsers, getAuthors, updateUserStatus, deleteUser, updateProfile, forgotPassword, verifyOtp, resetPassword, getUserDetails, getPublicUserProfile } = require('../controllers/userController');
const { protect, admin } = require('../middlewares/authMiddleware');


// Upload middleware
const { upload, optimizeImage } = require('../middlewares/uploadMiddleware');

router.post('/', registerUser);
router.post('/firebase-signup', firebaseSignup);
router.post('/login', loginUser);
router.post('/forgot-password', forgotPassword);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
// Application Routes
router.post('/application', protect, submitApplication);
router.get('/application/status', protect, getApplicationStatus);

// Admin Application Management
router.get('/admin/applications', protect, admin, getApplications);
router.put('/application/:id/review', protect, admin, reviewApplication);

// OLD Routes (Redirected/Deprecated)
// router.post('/request-author', protect, requestAuthorAccess); 
// router.get('/request-status', protect, getAuthorRequestStatus);
router.put('/profile', protect, upload.single('profile_photo'), optimizeImage, updateProfile);
router.get('/values/authors', getAuthors);

// Admin Routes
router.get('/', protect, admin, getAllUsers);
router.get('/:id/details', protect, admin, getUserDetails);
router.put('/:id/status', protect, admin, updateUserStatus);
router.get('/:id/profile', getPublicUserProfile); // Public profile route
router.delete('/:id', protect, admin, deleteUser);

module.exports = router;
