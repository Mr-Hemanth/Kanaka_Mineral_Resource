const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

console.log('Starting server initialization...');

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    console.log('Health check endpoint hit');
    res.json({ status: 'ok', message: 'Mine Management API is running' });
});

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

console.log(`Attempting to listen on port ${PORT}...`);

const server = app.listen(PORT, () => {
    console.log(`✓ Server successfully started on port ${PORT}`);
});

server.on('error', (err) => {
    console.error('✗ Server error:', err);
});

// Keep the server running
process.on('SIGINT', () => {
    console.log('\nShutting down...');
    prisma.$disconnect();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
