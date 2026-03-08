const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        // or any origin (this allows multiple frontends)
        callback(null, true);
    },
    credentials: true,
}));
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
const labourRoutes = require('./routes/labourRoutes');
const documentRoutes = require('./routes/documentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const siteRoutes = require('./routes/siteRoutes');
const blastingRoutes = require('./routes/blastingRoutes');
const userRoutes = require('./routes/userRoutes');

// We will add more routes here
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/diesel', dieselRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/sites', siteRoutes);
app.use('/api/blasting', blastingRoutes);
app.use('/api/users', userRoutes);

// Make uploads folder publicly accessible
app.use('/uploads', express.static('uploads'));
// ...

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

module.exports = app;
