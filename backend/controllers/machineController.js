const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getMachines = async (req, res) => {
    try {
        const machines = await prisma.machine.findMany({
            include: { MachineLogs: true, Maintenances: true }
        });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMachine = async (req, res) => {
    try {
        const { name, type, model, capacity, status } = req.body;
        const machine = await prisma.machine.create({
            data: { name, type, model, capacity, status: status || 'OPERATIONAL' }
        });
        res.status(201).json(machine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteMachine = async (req, res) => {
    try {
        await prisma.machine.delete({ where: { id: parseInt(req.params.id) } });
        res.json({ message: 'Machine deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getMachines, createMachine, deleteMachine };
