const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Updating video to Vimeo link...');

    // Clear existing videos
    await prisma.video.deleteMany({});

    // Add new Vimeo video
    await prisma.video.create({
        data: {
            url: "https://vimeo.com/1156730233?share=copy&fl=sv&fe=ci"
        }
    });

    console.log('Video updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
