const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMaintenances = async (req, res) => {
    try {
        const records = await prisma.maintenance.findMany({
            include: { vehicle: true },
            orderBy: { date: 'desc' },
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMaintenance = async (req, res) => {
    try {
        const { vehicleId, partReplaced, cost, date, nextMaintenanceDue } = req.body;

        const record = await prisma.maintenance.create({
            data: {
                vehicleId: parseInt(vehicleId),
                partReplaced,
                cost: parseFloat(cost),
                date: date ? new Date(date) : new Date(),
                nextMaintenanceDue: nextMaintenanceDue ? new Date(nextMaintenanceDue) : null,
            },
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMaintenance = async (req, res) => {
    try {
        await prisma.maintenance.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Maintenance record removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMaintenances, createMaintenance, deleteMaintenance };
