const express = require('express');
const { getDieselLogs, createDieselLog, deleteDieselLog } = require('../controllers/dieselController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getDieselLogs)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createDieselLog);  // Only Admin & Supervisor can add

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteDieselLog);  // Only Admin can delete

module.exports = router;
