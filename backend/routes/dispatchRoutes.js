const express = require('express');
const { getDispatches, createDispatch, updateDispatch, deleteDispatch } = require('../controllers/dispatchController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getDispatches)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createDispatch);  // Only Admin & Supervisor can add

router.route('/:id')
    .put(protect, authorize('ADMIN'), updateDispatch)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), deleteDispatch);  // Only Admin can delete

module.exports = router;
