const express = require('express');
const router = express.Router();
const { getWorkers, createWorker, deleteWorker } = require('../controllers/workerController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getWorkers).post(protect, createWorker);
router.route('/:id').delete(protect, deleteWorker);

module.exports = router;
