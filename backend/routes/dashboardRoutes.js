const express = require('express');
const { getDashboardSummary, getDashboardCharts } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/summary', protect, getDashboardSummary);
router.get('/charts', protect, getDashboardCharts);

module.exports = router;
