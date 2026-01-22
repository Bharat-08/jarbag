const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        // Find a candidate user (or create/use first user)
        const user = await prisma.user.findFirst({ where: { role: 'CANDIDATE' } });
        if (!user) {
            console.log("No candidate user found to attach result to.");
            return;
        }

        console.log("Adding result for user:", user.email);

        const result = await prisma.examResult.create({
            data: {
                userId: user.id,
                examName: "Test Debug Entry",
                testType: "WAT",
                score: 50,
                total: 80,
                percentage: 62.5,
                feedback: "Manual debug entry",
                responseDetails: [
                    { trigger: "TestWord", response: "Test Sentence", scores: { "Determination": 4 } }
                ]
            }
        });

        console.log("Created ExamResult with ID:", result.id);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
