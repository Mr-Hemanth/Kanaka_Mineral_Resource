const express = require('express');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

// Force CORS headers middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
});

// Preflight requests are handled by vercel.json headers now
app.use(express.json());

// Test endpoint to verify server is running
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Mine Management API is running on port 3500' });
});

// Root endpoint so Vercel doesn't return 404 "Cannot GET /"
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Kanaka Minerals API. The server is online.' });
});

const authRoutes = require('./routes/authRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const dieselRoutes = require('./routes/dieselRoutes');
const dispatchRoutes = require('./routes/dispatchRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const blastingRoutes = require('./routes/blastingRoutes');
const userRoutes = require('./routes/userRoutes');

// New Routes
const machineRoutes = require('./routes/machines');
const machineLogRoutes = require('./routes/machineLogs');
const workerRoutes = require('./routes/workers');
const workerLogRoutes = require('./routes/workerLogs');
const vehicleTripRoutes = require('./routes/vehicleTrips');

// We will add more routes here
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/diesel', dieselRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/blasting', blastingRoutes);
app.use('/api/users', userRoutes);

// Mount new routes
app.use('/api/machines', machineRoutes);
app.use('/api/machine-logs', machineLogRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/worker-logs', workerLogRoutes);
app.use('/api/vehicle-trips', vehicleTripRoutes);

// Make uploads folder publicly accessible
app.use('/uploads', express.static('uploads'));
// ...

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
