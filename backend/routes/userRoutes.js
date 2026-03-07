const express = require('express');
const {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    getUserStats,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// All user management routes require ADMIN role
router.use(protect);

router.route('/')
    .get(protect, authorize('ADMIN'), getUsers)
    .post(protect, authorize('ADMIN'), createUser);

router.get('/stats', protect, authorize('ADMIN'), getUserStats);

router.route('/:id')
    .get(protect, authorize('ADMIN'), getUserById)
    .put(protect, authorize('ADMIN'), updateUser)
    .delete(protect, authorize('ADMIN'), deleteUser);

router.post('/:id/change-password', protect, authorize('ADMIN'), changeUserPassword);

module.exports = router;
