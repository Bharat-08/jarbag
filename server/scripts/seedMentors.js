const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Mentors...');

    const mentors = [
        {
            name: "Maj Arjun Singh (Retd.)",
            email: "arjun.singh@example.com",
            expertise: "GTO & Psychology",
            rank: "Major",
            yearsOfExperience: 10,
            rating: 5.0,
            reviewCount: 250,
            price: 999,
            bio: "Nation First, Always. Proud to have served my country. Sharing stories of courage & camaraderie.",
            profileImage: "https://ui-avatars.com/api/?name=Arjun+Singh&background=0D8ABC&color=fff"
        },
        {
            name: "Lt Col Shlok Sharma (Retd.)",
            email: "shlok.sharma@example.com",
            expertise: "GTO & Psychology",
            rank: "Lt Colonel",
            yearsOfExperience: 15,
            rating: 4.8,
            reviewCount: 180,
            price: 999,
            bio: "Expert in GTO tasks and psychological assessment. Guiding future leaders.",
            profileImage: "https://ui-avatars.com/api/?name=Shlok+Sharma&background=2E7D32&color=fff"
        },
        {
            name: "Col R. L. Gupta (Retd.)",
            email: "rl.gupta@example.com",
            expertise: "Interviewing Officer",
            rank: "Colonel",
            yearsOfExperience: 25,
            rating: 4.9,
            reviewCount: 300,
            price: 1499,
            bio: "Former IO with extensive experience in selection boards. Mastering the interview technique.",
            profileImage: "https://ui-avatars.com/api/?name=RL+Gupta&background=C62828&color=fff"
        },
        {
            name: "Maj Vijayata (Retd.)",
            email: "vijayata@example.com",
            expertise: "GTO & Psychology",
            rank: "Major",
            yearsOfExperience: 8,
            rating: 5.0,
            reviewCount: 120,
            price: 999,
            bio: "Breaking barriers. Specializing in women entry schemes and psychology.",
            profileImage: "https://ui-avatars.com/api/?name=Maj+Vijayata&background=F9A825&color=fff"
        },
        {
            name: "Capt. Mohit Tripathi (Retd.)",
            email: "mohit.tripathi@example.com",
            expertise: "GTO",
            rank: "Captain",
            yearsOfExperience: 6,
            rating: 4.7,
            reviewCount: 90,
            price: 799,
            bio: "Young and dynamic GTO guidance. Focus on group dynamics and leadership.",
            profileImage: "https://ui-avatars.com/api/?name=Mohit+Tripathi&background=1565C0&color=fff"
        }
    ];

    const password = await bcrypt.hash('mentor123', 10);

    for (const mentor of mentors) {
        // Upsert to avoid duplicates
        await prisma.user.upsert({
            where: { email: mentor.email },
            update: {
                role: 'MENTOR',
                expertise: mentor.expertise,
                rank: mentor.rank,
                yearsOfExperience: mentor.yearsOfExperience,
                rating: mentor.rating,
                reviewCount: mentor.reviewCount,
                price: mentor.price,
                bio: mentor.bio,
                profileImage: mentor.profileImage
            },
            create: {
                email: mentor.email,
                name: mentor.name,
                password,
                role: 'MENTOR',
                expertise: mentor.expertise,
                rank: mentor.rank,
                yearsOfExperience: mentor.yearsOfExperience,
                rating: mentor.rating,
                reviewCount: mentor.reviewCount,
                price: mentor.price,
                bio: mentor.bio,
                profileImage: mentor.profileImage
            }
        });
        console.log(`Upserted ${mentor.name}`);
    }

    console.log('Seeding completed.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
