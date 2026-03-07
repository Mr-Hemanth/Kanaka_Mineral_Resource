const express = require('express');
const {
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    updateStock,
    deleteInventoryItem,
    getLowStockItems,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Get low stock items (must be before /:id route)
router.get('/low-stock', protect, getLowStockItems);

// Main inventory routes with role-based permissions
router.route('/')
    .get(protect, getInventoryItems)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createInventoryItem);  // Only Admin & Supervisor can add

router.route('/:id')
    .get(protect, getInventoryItemById)  // All authenticated users can view
    .put(protect, authorize('ADMIN'), updateInventoryItem)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), deleteInventoryItem);  // Only Admin can delete

// Stock update route
router.post('/:id/stock', protect, authorize('ADMIN', 'SUPERVISOR'), updateStock);  // Only Admin & Supervisor can update stock

module.exports = router;
