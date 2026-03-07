const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDispatches = async (req, res) => {
    try {
        const dispatches = await prisma.truckDispatch.findMany({
            include: { 
                driver: true,
                purchaseOrder: {
                    select: {
                        poNumber: true,
                        supplierName: true,
                    }
                }
            },
            orderBy: { date: 'desc' },
        });
        res.json(dispatches);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createDispatch = async (req, res) => {
    try {
        const { 
            date, 
            truckNumber, 
            driverId, 
            materialType, 
            tonnage, 
            destination, 
            buyer, 
            pricePerTon,
            purchaseOrderId,
            transportPricePerTon,
            advancePaid,
            balancePaid,
            paymentStatus
        } = req.body;

        // Calculate total revenue from PO price per ton
        const totalRevenue = parseFloat(tonnage) * parseFloat(pricePerTon);
        
        // Calculate transport values
        const totalTransportValue = parseFloat(tonnage) * parseFloat(transportPricePerTon);
        const advanceAmount = totalTransportValue * 0.70; // 70% advance
        const balanceAmount = totalTransportValue * 0.30; // 30% balance

        const dispatch = await prisma.truckDispatch.create({
            data: {
                date: date ? new Date(date) : new Date(),
                truckNumber,
                driverId: driverId ? parseInt(driverId) : null,
                materialType,
                tonnage: parseFloat(tonnage),
                destination,
                buyer,
                pricePerTon: parseFloat(pricePerTon),
                totalRevenue,
                purchaseOrderId: purchaseOrderId ? parseInt(purchaseOrderId) : null,
                transportPricePerTon: parseFloat(transportPricePerTon),
                totalTransportValue,
                advanceAmount,
                balanceAmount,
                advancePaid: advancePaid || false,
                balancePaid: balancePaid || false,
                paymentStatus: paymentStatus || 'PENDING',
            },
            include: {
                driver: true,
                purchaseOrder: {
                    select: {
                        poNumber: true,
                        supplierName: true,
                    }
                }
            },
        });

        res.status(201).json(dispatch);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateDispatch = async (req, res) => {
    try {
        const { 
            advancePaid,
            balancePaid,
            paymentStatus
        } = req.body;

        const dispatch = await prisma.truckDispatch.update({
            where: { id: parseInt(req.params.id) },
            data: {
                advancePaid: advancePaid !== undefined ? advancePaid : undefined,
                balancePaid: balancePaid !== undefined ? balancePaid : undefined,
                paymentStatus: paymentStatus || undefined,
            },
            include: {
                driver: true,
                purchaseOrder: {
                    select: {
                        poNumber: true,
                        supplierName: true,
                    }
                }
            },
        });

        res.json(dispatch);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteDispatch = async (req, res) => {
    try {
        await prisma.truckDispatch.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Dispatch log removed' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDispatches, createDispatch, updateDispatch, deleteDispatch };
