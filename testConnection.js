// testConnection.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

(async function main() {
    try {
        const result = await prisma.$queryRaw`SELECT NOW();`;
        console.log('✅ Database connection successful! Current database time:', result[0].now);
    } catch (error) {
        console.error('❌ Failed to connect to the database:', error);
    } finally {
        await prisma.$disconnect();
    }
})();
