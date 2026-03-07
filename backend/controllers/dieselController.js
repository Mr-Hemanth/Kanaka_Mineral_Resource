const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDieselLogs = async (req, res) => {
    try {
        const logs = await prisma.dieselLog.findMany({
            include: { vehicle: true, supervisor: true },
            orderBy: { date: 'desc' },
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDieselLog = async (req, res) => {
    try {
        const { vehicleId, date, type, dieselFilled, pricePerLitre, supplier, location, remarks } = req.body;
        const totalCost = parseFloat(dieselFilled) * parseFloat(pricePerLitre);

        const log = await prisma.dieselLog.create({
            data: {
                date: date ? new Date(date) : new Date(),
                vehicleId: vehicleId ? parseInt(vehicleId) : null,
                type: type || 'FILLED',
                dieselFilled: parseFloat(dieselFilled),
                pricePerLitre: parseFloat(pricePerLitre),
                totalCost,
                supplier,
                location,
                remarks,
                supervisorId: req.user.id,
            },
            include: { vehicle: true },
        });

        res.status(201).json(log);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteDieselLog = async (req, res) => {
    try {
        // Only Admin can delete history
        await prisma.dieselLog.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Diesel log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDieselLogs, createDieselLog, deleteDieselLog };
