const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding TAT Image...');

    const image = await prisma.tATImage.create({
        data: {
            url: 'https://res.cloudinary.com/dabqf8w31/image/upload/v1769007707/Screenshot_2026-01-21_202444_ri3gr7.png',
            description1: 'Two research interns conduct an experiment under supervision. One carefully records observations while the other handles equipment, ensuring safety and accuracy.',
            description2: 'A science student demonstrates an experiment while her partner observes results. Their coordinated effort reflects discipline and learning orientation.',
            description3: 'A young researcher performs a chemical test while a senior monitors the procedure, ensuring proper protocol and teamwork.'
        },
    });

    console.log('Created TAT Image:', image);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
