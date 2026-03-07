const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all Blast Records with search, filter, sort, pagination
const getBlastRecords = async (req, res) => {
    try {
        const { 
            search, 
            status, 
            siteId,
            page = 1, 
            limit = 10, 
            sortBy = 'date', 
            order = 'desc' 
        } = req.query;

        const where = {};

        // Search filter
        if (search) {
            where.OR = [
                { blastNumber: { contains: search } },
                { location: { contains: search } },
                { supervisor: { contains: search } },
                { agency: { contains: search } },
            ];
        }

        // Status filter
        if (status && status !== 'ALL') {
            where.status = status;
        }

        // Site filter
        if (siteId) {
            where.siteId = parseInt(siteId);
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const records = await prisma.blastRecord.findMany({
            where,
            include: { site: true },
            skip,
            take,
            orderBy: { [sortBy]: order },
        });

        const total = await prisma.blastRecord.count({ where });

        res.json({
            data: records,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single Blast Record
const getBlastRecordById = async (req, res) => {
    try {
        const record = await prisma.blastRecord.findUnique({
            where: { id: parseInt(req.params.id) },
            include: { site: true },
        });

        if (!record) {
            return res.status(404).json({ message: 'Blast record not found' });
        }

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create Blast Record
const createBlastRecord = async (req, res) => {
    try {
        const {
            date,
            siteId,
            blastNumber,
            location,
            totalHoles,
            holeDepth,
            explosiveUsed,
            detonatorCount,
            powderFactor,
            volumeBlasted,
            chargePerHole,
            stemmingLength,
            blastingTime,
            supervisor,
            agency,
            weatherCondition,
            vibrationLevel,
            flyrockDistance,
            safetyMeasures,
            remarks,
            status,
        } = req.body;

        const record = await prisma.blastRecord.create({
            data: {
                date: date ? new Date(date) : new Date(),
                siteId: siteId ? parseInt(siteId) : null,
                blastNumber,
                location,
                totalHoles: parseInt(totalHoles),
                holeDepth: parseFloat(holeDepth),
                explosiveUsed: parseFloat(explosiveUsed),
                detonatorCount: parseInt(detonatorCount),
                powderFactor: parseFloat(powderFactor),
                volumeBlasted: parseFloat(volumeBlasted),
                chargePerHole: parseFloat(chargePerHole),
                stemmingLength: stemmingLength ? parseFloat(stemmingLength) : null,
                blastingTime: blastingTime ? new Date(blastingTime) : null,
                supervisor,
                agency,
                weatherCondition,
                vibrationLevel: vibrationLevel ? parseFloat(vibrationLevel) : null,
                flyrockDistance: flyrockDistance ? parseFloat(flyrockDistance) : null,
                safetyMeasures,
                remarks,
                status: status || 'COMPLETED',
            },
            include: { site: true },
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update Blast Record
const updateBlastRecord = async (req, res) => {
    try {
        const {
            date,
            siteId,
            blastNumber,
            location,
            totalHoles,
            holeDepth,
            explosiveUsed,
            detonatorCount,
            powderFactor,
            volumeBlasted,
            chargePerHole,
            stemmingLength,
            blastingTime,
            supervisor,
            agency,
            weatherCondition,
            vibrationLevel,
            flyrockDistance,
            safetyMeasures,
            remarks,
            status,
        } = req.body;

        const record = await prisma.blastRecord.update({
            where: { id: parseInt(req.params.id) },
            data: {
                date: date ? new Date(date) : undefined,
                siteId: siteId !== undefined ? (siteId ? parseInt(siteId) : null) : undefined,
                blastNumber,
                location,
                totalHoles: totalHoles !== undefined ? parseInt(totalHoles) : undefined,
                holeDepth: holeDepth !== undefined ? parseFloat(holeDepth) : undefined,
                explosiveUsed: explosiveUsed !== undefined ? parseFloat(explosiveUsed) : undefined,
                detonatorCount: detonatorCount !== undefined ? parseInt(detonatorCount) : undefined,
                powderFactor: powderFactor !== undefined ? parseFloat(powderFactor) : undefined,
                volumeBlasted: volumeBlasted !== undefined ? parseFloat(volumeBlasted) : undefined,
                chargePerHole: chargePerHole !== undefined ? parseFloat(chargePerHole) : undefined,
                stemmingLength: stemmingLength !== undefined ? (stemmingLength ? parseFloat(stemmingLength) : null) : undefined,
                blastingTime: blastingTime !== undefined ? (blastingTime ? new Date(blastingTime) : null) : undefined,
                supervisor,
                agency,
                weatherCondition,
                vibrationLevel: vibrationLevel !== undefined ? (vibrationLevel ? parseFloat(vibrationLevel) : null) : undefined,
                flyrockDistance: flyrockDistance !== undefined ? (flyrockDistance ? parseFloat(flyrockDistance) : null) : undefined,
                safetyMeasures,
                remarks,
                status,
            },
            include: { site: true },
        });

        res.json(record);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete Blast Record
const deleteBlastRecord = async (req, res) => {
    try {
        await prisma.blastRecord.delete({
            where: { id: parseInt(req.params.id) },
        });
        res.json({ message: 'Blast record deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getBlastRecords,
    getBlastRecordById,
    createBlastRecord,
    updateBlastRecord,
    deleteBlastRecord,
};
