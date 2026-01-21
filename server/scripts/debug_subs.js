const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log("--- Debugging Subscription Counts ---");

    // 1. Count all users
    const totalUsers = await prisma.user.count();
    console.log(`Total Users: ${totalUsers}`);

    // 2. See all users statuses
    const users = await prisma.user.findMany({
        select: { id: true, name: true, role: true, isPremium: true }
    });
    console.table(users);

    // 3. Run the exact query used in admin.js
    const candidatePremium = await prisma.user.count({
        where: {
            role: 'CANDIDATE',
            isPremium: true
        }
    });
    console.log(`Query (Role=CANDIDATE, Premium=true) Count: ${candidatePremium}`);

    // 4. Check query without role
    const allPremium = await prisma.user.count({
        where: { isPremium: true }
    });
    console.log(`Query (Any Role, Premium=true) Count: ${allPremium}`);
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
