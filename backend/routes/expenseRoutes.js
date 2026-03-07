const express = require('express');
const { getExpenses, createExpense, deleteExpense } = require('../controllers/expenseController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getExpenses)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createExpense);  // Only Admin & Supervisor can add

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteExpense);  // Only Admin can delete

module.exports = router;
