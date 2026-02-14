const express = require('express');
const router = express.Router();
const { submitContact, getMessages, deleteMessage } = require('../controllers/contactController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.post('/', submitContact);
router.get('/', protect, admin, getMessages);
router.delete('/:id', protect, admin, deleteMessage);

module.exports = router;
