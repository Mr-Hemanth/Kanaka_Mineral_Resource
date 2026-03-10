const prisma = require('../utils/prismaClient');

const getDispatches = async (req, res) => {
    try {
        const dispatches = await prisma.truckDispatch.findMany({
            include: {
                driver: true,
                purchaseOrder: {
                    select: {
                        poNumber: true,
                        buyerName: true,
                    }
                },
                purchaseOrderItem: true,
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
            royaltyAmount,
            paymentStatus
        } = req.body;

        const parsedTonnage = parseFloat(tonnage);
        const parsedTransportPrice = parseFloat(transportPricePerTon);

        let parsedPurchaseOrderId = null;
        let parsedPurchaseOrderItemId = null;
        let finalPricePerTon = parseFloat(pricePerTon);

        // If PO is linked, validate and deduct quantity
        if (purchaseOrderId && req.body.purchaseOrderItemId) {
            parsedPurchaseOrderId = parseInt(purchaseOrderId);
            parsedPurchaseOrderItemId = parseInt(req.body.purchaseOrderItemId);

            const poItem = await prisma.purchaseOrderItem.findUnique({
                where: { id: parsedPurchaseOrderItemId }
            });

            if (!poItem) throw new Error("Linked Purchase Order Item not found.");

            const remainingQty = poItem.quantity - poItem.dispatchedQuantity;
            if (parsedTonnage > remainingQty) {
                throw new Error(`Dispatch tonnage (${parsedTonnage}) exceeds remaining PO quantity (${remainingQty}).`);
            }

            // Price calculation logic as requested: Total PO Price = Material Price + Transport Price
            // So if PO says 1900, and transport is 800, then material is 1100.
            // But we store the actual PO price as finalPricePerTon, so:
            finalPricePerTon = poItem.unitPrice;

            // Increment PO item dispatched amount
            await prisma.purchaseOrderItem.update({
                where: { id: parsedPurchaseOrderItemId },
                data: { dispatchedQuantity: poItem.dispatchedQuantity + parsedTonnage }
            });
        }

        // Calculate total revenue from PO price per ton (or manual price)
        const totalRevenue = parsedTonnage * finalPricePerTon;

        // Calculate transport values
        const totalTransportValue = parsedTonnage * parsedTransportPrice;
        const parsedRoyaltyAmount = parseFloat(royaltyAmount) || 0;
        const remainingBalance = totalTransportValue - parsedRoyaltyAmount;

        const dispatch = await prisma.truckDispatch.create({
            data: {
                date: date ? new Date(date) : new Date(),
                truckNumber,
                driverId: driverId ? parseInt(driverId) : null,
                materialType,
                tonnage: parsedTonnage,
                destination,
                buyer,
                pricePerTon: finalPricePerTon,
                totalRevenue,
                purchaseOrderId: parsedPurchaseOrderId,
                purchaseOrderItemId: parsedPurchaseOrderItemId,
                transportPricePerTon: parsedTransportPrice,
                totalTransportValue,
                royaltyAmount: parsedRoyaltyAmount,
                paymentStatus: paymentStatus || 'PENDING',
            },
            include: {
                driver: true,
                purchaseOrder: {
                    select: {
                        poNumber: true,
                        buyerName: true,
                    }
                },
                purchaseOrderItem: true,
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
            royaltyAmount,
            paymentStatus
        } = req.body;

        const originalDispatch = await prisma.truckDispatch.findUnique({
            where: { id: parseInt(req.params.id) }
        });

        const newRoyaltyAmount = royaltyAmount !== undefined ? parseFloat(royaltyAmount) : originalDispatch.royaltyAmount;

        const dispatch = await prisma.truckDispatch.update({
            where: { id: parseInt(req.params.id) },
            data: {
                royaltyAmount: newRoyaltyAmount,
                paymentStatus: paymentStatus || undefined,
            },
            include: {
                driver: true,
                purchaseOrder: {
                    select: {
                        poNumber: true,
                        buyerName: true,
                    }
                },
                purchaseOrderItem: true,
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
