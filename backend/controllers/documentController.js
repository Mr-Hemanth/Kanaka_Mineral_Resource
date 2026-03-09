const prisma = require('../utils/prismaClient');

const getDocuments = async (req, res) => {
    try {
        const documents = await prisma.document.findMany({
            orderBy: { uploadedAt: 'desc' },
        });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const uploadDocument = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { type } = req.body;

        // In production, fileUrl would point to S3 or a cloud storage URL
        // Here we use the local path for the prototype
        const fileUrl = `/uploads/${req.file.filename}`;

        const document = await prisma.document.create({
            data: {
                fileName: req.file.originalname,
                fileUrl,
                type: type || 'OTHER',
            },
        });

        res.status(201).json(document);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteDocument = async (req, res) => {
    try {
        // Note: Would need fs.unlink to actually delete the file from disk
        await prisma.document.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Document record removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDocuments, uploadDocument, deleteDocument };
