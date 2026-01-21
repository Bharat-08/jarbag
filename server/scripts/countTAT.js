const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.tATImage.count();
    const images = await prisma.tATImage.findMany({ select: { id: true } });
    console.log(`Total TAT Images: ${count}`);
    console.log('IDs:', images.map(i => i.id));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
