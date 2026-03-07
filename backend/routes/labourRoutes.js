const express = require('express');
const { getLabours, createLabour, deleteLabour } = require('../controllers/labourController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getLabours)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createLabour);  // Only Admin & Supervisor can add

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteLabour);  // Only Admin can delete

module.exports = router;
