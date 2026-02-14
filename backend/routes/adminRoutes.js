const express = require('express');
const router = express.Router();
const { getAuthorRequests, approveAuthorRequest, rejectAuthorRequest, getDashboardStats } = require('../controllers/adminController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/stats', protect, admin, getDashboardStats);
router.get('/author-requests', protect, admin, getAuthorRequests);
router.put('/author-requests/:id/approve', protect, admin, approveAuthorRequest);
router.put('/author-requests/:id/reject', protect, admin, rejectAuthorRequest);

module.exports = router;
