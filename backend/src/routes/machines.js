const express = require('express');
const router = express.Router();
const { getMachines, createMachine, deleteMachine } = require('../../controllers/machineController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getMachines).post(protect, createMachine);
router.route('/:id').delete(protect, deleteMachine);

module.exports = router;
