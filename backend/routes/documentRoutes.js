const express = require('express');
const multer = require('multer');
const path = require('path');
const { getDocuments, uploadDocument, deleteDocument } = require('../controllers/documentController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Multer storage configuration
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
        );
    },
});

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        // Only allow pdfs and images
        const filetypes = /jpeg|jpg|png|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Images and PDFs Only!');
        }
    },
});

router.route('/')
    .get(protect, getDocuments)
    .post(protect, authorize('ADMIN', 'SUPERVISOR'), upload.single('document'), uploadDocument);

router.route('/:id')
    .delete(protect, authorize('ADMIN'), deleteDocument);

module.exports = router;
