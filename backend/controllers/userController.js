const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

// Get all Users with search, filter, sort, pagination
const getUsers = async (req, res) => {
    try {
        const { 
            search, 
            role, 
            status,
            page = 1, 
            limit = 10, 
            sortBy = 'createdAt', 
            order = 'desc' 
        } = req.query;

        const where = {};

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        // Role filter
        if (role && role !== 'ALL') {
            where.role = role;
        }

        // Status filter (active/inactive based on last activity)
        if (status && status !== 'ALL') {
            // You can add logic for active/inactive users based on your requirements
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const users = await prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        PurchaseOrders: true,
                        InventoryItems: true,
                        DieselLogs: true,
                        ActivityLogs: true,
                    }
                }
            },
            skip,
            take,
            orderBy: { [sortBy]: order },
        });

        const total = await prisma.user.count({ where });

        res.json({
            data: users,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single User by ID
const getUserById = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                _count: {
                    select: {
                        PurchaseOrders: true,
                        InventoryItems: true,
                        DieselLogs: true,
                        ActivityLogs: true,
                    }
                }
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new User
const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'SUPERVISOR',
            },
        });

        res.status(201).json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update User
const updateUser = async (req, res) => {
    try {
        const { name, email, role, password, newPassword } = req.body;

        // Check if email is being changed and already exists
        if (email) {
            const existingUser = await prisma.user.findFirst({
                where: {
                    email,
                    NOT: { id: parseInt(req.params.id) },
                },
            });

            if (existingUser) {
                return res.status(400).json({ message: 'Email already in use' });
            }
        }

        const updateData = {
            name,
            email,
            role,
        };

        // Handle password change
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            updateData.password = hashedPassword;
        }

        const user = await prisma.user.update({
            where: { id: parseInt(req.params.id) },
            data: updateData,
        });

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    try {
        const userId = parseInt(req.params.id);

        // Prevent self-deletion
        if (req.user.id === userId) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }

        // Check if user has any associated records
        const userWithRecords = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                PurchaseOrders: true,
                InventoryItems: true,
                DieselLogs: true,
                ActivityLogs: true,
            },
        });

        if (userWithRecords) {
            const hasRecords = 
                userWithRecords.PurchaseOrders.length > 0 ||
                userWithRecords.InventoryItems.length > 0 ||
                userWithRecords.DieselLogs.length > 0 ||
                userWithRecords.ActivityLogs.length > 0;

            if (hasRecords) {
                return res.status(400).json({ 
                    message: 'Cannot delete user with existing records. Consider deactivating instead.' 
                });
            }
        }

        await prisma.user.delete({
            where: { id: userId },
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Change User Password (Admin function)
const changeUserPassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = parseInt(req.params.id);

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ message: 'Password must be at least 6 characters long' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get User Statistics
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await prisma.user.count();
        const adminCount = await prisma.user.count({ where: { role: 'ADMIN' } });
        const supervisorCount = await prisma.user.count({ where: { role: 'SUPERVISOR' } });
        const ownerCount = await prisma.user.count({ where: { role: 'OWNER' } });

        res.json({
            totalUsers,
            adminCount,
            supervisorCount,
            ownerCount,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    changeUserPassword,
    getUserStats,
};
