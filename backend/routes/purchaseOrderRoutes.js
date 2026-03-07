const express = require('express');
const {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderStats,
} = require('../controllers/purchaseOrderController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { exportToExcel, exportToPDF, exportToWord } = require('../utils/exportUtils');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get Purchase Orders with search, filter, sort, pagination (All authenticated users can view)
router.get('/', getPurchaseOrders);

// Get Purchase Order statistics (All authenticated users can view)
router.get('/stats', getPurchaseOrderStats);

// Export endpoints
router.get('/export/excel', async (req, res) => {
    try {
        const purchaseOrders = await getPurchaseOrders(req, res);
        const columns = [
            { header: 'PO Number', key: 'poNumber', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 15 },
            { header: 'Supplier', key: 'supplierName', width: 25 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Delivery Date', key: 'deliveryDate', width: 15 },
        ];
        
        await exportToExcel(res, purchaseOrders.data, columns, 'purchase_orders');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/export/pdf', async (req, res) => {
    try {
        const purchaseOrders = await getPurchaseOrders(req, res);
        const columns = [
            { header: 'PO Number', key: 'poNumber', width: 100 },
            { header: 'Order Date', key: 'orderDate', width: 100 },
            { header: 'Supplier', key: 'supplierName', width: 150 },
            { header: 'Status', key: 'status', width: 80 },
            { header: 'Total Amount', key: 'totalAmount', width: 100 },
        ];
        
        await exportToPDF(res, purchaseOrders.data, columns, 'purchase_orders', 'Purchase Orders Report');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/export/word', async (req, res) => {
    try {
        const purchaseOrders = await getPurchaseOrders(req, res);
        const columns = [
            { header: 'PO Number', key: 'poNumber', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 20 },
            { header: 'Supplier', key: 'supplierName', width: 30 },
            { header: 'Status', key: 'status', width: 15 },
            { header: 'Total Amount', key: 'totalAmount', width: 20 },
        ];
        
        await exportToWord(res, purchaseOrders.data, columns, 'purchase_orders', 'Purchase Orders Report');
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get single Purchase Order by ID (All authenticated users can view)
router.get('/:id', getPurchaseOrderById);

// Create new Purchase Order (Only Admin & Supervisor can add)
router.post('/', authorize('ADMIN', 'SUPERVISOR'), createPurchaseOrder);

// Update Purchase Order (Only Admin can edit)
router.put('/:id', authorize('ADMIN'), updatePurchaseOrder);

// Delete Purchase Order (Only Admin can delete)
router.delete('/:id', authorize('ADMIN'), deletePurchaseOrder);

module.exports = router;
