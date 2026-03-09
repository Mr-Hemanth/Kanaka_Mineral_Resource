const prisma = require('../utils/prismaClient');

const getVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.vehicle.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getVehicleById = async (req, res) => {
    try {
        const vehicle = await prisma.vehicle.findUnique({
            where: { id: parseInt(req.params.id) },
        });
        if (vehicle) {
            res.json(vehicle);
        } else {
            res.status(404).json({ message: 'Vehicle not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createVehicle = async (req, res) => {
    try {
        const { vehicleNumber, driverName, vehicleType, mileage, lastServiceDate, nextServiceDate, status } = req.body;
        const vehicle = await prisma.vehicle.create({
            data: {
                vehicleNumber,
                driverName,
                vehicleType,
                mileage: mileage ? parseFloat(mileage) : null,
                lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : null,
                nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : null,
                status: status || 'ACTIVE',
            },
        });
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateVehicle = async (req, res) => {
    try {
        const { vehicleNumber, driverName, vehicleType, mileage, lastServiceDate, nextServiceDate, status } = req.body;
        const vehicle = await prisma.vehicle.update({
            where: { id: parseInt(req.params.id) },
            data: {
                vehicleNumber,
                driverName,
                vehicleType,
                mileage: mileage ? parseFloat(mileage) : undefined,
                lastServiceDate: lastServiceDate ? new Date(lastServiceDate) : undefined,
                nextServiceDate: nextServiceDate ? new Date(nextServiceDate) : undefined,
                status,
            },
        });
        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteVehicle = async (req, res) => {
    try {
        await prisma.vehicle.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Vehicle removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle };
