const express = require('express');
const router = express.Router();
const { getVehicleTrips, createVehicleTrip, deleteVehicleTrip } = require('../../controllers/vehicleTripController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getVehicleTrips).post(protect, createVehicleTrip);
router.route('/:id').delete(protect, deleteVehicleTrip);

module.exports = router;
