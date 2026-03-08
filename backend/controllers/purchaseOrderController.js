const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all Purchase Orders with search, filter, sort, and pagination
const getPurchaseOrders = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            status,
            sortBy = 'createdAt',
            order = 'desc',
            startDate,
            endDate,
        } = req.query;

        const skip = (page - 1) * limit;

        // Build where clause
        const where = {};

        if (search) {
            where.OR = [
                { poNumber: { contains: search, mode: 'insensitive' } },
                { supplierName: { contains: search, mode: 'insensitive' } },
                { gstNo: { contains: search, mode: 'insensitive' } },
                { gstDetails: { contains: search, mode: 'insensitive' } },
                { notes: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status) {
            if (status.includes(',')) {
                where.status = { in: status.split(',') };
            } else {
                where.status = status;
            }
        }

        if (startDate || endDate) {
            where.orderDate = {};
            if (startDate) where.orderDate.gte = new Date(startDate);
            if (endDate) where.orderDate.lte = new Date(endDate);
        }

        // Get total count for pagination
        const total = await prisma.purchaseOrder.count({ where });

        // Get data with sorting
        const purchaseOrders = await prisma.purchaseOrder.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { [sortBy]: order },
            include: {
                user: {
                    select: { name: true, email: true },
                },
                items: true,
            },
        });

        res.json({
            data: purchaseOrders,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit),
            },
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single Purchase Order by ID
const getPurchaseOrderById = async (req, res) => {
    try {
        const purchaseOrder = await prisma.purchaseOrder.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: {
                    select: { name: true, email: true },
                },
                items: true,
            },
        });

        if (!purchaseOrder) {
            return res.status(404).json({ message: 'Purchase Order not found' });
        }

        res.json(purchaseOrder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new Purchase Order
const createPurchaseOrder = async (req, res) => {
    try {
        const { poNumber, orderDate, deliveryDate, supplierName, supplierContact, gstNo, gstDetails, status, totalAmount, paymentTerms, notes, items } = req.body;

        // Generate PO number if not provided
        const generatedPoNumber = poNumber || `PO-${Date.now()}`;

        const purchaseOrder = await prisma.purchaseOrder.create({
            data: {
                poNumber: generatedPoNumber,
                orderDate: orderDate ? new Date(orderDate) : new Date(),
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                supplierName,
                supplierContact,
                gstNo,
                gstDetails,
                status: status || 'PENDING',
                totalAmount: totalAmount || 0,
                paymentTerms,
                notes,
                createdBy: req.user.id,
                items: items ? {
                    create: items.map(item => ({
                        itemName: item.itemName,
                        itemType: item.itemType || 'OTHER',
                        quantity: parseFloat(item.quantity),
                        unit: item.unit,
                        unitPrice: parseFloat(item.unitPrice),
                        totalPrice: parseFloat(item.totalPrice),
                        specifications: item.specifications,
                    }))
                } : undefined,
            },
            include: {
                items: true,
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        res.status(201).json(purchaseOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Purchase Order
const updatePurchaseOrder = async (req, res) => {
    try {
        const { poNumber, orderDate, deliveryDate, supplierName, supplierContact, gstNo, gstDetails, status, totalAmount, paymentTerms, notes } = req.body;

        const purchaseOrder = await prisma.purchaseOrder.update({
            where: { id: parseInt(req.params.id) },
            data: {
                poNumber,
                orderDate: orderDate ? new Date(orderDate) : undefined,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : undefined,
                supplierName,
                supplierContact,
                gstNo,
                gstDetails,
                status,
                totalAmount,
                paymentTerms,
                notes,
            },
            include: {
                items: true,
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        res.json(purchaseOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Purchase Order
const deletePurchaseOrder = async (req, res) => {
    try {
        await prisma.purchaseOrder.delete({
            where: { id: parseInt(req.params.id) },
        });

        res.json({ message: 'Purchase Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Purchase Order Statistics
const getPurchaseOrderStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Total Purchase Orders
        const totalPOs = await prisma.purchaseOrder.count();

        // Pending POs
        const pendingPOs = await prisma.purchaseOrder.count({
            where: { status: 'PENDING' },
        });

        // Total Spend This Month
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const thisMonthSpend = await prisma.purchaseOrder.aggregate({
            _sum: { totalAmount: true },
            where: {
                orderDate: { gte: firstDayOfMonth },
                status: 'COMPLETED',
            },
        });

        // Average Order Value
        const avgOrderValue = await prisma.purchaseOrder.aggregate({
            _avg: { totalAmount: true },
        });

        res.json({
            totalPOs,
            pendingPOs,
            thisMonthSpend: thisMonthSpend._sum.totalAmount || 0,
            avgOrderValue: avgOrderValue._avg.totalAmount || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getPurchaseOrders,
    getPurchaseOrderById,
    createPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    getPurchaseOrderStats,
};
