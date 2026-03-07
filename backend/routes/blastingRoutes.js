const express = require('express');
const {
    getBlastRecords,
    getBlastRecordById,
    createBlastRecord,
    updateBlastRecord,
    deleteBlastRecord,
} = require('../controllers/blastingController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Blasting routes with role-based permissions
router.route('/')
    .get(protect, getBlastRecords)  // All authenticated users can view
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), createBlastRecord);  // Only Admin & Supervisor can add

router.route('/:id')
    .get(protect, getBlastRecordById)  // All authenticated users can view
    .put(protect, authorize('ADMIN'), updateBlastRecord)  // Only Admin can edit
    .delete(protect, authorize('ADMIN'), deleteBlastRecord);  // Only Admin can delete

module.exports = router;
