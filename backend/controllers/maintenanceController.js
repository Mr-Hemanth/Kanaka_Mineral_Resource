const prisma = require('../utils/prismaClient');

const getMaintenances = async (req, res) => {
    try {
        const records = await prisma.maintenance.findMany({
            include: {
                vehicle: true,
                machine: true,
                inventoryItem: true
            },
            orderBy: { date: 'desc' },
        });
        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createMaintenance = async (req, res) => {
    try {
        const { vehicleId, machineId, partReplaced, cost, date, nextMaintenanceDue, inventoryItemId, quantityUsed } = req.body;

        if (!vehicleId && !machineId) {
            return res.status(400).json({ message: "Either Vehicle or Machine ID is required." });
        }

        let calculatedCost = parseFloat(cost) || 0;
        let parsedInventoryItemId = inventoryItemId ? parseInt(inventoryItemId) : null;
        let parsedQuantityUsed = quantityUsed ? parseFloat(quantityUsed) : null;

        // Auto-calculate cost based on spare parts used and reduce inventory
        if (parsedInventoryItemId && parsedQuantityUsed) {
            const item = await prisma.inventoryItem.findUnique({ where: { id: parsedInventoryItemId } });
            if (item) {
                if (item.quantity < parsedQuantityUsed) {
                    return res.status(400).json({ message: `Only ${item.quantity} ${item.unit} available in stock.` });
                }

                // Deduct from inventory
                await prisma.inventoryItem.update({
                    where: { id: parsedInventoryItemId },
                    data: { quantity: item.quantity - parsedQuantityUsed }
                });

                // Calculate additional cost from part (if cost wasn't explicitly provided, or add to it)
                calculatedCost += (item.lastPurchasePrice || 0) * parsedQuantityUsed;
            }
        }

        const record = await prisma.maintenance.create({
            data: {
                vehicleId: vehicleId ? parseInt(vehicleId) : undefined,
                machineId: machineId ? parseInt(machineId) : undefined,
                partReplaced,
                cost: calculatedCost,
                date: date ? new Date(date) : new Date(),
                nextMaintenanceDue: nextMaintenanceDue ? new Date(nextMaintenanceDue) : null,
                inventoryItemId: parsedInventoryItemId,
                quantityUsed: parsedQuantityUsed,
            },
            include: { vehicle: true, machine: true, inventoryItem: true }
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
