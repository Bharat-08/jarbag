const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'No token provided' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id;

        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied. Admin only.' });
        }
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
};

// GET /stats
router.get('/stats', verifyAdmin, async (req, res) => {
    try {
        const studentCount = await prisma.user.count({ where: { role: 'CANDIDATE' } });
        const mentorCount = await prisma.user.count({ where: { role: 'MENTOR' } });
        const examCount = await prisma.examResult.count();
        const subscribedCount = await prisma.user.count({
            where: {
                role: 'CANDIDATE',
                isPremium: true
            }
        });

        res.json({
            students: studentCount,
            mentors: mentorCount,
            exams: examCount,
            subscribed: subscribedCount
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// GET /students
router.get('/students', verifyAdmin, async (req, res) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: 'CANDIDATE' },
            select: {
                id: true,
                name: true,
                email: true,
                isPremium: true,
                subscriptionStartDate: true,
                subscriptionEndDate: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ error: 'Failed to fetch students' });
    }
});

// GET /activities
router.get('/activities', verifyAdmin, async (req, res) => {
    try {
        const activities = await prisma.examResult.findMany({
            include: {
                user: {
                    select: { name: true, email: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
        res.json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        res.status(500).json({ error: 'Failed to fetch activites' });
    }
});

// GET /mentors
router.get('/mentors', verifyAdmin, async (req, res) => {
    try {
        const mentors = await prisma.user.findMany({
            where: { role: 'MENTOR' },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                rank: true,
                yearsOfExperience: true,
                expertise: true,
                rating: true,
                reviewCount: true,
                price: true,
                bio: true,
                documentUrl: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        res.json(mentors);
    } catch (error) {
        console.error("Error fetching mentors:", error);
        res.status(500).json({ error: 'Failed to fetch mentors' });
    }
});

// POST /upload/tat
router.post('/upload/tat', verifyAdmin, async (req, res) => {
    const { url, descriptions } = req.body; // Expecting { url: "...", descriptions: ["theme1", "theme2"] }

    if (!url) {
        return res.status(400).json({ error: 'Image URL is required' });
    }

    try {
        const newImage = await prisma.tATImage.create({
            data: {
                url,
                descriptions: descriptions || []
            }
        });
        res.status(201).json({ message: 'TAT Image uploaded successfully', image: newImage });
    } catch (error) {
        console.error("Error uploading TAT Image:", error);
        res.status(500).json({ error: 'Failed to upload TAT Image' });
    }
});

// POST /upload/wat
router.post('/upload/wat', verifyAdmin, async (req, res) => {
    const { words } = req.body; // Expecting an array of strings ["word1", "word2"]

    if (!words || !Array.isArray(words) || words.length === 0) {
        return res.status(400).json({ error: 'Valid array of words is required' });
    }

    try {
        const createdWords = await prisma.$transaction(
            words.map(word =>
                prisma.wATWord.upsert({
                    where: { word: word.trim() },
                    update: {},
                    create: { word: word.trim() }
                })
            )
        );
        res.status(201).json({ message: `Successfully uploaded ${createdWords.length} words` });
    } catch (error) {
        console.error("Error uploading WAT Words:", error);
        res.status(500).json({ error: 'Failed to upload WAT Words' });
    }
});

// GET /activity/:id
router.get('/activity/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const activity = await prisma.examResult.findUnique({
            where: { id: parseInt(id) },
            include: {
                user: {
                    select: { name: true, email: true }
                }
            }
        });

        if (!activity) {
            return res.status(404).json({ error: 'Activity not found' });
        }

        res.json(activity);
    } catch (error) {
        console.error("Error fetching activity details:", error);
        res.status(500).json({ error: 'Failed to fetch activity details' });
    }
});



// GET /mentor/:id
router.get('/mentor/:id', verifyAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const mentor = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
                rank: true,
                yearsOfExperience: true,
                expertise: true,
                rating: true,
                reviewCount: true,
                price: true,
                bio: true,
                documentUrl: true,
                createdAt: true,
                // Add any other relevant fields, ensuring they exist in schema
                // isApproved is not in schema but user asked for it. 
                // We'll infer status or just omit if not present. 
                // schema has documentUrl, we can use that as proxy for now or just return what we have.
            }
        });

        if (!mentor || mentor.role !== 'MENTOR') {
            return res.status(404).json({ error: 'Mentor not found' });
        }

        res.json(mentor);
    } catch (error) {
        console.error("Error fetching mentor details:", error);
        res.status(500).json({ error: 'Failed to fetch mentor details' });
    }
});

module.exports = router;
