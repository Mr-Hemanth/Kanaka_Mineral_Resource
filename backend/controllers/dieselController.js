const prisma = require('../utils/prismaClient');

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
        const { vehicleId, date, type, dieselFilled, pricePerLitre, totalCost, supplier, location, remarks } = req.body;

        let calculatedTotalCost = 0;
        let calculatedPricePerLitre = 0;

        if (type === 'BOUGHT') {
            calculatedTotalCost = parseFloat(totalCost) || 0;
            calculatedPricePerLitre = calculatedTotalCost / parseFloat(dieselFilled) || 0;
        } else {
            // For FILLED, price and total cost are not strictly tracked at entry per user request
            calculatedPricePerLitre = 0;
            calculatedTotalCost = 0;
        }

        const log = await prisma.dieselLog.create({
            data: {
                date: date ? new Date(date) : new Date(),
                vehicleId: vehicleId ? parseInt(vehicleId) : null,
                type: type || 'FILLED',
                dieselFilled: parseFloat(dieselFilled),
                pricePerLitre: calculatedPricePerLitre,
                totalCost: calculatedTotalCost,
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
