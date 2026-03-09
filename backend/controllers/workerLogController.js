const prisma = require('../utils/prismaClient');

const getWorkerLogs = async (req, res) => {
    try {
        const logs = await prisma.workerLog.findMany({
            include: { worker: true },
            orderBy: { date: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createWorkerLog = async (req, res) => {
    try {
        const { workerId, date, inTime, outTime, workType, advancePayment, balancePayment, totalPayment } = req.body;
        const log = await prisma.workerLog.create({
            data: {
                workerId: parseInt(workerId),
                date: date ? new Date(date) : new Date(),
                inTime,
                outTime,
                workType,
                advancePayment: parseFloat(advancePayment) || 0,
                balancePayment: parseFloat(balancePayment) || 0,
                totalPayment: parseFloat(totalPayment) || 0,
            },
            include: { worker: true }
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteWorkerLog = async (req, res) => {
    try {
        await prisma.workerLog.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Worker log deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getWorkerLogs, createWorkerLog, deleteWorkerLog };
