const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const rawData = [
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007705/Screenshot_2026-01-21_202323_emetlw.png",
        descriptions: [
            "Ramesh, a municipal worker, notices a damaged notice board outside a government office that often causes confusion among villagers. Carrying basic tools, he decides to fix it before office hours. His timely action ensures that people get correct information and prevents crowding and arguments later in the day.",
            "An office maintenance supervisor sees people struggling to read a torn notice. He immediately arranges materials and repairs the board. His proactive approach reflects discipline, responsibility, and concern for public convenience.",
            "A man working in the office realizes that unclear notices are affecting villagers’ access to services. He takes initiative to repair and reorganize the notice board, ensuring transparency and smooth functioning of the office."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007705/Screenshot_2026-01-21_202459_ux1sco.png",
        descriptions: [
            "A young professional reviews his work and plans improvements. He reflects on feedback to enhance productivity.",
            "A student analyzes his study schedule and identifies areas needing better time management.",
            "An office worker pauses to evaluate a problem before taking a well-thought-out decision."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007705/Screenshot_2026-01-21_202452_cykceo.png",
        descriptions: [
            "Sunita, a village girl, balances farm responsibilities while preparing for her exams. She believes education will help improve her family’s future.",
            "A rural student studies after fieldwork, determined to become a teacher and contribute to her village’s development."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007705/Screenshot_2026-01-21_202435_ukxiew.png",
        descriptions: [
            "Rahul notices a boy struggling in the river. Without jumping impulsively, he uses a rope nearby and carefully pulls the boy to safety, later informing local authorities.",
            "A villager hears cries from the river and quickly brings a rope. His calm approach saves the person without endangering himself.",
            "A trained NCC cadet uses a rope technique to rescue a drowning man and ensures first aid is given afterward."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007706/Screenshot_2026-01-21_202523_ewnjpa.png",
        descriptions: [
            "A village girl responsibly collects water for her household before school, managing time effectively.",
            "She carefully fills water pots, ensuring safety while helping her family.",
            "The girl balances domestic responsibilities with education, showing discipline and maturity."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007706/Screenshot_2026-01-21_202429_xtq9nw.png",
        descriptions: [
            "Meena notices her husband is unwell and exhausted due to work stress. She calmly steps out to call a doctor and inform a family member. Her composed response ensures timely medical attention.",
            "A woman realizes her brother has fainted due to fatigue. Instead of panicking, she opens the door to seek help from neighbors and arranges water and medical support.",
            "Seeing her colleague collapse from overwork during a stay, she immediately goes to call for help and arranges rest, demonstrating presence of mind and care."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007707/Screenshot_2026-01-21_202530_wrwsqi.png",
        descriptions: [
            "A young man listens to villagers’ concerns and mediates a discussion respectfully to resolve a local issue.",
            "He consults elders before proposing a practical solution, ensuring harmony in the village.",
            "A social worker engages villagers in dialogue to improve cooperation and mutual understanding."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007707/Screenshot_2026-01-21_202444_ri3gr7.png",
        descriptions: [
            "Two research interns conduct an experiment under supervision. One carefully records observations while the other handles equipment, ensuring safety and accuracy.",
            "A science student demonstrates an experiment while her partner observes results. Their coordinated effort reflects discipline and learning orientation.",
            "A young researcher performs a chemical test while a senior monitors the procedure, ensuring proper protocol and teamwork."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007707/Screenshot_2026-01-21_202548_higcmk.png",
        descriptions: [
            "A shopkeeper notices a thief fleeing. He alerts others and helps stop the theft without violence.",
            "A traffic volunteer helps control the situation and ensures public safety.",
            "A group of citizens coordinate to prevent chaos and inform authorities."
        ]
    },
    {
        url: "https://res.cloudinary.com/dabqf8w31/image/upload/v1769007708/Screenshot_2026-01-21_202538_j9idpu.png",
        descriptions: [
            "A mother notices her child injured while walking. She calmly lifts him and takes him to the health center.",
            "She seeks help from neighbors and ensures first aid before medical care.",
            "Despite distress, she remains composed and prioritizes her child’s safety."
        ]
    }
];

async function main() {
    console.log('Seeding TAT Images...');
    // Optional: Clear existing entries to prevent duplication/mess
    await prisma.tATImage.deleteMany({});

    for (const item of rawData) {
        // Combine descriptions into a single string
        const combinedDesc = item.descriptions.map((d, i) => `${i + 1}. ${d}`).join('\n');

        await prisma.tATImage.create({
            data: {
                url: item.url,
                description: combinedDesc
            }
        });
    }
    console.log(`Seeded ${rawData.length} TAT images.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
