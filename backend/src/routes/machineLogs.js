const express = require('express');
const router = express.Router();
const { getMachineLogs, createMachineLog, deleteMachineLog } = require('../../controllers/machineLogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMachineLogs).post(protect, createMachineLog);
router.route('/:id').delete(protect, deleteMachineLog);

module.exports = router;
