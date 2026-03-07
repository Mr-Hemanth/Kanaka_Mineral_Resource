const express = require('express');
const { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getVehicles)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createVehicle);  // Only Admin & Supervisor can add

router.route('/:id')
    .get(protect, getVehicleById)  // All authenticated users can view
    .put(protect, authorize('ADMIN'), updateVehicle)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), deleteVehicle);  // Only Admin can delete

module.exports = router;
