const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getDashboardSummary = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Date range for filtering (default to today if not provided)
        const dateFilter = {};
        if (startDate || endDate) {
            if (startDate) dateFilter.gte = new Date(startDate);
            if (endDate) dateFilter.lte = new Date(endDate);
        } else {
            dateFilter.gte = today;
        }

        // Run queries sequentially but much faster due to new DB indexes
        const activeVehicles = await prisma.vehicle.count({ where: { status: 'ACTIVE' } });
        const totalVehicles = await prisma.vehicle.count();
        const dieselLogs = await prisma.dieselLog.findMany({ where: { date: dateFilter } });
        const expenses = await prisma.expense.findMany({ where: { date: dateFilter } });
        const dispatches = await prisma.truckDispatch.findMany({ where: { date: dateFilter } });
        const totalPOs = await prisma.purchaseOrder.count();
        const pendingPOs = await prisma.purchaseOrder.count({ where: { status: 'PENDING' } });
        const labourCost = await prisma.workerLog.aggregate({
            _sum: { totalPayment: true },
            where: { date: dateFilter }
        });

        const totalDieselUsed = dieselLogs.reduce((acc, log) => acc + log.dieselFilled, 0);
        const totalExpenses = expenses.reduce((acc, exp) => acc + exp.amount, 0);
        const totalRevenue = dispatches.reduce((acc, dispatch) => acc + dispatch.totalRevenue, 0);
        const profitLoss = totalRevenue - totalExpenses;

        res.json({
            activeVehicles,
            totalVehicles,
            totalDieselUsed,
            totalExpenses,
            totalRevenue,
            profitLoss,
            totalPOs,
            pendingPOs,
            totalLabourCost: labourCost._sum.totalPayment || 0,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getDashboardCharts = async (req, res) => {
    try {
        const { period = '30' } = req.query; // days
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(period));

        // 9. Monthly Performance (current month vs previous month)
        const currentDate = new Date();
        const firstDayCurrentMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        const firstDayPreviousMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

        // Execute aggregation queries sequentially to respect strict Serverless Connection Limits
        const revenueTrend = await prisma.truckDispatch.groupBy({
            by: ['date'],
            where: { date: { gte: daysAgo } },
            _sum: { totalRevenue: true },
            orderBy: { date: 'asc' },
        });

        const expenseTrend = await prisma.expense.groupBy({
            by: ['date'],
            where: { date: { gte: daysAgo } },
            _sum: { amount: true },
            orderBy: { date: 'asc' },
        });

        const dieselTrend = await prisma.dieselLog.groupBy({
            by: ['date'],
            where: { date: { gte: daysAgo } },
            _sum: { dieselFilled: true },
            orderBy: { date: 'asc' },
        });

        const vehicleStatus = await prisma.vehicle.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        const expenseByCategory = await prisma.expense.groupBy({
            by: ['category'],
            _sum: { amount: true },
            orderBy: { _sum: { amount: 'desc' } },
        });

        const topVehicles = await prisma.truckDispatch.groupBy({
            by: ['truckNumber'],
            where: { date: { gte: daysAgo } },
            _sum: { totalRevenue: true },
            _count: { id: true },
            orderBy: { _sum: { totalRevenue: 'desc' } },
            take: 10,
        });

        const dailyDispatches = await prisma.truckDispatch.groupBy({
            by: ['date'],
            where: { date: { gte: daysAgo } },
            _count: { id: true },
            orderBy: { date: 'asc' },
        });

        const materialDistribution = await prisma.truckDispatch.groupBy({
            by: ['materialType'],
            where: { date: { gte: daysAgo } },
            _sum: { tonnage: true, totalRevenue: true },
            orderBy: { _sum: { tonnage: 'desc' } },
        });

        const poStatus = await prisma.purchaseOrder.groupBy({
            by: ['status'],
            _count: { id: true },
        });

        const currentMonthRevenue = await prisma.truckDispatch.aggregate({
            _sum: { totalRevenue: true },
            where: { date: { gte: firstDayCurrentMonth } }
        });

        const previousMonthRevenue = await prisma.truckDispatch.aggregate({
            _sum: { totalRevenue: true },
            where: {
                date: {
                    gte: firstDayPreviousMonth,
                    lt: firstDayCurrentMonth
                }
            }
        });

        res.json({
            revenueTrend: revenueTrend.map(r => ({
                date: new Date(r.date).toLocaleDateString(),
                revenue: r._sum.totalRevenue || 0,
            })),
            expenseTrend: expenseTrend.map(e => ({
                date: new Date(e.date).toLocaleDateString(),
                expenses: e._sum.amount || 0,
            })),
            dieselTrend: dieselTrend.map(d => ({
                date: new Date(d.date).toLocaleDateString(),
                diesel: d._sum.dieselFilled || 0,
            })),
            vehicleStatus: vehicleStatus.map(v => ({
                status: v.status,
                count: v._count.id,
            })),
            expenseByCategory: expenseByCategory.map(e => ({
                category: e.category,
                amount: e._sum.amount || 0,
            })),
            topVehicles: topVehicles.map(v => ({
                truckNumber: v.truckNumber,
                totalRevenue: v._sum.totalRevenue || 0,
                trips: v._count.id,
            })),
            dailyDispatches: dailyDispatches.map(d => ({
                date: new Date(d.date).toLocaleDateString(),
                count: d._count.id,
            })),
            materialDistribution: materialDistribution.map(m => ({
                materialType: m.materialType,
                totalTonnage: m._sum.tonnage || 0,
                totalRevenue: m._sum.totalRevenue || 0,
            })),
            poStatus: poStatus.map(p => ({
                status: p.status,
                count: p._count.id,
            })),
            monthlyComparison: {
                currentMonth: currentMonthRevenue._sum.totalRevenue || 0,
                previousMonth: previousMonthRevenue._sum.totalRevenue || 0,
            },
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDashboardSummary, getDashboardCharts };
