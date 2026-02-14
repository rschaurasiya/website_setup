const express = require('express');
const router = express.Router();
const creatorRequestController = require('../controllers/creatorRequestController');
// content: const authMiddleware = require('../middlewares/authMiddleware'); // Assuming this exists for admin check

// I need to import authMiddleware to protect admin routes
// Let's assume there is an authMiddleware.js or similar. 
// Looking at file list, there is a middlewares folder.
// I will just require it and if it fails I will fix it.
// Checking list_dir output: middlewares folder exists.
const authMiddleware = require('../middlewares/authMiddleware');

// Validations could be added here

// Public Routes
router.post('/', creatorRequestController.submitRequest);

// Admin Routes
router.get('/', authMiddleware.protect, authMiddleware.admin, creatorRequestController.getAllRequests);
router.post('/:id/approve', authMiddleware.protect, authMiddleware.admin, creatorRequestController.approveRequest);
router.post('/:id/reject', authMiddleware.protect, authMiddleware.admin, creatorRequestController.rejectRequest);

module.exports = router;
