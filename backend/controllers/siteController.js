const prisma = require('../utils/prismaClient');

// ==================== SITE MANAGEMENT ====================

// Get all Sites
const getSites = async (req, res) => {
    try {
        const sites = await prisma.site.findMany({
            include: {
                staff: { where: { isActive: true } },
                vehicles: true,
                machines: true,
                _count: {
                    select: {
                        staff: true,
                        vehicles: true,
                        machines: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(sites);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single Site by ID
const getSiteById = async (req, res) => {
    try {
        const site = await prisma.site.findUnique({
            where: { id: parseInt(req.params.id) },
            include: {
                staff: true,
                vehicles: true,
                machines: true,
            },
        });

        if (!site) {
            return res.status(404).json({ message: 'Site not found' });
        }

        res.json(site);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create new Site
const createSite = async (req, res) => {
    try {
        const { siteName, location, startDate, endDate, status, siteManager, contactNumber, description } = req.body;

        const site = await prisma.site.create({
            data: {
                siteName,
                location,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null,
                status: status || 'ACTIVE',
                siteManager,
                contactNumber,
                description,
            },
        });

        res.status(201).json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Site
const updateSite = async (req, res) => {
    try {
        const { siteName, location, startDate, endDate, status, siteManager, contactNumber, description } = req.body;

        const site = await prisma.site.update({
            where: { id: parseInt(req.params.id) },
            data: {
                siteName,
                location,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                status,
                siteManager,
                contactNumber,
                description,
            },
        });

        res.json(site);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Site
const deleteSite = async (req, res) => {
    try {
        await prisma.site.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Site deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== SITE STAFF MANAGEMENT ====================

// Get Staff for a Site
const getSiteStaff = async (req, res) => {
    try {
        const staff = await prisma.siteStaff.findMany({
            where: { siteId: parseInt(req.params.siteId) },
            orderBy: { createdAt: 'desc' },
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Staff to Site
const addSiteStaff = async (req, res) => {
    try {
        const { name, role, phone, email, aadharNumber, notes } = req.body;

        const staff = await prisma.siteStaff.create({
            data: {
                siteId: parseInt(req.params.siteId),
                name,
                role: role || 'OTHER',
                phone,
                email,
                aadharNumber,
                notes,
            },
        });

        res.status(201).json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Staff
const updateSiteStaff = async (req, res) => {
    try {
        const { name, role, phone, email, aadharNumber, isActive, notes } = req.body;

        const staff = await prisma.siteStaff.update({
            where: { id: parseInt(req.params.id) },
            data: {
                name,
                role,
                phone,
                email,
                aadharNumber,
                isActive,
                notes,
            },
        });

        res.json(staff);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove Staff from Site
const removeSiteStaff = async (req, res) => {
    try {
        await prisma.siteStaff.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Staff removed from site' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== SITE VEHICLE MANAGEMENT ====================

// Get Vehicles for a Site
const getSiteVehicles = async (req, res) => {
    try {
        const vehicles = await prisma.siteVehicle.findMany({
            where: { siteId: parseInt(req.params.siteId) },
            orderBy: { createdAt: 'desc' },
        });
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Vehicle to Site
const addSiteVehicle = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, driverName, driverPhone, fuelLevel, hoursWorked, lastService, notes } = req.body;

        const vehicle = await prisma.siteVehicle.create({
            data: {
                siteId: parseInt(req.params.siteId),
                vehicleNumber,
                vehicleType: vehicleType || 'OTHER',
                driverName,
                driverPhone,
                fuelLevel: fuelLevel ? parseFloat(fuelLevel) : 0,
                hoursWorked: hoursWorked ? parseFloat(hoursWorked) : 0,
                lastService: lastService ? new Date(lastService) : null,
                notes,
            },
        });

        res.status(201).json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Vehicle
const updateSiteVehicle = async (req, res) => {
    try {
        const { vehicleNumber, vehicleType, driverName, driverPhone, status, fuelLevel, hoursWorked, lastService, notes } = req.body;

        const vehicle = await prisma.siteVehicle.update({
            where: { id: parseInt(req.params.id) },
            data: {
                vehicleNumber,
                vehicleType,
                driverName,
                driverPhone,
                status,
                fuelLevel: fuelLevel !== undefined ? parseFloat(fuelLevel) : undefined,
                hoursWorked: hoursWorked !== undefined ? parseFloat(hoursWorked) : undefined,
                lastService: lastService ? new Date(lastService) : undefined,
                notes,
            },
        });

        res.json(vehicle);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove Vehicle from Site
const removeSiteVehicle = async (req, res) => {
    try {
        await prisma.siteVehicle.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Vehicle removed from site' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ==================== SITE MACHINE MANAGEMENT ====================

// Get Machines for a Site
const getSiteMachines = async (req, res) => {
    try {
        const machines = await prisma.siteMachine.findMany({
            where: { siteId: parseInt(req.params.siteId) },
            orderBy: { createdAt: 'desc' },
        });
        res.json(machines);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add Machine to Site
const addSiteMachine = async (req, res) => {
    try {
        const { machineName, machineType, modelNumber, serialNumber, capacity, purchaseDate, lastMaintenance, nextMaintenance, hoursUsed, notes } = req.body;

        const machine = await prisma.siteMachine.create({
            data: {
                siteId: parseInt(req.params.siteId),
                machineName,
                machineType: machineType || 'OTHER',
                modelNumber,
                serialNumber,
                capacity,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
                lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
                nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
                hoursUsed: hoursUsed ? parseFloat(hoursUsed) : 0,
                notes,
            },
        });

        res.status(201).json(machine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Machine
const updateSiteMachine = async (req, res) => {
    try {
        const { machineName, machineType, modelNumber, serialNumber, capacity, status, purchaseDate, lastMaintenance, nextMaintenance, hoursUsed, notes } = req.body;

        const machine = await prisma.siteMachine.update({
            where: { id: parseInt(req.params.id) },
            data: {
                machineName,
                machineType,
                modelNumber,
                serialNumber,
                capacity,
                status,
                purchaseDate: purchaseDate ? new Date(purchaseDate) : undefined,
                lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : undefined,
                nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : undefined,
                hoursUsed: hoursUsed !== undefined ? parseFloat(hoursUsed) : undefined,
                notes,
            },
        });

        res.json(machine);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Remove Machine from Site
const removeSiteMachine = async (req, res) => {
    try {
        await prisma.siteMachine.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Machine removed from site' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    // Site
    getSites,
    getSiteById,
    createSite,
    updateSite,
    deleteSite,
    // Staff
    getSiteStaff,
    addSiteStaff,
    updateSiteStaff,
    removeSiteStaff,
    // Vehicles
    getSiteVehicles,
    addSiteVehicle,
    updateSiteVehicle,
    removeSiteVehicle,
    // Machines
    getSiteMachines,
    addSiteMachine,
    updateSiteMachine,
    removeSiteMachine,
};
