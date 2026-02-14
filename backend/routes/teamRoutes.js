const express = require('express');
const router = express.Router();
const { getTeamMembers, addTeamMember, updateTeamMember, deleteTeamMember } = require('../controllers/teamController');
const { protect, admin } = require('../middlewares/authMiddleware'); // Assuming these middlewares exist
const multer = require('multer');
const path = require('path');

const { upload, optimizeImage } = require('../middlewares/uploadMiddleware');

router.route('/')
    .get(getTeamMembers)
    .post(protect, admin, upload.single('image'), optimizeImage, addTeamMember);

router.route('/:id')
    .put(protect, admin, upload.single('image'), optimizeImage, updateTeamMember)
    .delete(protect, admin, deleteTeamMember);

module.exports = router;
