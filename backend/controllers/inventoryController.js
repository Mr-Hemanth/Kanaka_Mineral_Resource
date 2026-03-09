const prisma = require('../utils/prismaClient');

// Get all Inventory Items with search, filter, sort, and pagination
const getInventoryItems = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            itemType,
            category,
            status,
            sortBy = 'itemName',
            order = 'asc',
        } = req.query;

        const skip = (page - 1) * limit;

        // Build where clause
        const where = {};

        if (search) {
            where.OR = [
                { itemName: { contains: search, mode: 'insensitive' } },
                { partNumber: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (itemType) {
            where.itemType = itemType;
        }

        if (category) {
            where.category = category;
        }

        if (status) {
            where.status = status;
        }

        // Get total count for pagination
        const total = await prisma.inventoryItem.count({ where });

        // Get data with sorting
        const inventoryItems = await prisma.inventoryItem.findMany({
            where,
            skip,
            take: parseInt(limit),
            orderBy: { [sortBy]: order },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        res.json({
            data: inventoryItems,
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

// Get single Inventory Item by ID
const getInventoryItemById = async (req, res) => {
    try {
        const inventoryItem = await prisma.inventoryItem.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        if (!inventoryItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.json(inventoryItem);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new Inventory Item
const createInventoryItem = async (req, res) => {
    try {
        const {
            itemName,
            itemType,
            category,
            partNumber,
            quantity,
            unit,
            minStock,
            maxStock,
            location,
            supplier,
            lastPurchasePrice,
            description,
        } = req.body;

        // Calculate total value
        const totalValue = (quantity || 0) * (lastPurchasePrice || 0);

        // Determine status based on quantity and minStock
        let status = 'IN_STOCK';
        if (quantity <= 0) {
            status = 'OUT_OF_STOCK';
        } else if (quantity <= minStock) {
            status = 'LOW_STOCK';
        }

        const inventoryItem = await prisma.inventoryItem.create({
            data: {
                itemName,
                itemType: itemType || 'OTHER',
                category,
                partNumber,
                quantity: parseFloat(quantity) || 0,
                unit: unit || 'PIECES',
                minStock: parseFloat(minStock) || 0,
                maxStock: maxStock ? parseFloat(maxStock) : null,
                location,
                supplier,
                lastPurchasePrice: lastPurchasePrice ? parseFloat(lastPurchasePrice) : 0,
                totalValue,
                description,
                status,
                addedBy: req.user?.id || null,
            },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        res.status(201).json(inventoryItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Inventory Item
const updateInventoryItem = async (req, res) => {
    try {
        const {
            itemName,
            itemType,
            category,
            partNumber,
            quantity,
            unit,
            minStock,
            maxStock,
            location,
            supplier,
            lastPurchasePrice,
            description,
            status,
        } = req.body;

        // Calculate total value
        const totalValue = (quantity !== undefined ? parseFloat(quantity) : 0) * 
                          (lastPurchasePrice !== undefined ? parseFloat(lastPurchasePrice) : 0);

        // Auto-determine status if not provided
        let finalStatus = status;
        if (!finalStatus && quantity !== undefined) {
            const minStockVal = minStock !== undefined ? parseFloat(minStock) : 0;
            if (quantity <= 0) {
                finalStatus = 'OUT_OF_STOCK';
            } else if (quantity <= minStockVal) {
                finalStatus = 'LOW_STOCK';
            } else {
                finalStatus = 'IN_STOCK';
            }
        }

        const inventoryItem = await prisma.inventoryItem.update({
            where: { id: parseInt(req.params.id) },
            data: {
                itemName,
                itemType,
                category,
                partNumber,
                quantity: quantity !== undefined ? parseFloat(quantity) : undefined,
                unit,
                minStock: minStock !== undefined ? parseFloat(minStock) : undefined,
                maxStock: maxStock !== undefined ? (maxStock ? parseFloat(maxStock) : null) : undefined,
                location,
                supplier,
                lastPurchasePrice: lastPurchasePrice !== undefined ? parseFloat(lastPurchasePrice) : undefined,
                totalValue,
                description,
                status: finalStatus,
            },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        res.json(inventoryItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Stock Quantity (Add/Remove stock)
const updateStock = async (req, res) => {
    try {
        const { quantityChange, reason } = req.body; // Positive for add, negative for remove
        
        const item = await prisma.inventoryItem.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        const newQuantity = item.quantity + parseFloat(quantityChange);
        
        // Determine new status
        let newStatus = 'IN_STOCK';
        if (newQuantity <= 0) {
            newStatus = 'OUT_OF_STOCK';
        } else if (newQuantity <= item.minStock) {
            newStatus = 'LOW_STOCK';
        }

        const updatedItem = await prisma.inventoryItem.update({
            where: { id: parseInt(req.params.id) },
            data: {
                quantity: newQuantity,
                status: newStatus,
                totalValue: newQuantity * (item.lastPurchasePrice || 0),
            },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Inventory Item
const deleteInventoryItem = async (req, res) => {
    try {
        await prisma.inventoryItem.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Inventory item deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Low Stock Items
const getLowStockItems = async (req, res) => {
    try {
        const lowStockItems = await prisma.inventoryItem.findMany({
            where: {
                OR: [
                    { quantity: { lte: 0 } },
                    { quantity: { lte: prisma.inventoryItem.fields.minStock } },
                ],
            },
            orderBy: { quantity: 'asc' },
            include: {
                user: {
                    select: { name: true, email: true },
                },
            },
        });

        res.json(lowStockItems);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getInventoryItems,
    getInventoryItemById,
    createInventoryItem,
    updateInventoryItem,
    updateStock,
    deleteInventoryItem,
    getLowStockItems,
};
