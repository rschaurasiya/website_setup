const express = require('express');
const router = express.Router();
const { getLegalPage, updateLegalPage } = require('../controllers/legalController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.get('/:type', getLegalPage);
router.put('/:type', protect, admin, updateLegalPage);

module.exports = router;
