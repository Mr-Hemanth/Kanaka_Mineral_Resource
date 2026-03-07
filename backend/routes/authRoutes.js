const express = require('express');
const { registerUser, authUser, getUserProfile } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', protect, authorize('ADMIN'), registerUser);
router.post('/login', authUser);
router.get('/profile', protect, getUserProfile);

module.exports = router;
