const express = require('express');
const { getMaintenances, createMaintenance, deleteMaintenance } = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getMaintenances)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createMaintenance);  // Only Admin & Supervisor can add

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteMaintenance);  // Only Admin can delete

module.exports = router;
