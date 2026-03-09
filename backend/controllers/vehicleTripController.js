const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getVehicleTrips = async (req, res) => {
    try {
        const trips = await prisma.vehicleTrip.findMany({
            include: { vehicle: true },
            orderBy: { date: 'desc' },
        });
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createVehicleTrip = async (req, res) => {
    try {
        const { vehicleId, date, destination, distance, amountPaid, remarks } = req.body;
        const trip = await prisma.vehicleTrip.create({
            data: {
                vehicleId: parseInt(vehicleId),
                date: date ? new Date(date) : new Date(),
                destination,
                distance: distance ? parseFloat(distance) : null,
                amountPaid: parseFloat(amountPaid) || 0,
                remarks
            },
            include: { vehicle: true }
        });
        res.status(201).json(trip);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteVehicleTrip = async (req, res) => {
    try {
        await prisma.vehicleTrip.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Trip deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVehicleTrips, createVehicleTrip, deleteVehicleTrip };
