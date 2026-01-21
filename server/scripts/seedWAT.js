const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const WAT_WORDS = [
    "Picture", "Kin", "Impossible", "Lonely", "Wait", "Coward", "Luck", "Delay", "Minister", "Past",
    "Company", "Parents", "Discipline", "Dark", "Sister", "Atom", "Society", "War", "Excuse", "Character",
    "Rest", "Duty", "Idea", "Money", "Teacher", "System", "Enemy", "Home", "Help", "Punish",
    "Leader", "Care", "Work", "Mother", "Fear", "Goal", "Success", "Failure", "Friend", "Country",
    "Peace", "Love", "Hate", "Challenge", "Respect", "Dream", "Team", "Fight", "Win", "Lose"
];

async function main() {
    console.log('Seeding WAT Words...');

    // Clear existing to avoid duplicates if re-run (optional, or just use createMany with skipDuplicates)
    // await prisma.wATWord.deleteMany({}); 

    let count = 0;
    for (const word of WAT_WORDS) {
        try {
            await prisma.wATWord.create({
                data: { word: word }
            });
            count++;
        } catch (e) {
            if (e.code === 'P2002') {
                // Unique constraint failed, ignore
                console.log(`Skipping duplicate: ${word}`);
            } else {
                console.error(`Error adding ${word}:`, e);
            }
        }
    }

    console.log(`Seeded ${count} words.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
