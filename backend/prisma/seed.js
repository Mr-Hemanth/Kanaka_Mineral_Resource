const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    console.log(`Start seeding ...`);

    // Create Admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@kanaka.com' },
        update: {},
        create: {
            name: 'Site Admin',
            email: 'admin@kanaka.com',
            password: adminPassword,
            role: 'ADMIN',
        },
    });
    console.log(`Created admin user with id: ${admin.id}`);

    // Create Supervisor
    const supervisorPassword = await bcrypt.hash('super123', 10);
    const supervisor = await prisma.user.upsert({
        where: { email: 'supervisor@kanaka.com' },
        update: {},
        create: {
            name: 'Shift Supervisor',
            email: 'supervisor@kanaka.com',
            password: supervisorPassword,
            role: 'SUPERVISOR',
        },
    });
    console.log(`Created supervisor user with id: ${supervisor.id}`);

    // Create Owner
    const ownerPassword = await bcrypt.hash('owner123', 10);
    const owner = await prisma.user.upsert({
        where: { email: 'owner@kanaka.com' },
        update: {},
        create: {
            name: 'Business Owner',
            email: 'owner@kanaka.com',
            password: ownerPassword,
            role: 'OWNER',
        },
    });
    console.log(`Created owner user with id: ${owner.id}`);

    console.log(`Seeding finished.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
