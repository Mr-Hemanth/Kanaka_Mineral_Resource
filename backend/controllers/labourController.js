const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getLabours = async (req, res) => {
    try {
        const labours = await prisma.labour.findMany({
            orderBy: { date: 'desc' },
        });
        res.json(labours);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createLabour = async (req, res) => {
    try {
        const { name, date, inTime, outTime, workType, payment } = req.body;

        const labour = await prisma.labour.create({
            data: {
                name,
                date: date ? new Date(date) : new Date(),
                inTime,
                outTime,
                workType,
                payment: parseFloat(payment),
            },
        });

        res.status(201).json(labour);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteLabour = async (req, res) => {
    try {
        await prisma.labour.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Labour record removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getLabours, createLabour, deleteLabour };
