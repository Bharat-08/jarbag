const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Cleaning Vimeo URL...');

    // Delete existing to force clean slate
    await prisma.video.deleteMany({});

    // Add CLEAN Vimeo URL
    await prisma.video.create({
        data: {
            url: "https://vimeo.com/1156730233"
        }
    });

    console.log('Video updated with clean URL.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
