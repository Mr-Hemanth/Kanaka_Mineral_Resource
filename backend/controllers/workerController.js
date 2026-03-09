const prisma = require('../utils/prismaClient');

const getWorkers = async (req, res) => {
    try {
        const workers = await prisma.worker.findMany({
            include: { WorkerLogs: true }
        });
        res.json(workers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createWorker = async (req, res) => {
    try {
        const { name, role, contact, status } = req.body;
        const worker = await prisma.worker.create({
            data: { name, role, contact, status: status || 'ACTIVE' }
        });
        res.status(201).json(worker);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteWorker = async (req, res) => {
    try {
        await prisma.worker.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Worker deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWorkers, createWorker, deleteWorker };
