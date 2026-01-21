const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'bharat@gmail.com';
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' },
        });
        console.log(`User ${user.email} promoted to ${user.role}`);
    } catch (error) {
        console.error("Error promoting user:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
