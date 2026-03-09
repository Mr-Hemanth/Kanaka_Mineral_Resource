const prisma = require('../utils/prismaClient');

const getMachineLogs = async (req, res) => {
    try {
        const logs = await prisma.machineLog.findMany({
            include: { machine: true, operator: true },
            orderBy: { date: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMachineLog = async (req, res) => {
    try {
        const { machineId, date, hoursWorked, readingStart, readingEnd, operatorId, notes } = req.body;
        const log = await prisma.machineLog.create({
            data: {
                machineId: parseInt(machineId),
                date: date ? new Date(date) : new Date(),
                hoursWorked: parseFloat(hoursWorked) || 0,
                readingStart: readingStart ? parseFloat(readingStart) : null,
                readingEnd: readingEnd ? parseFloat(readingEnd) : null,
                operatorId: operatorId ? parseInt(operatorId) : null,
                notes,
            },
            include: { machine: true, operator: true }
        });
        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMachineLog = async (req, res) => {
    try {
        await prisma.machineLog.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Machine log deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMachineLogs, createMachineLog, deleteMachineLog };
