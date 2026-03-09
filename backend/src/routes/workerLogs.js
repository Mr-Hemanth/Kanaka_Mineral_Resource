const express = require('express');
const router = express.Router();
const { getWorkerLogs, createWorkerLog, deleteWorkerLog } = require('../../controllers/workerLogController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWorkerLogs).post(protect, createWorkerLog);
router.route('/:id').delete(protect, deleteWorkerLog);

module.exports = router;
