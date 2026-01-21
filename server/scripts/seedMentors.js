const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Mentors...');

    const password = await bcrypt.hash('password123', 10);

    const mentors = [
        {
            email: 'mentor1@example.com',
            name: 'Col. Rathore',
            role: 'MENTOR',
            password: password,
            expertise: 'Psychology & Interview',
            yearsOfExperience: 25,
            rating: 4.9,
            reviewCount: 120,
            price: 1500,
            bio: 'Retired Colonel with 25 years of service. Ex-IO at 14 SSB Allahabad. Expert in psychological assessment and personal interviews.',
            rank: 'Colonel',
            profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
            isPremium: true
        },
        {
            email: 'mentor2@example.com',
            name: 'Maj. Gen. Sharma',
            role: 'MENTOR',
            password: password,
            expertise: 'GTO & Strategy',
            yearsOfExperience: 30,
            rating: 5.0,
            reviewCount: 85,
            price: 2000,
            bio: 'Former GTO with extensive experience in group dynamics and task solving strategies.',
            rank: 'Major General',
            profileImage: 'https://randomuser.me/api/portraits/men/45.jpg',
            isPremium: true
        },
        {
            email: 'mentor3@example.com',
            name: 'Lt. Cdr. Priya',
            role: 'MENTOR',
            password: password,
            expertise: 'Personal Interview & Communication',
            yearsOfExperience: 12,
            rating: 4.8,
            reviewCount: 200,
            price: 1200,
            bio: 'Specialist in communication skills and personality development for defence aspirants.',
            rank: 'Lt. Commander',
            profileImage: 'https://randomuser.me/api/portraits/women/44.jpg',
            isPremium: true
        },
        {
            email: 'mentor4@example.com',
            name: 'Capt. Vikram',
            role: 'MENTOR',
            password: password,
            expertise: 'Physical Conditioning & GTO',
            yearsOfExperience: 8,
            rating: 4.7,
            reviewCount: 95,
            price: 1000,
            bio: 'Focuses on physical endurance and obstacle courses. Hands-on training approach.',
            rank: 'Captain',
            profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
            isPremium: true
        }
    ];

    for (const mentor of mentors) {
        const user = await prisma.user.upsert({
            where: { email: mentor.email },
            update: {},
            create: mentor,
        });
        console.log(`Created mentor: ${user.name}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
