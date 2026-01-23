const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

// Middleware
const extractUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decoded.id;
        } catch (error) {
            console.warn("Token verification failed:", error.message);
        }
    }
    next();
};

router.get('/status', extractUser, async (req, res) => {
    if (!req.userId) {
        // If not logged in, return default limits (assuming they need to login to save results anyway)
        // Or return 0 usage, but frontend usually redirects if not logged in.
        return res.json({
            isPremium: false,
            tatCount: 0,
            watCount: 0,
            limit: 2
        });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { isPremium: true }
        });

        const tatCount = await prisma.examResult.count({
            where: {
                userId: req.userId,
                testType: 'TAT'
            }
        });

        const watCount = await prisma.examResult.count({
            where: {
                userId: req.userId,
                testType: 'WAT'
            }
        });

        res.json({
            isPremium: user?.isPremium || false,
            tatCount,
            watCount,
            limit: 2
        });

    } catch (error) {
        console.error("Usage Check Error:", error);
        res.status(500).json({ error: "Failed to check usage" });
    }
});

// GET /api/usage/history
router.get('/history', extractUser, async (req, res) => {
    if (!req.userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const history = await prisma.examResult.findMany({
            where: { userId: req.userId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                examName: true,
                testType: true,
                score: true,
                total: true,
                percentage: true,
                feedback: true,
                createdAt: true,
                responseDetails: true
            }
        });
        res.json(history);
    } catch (error) {
        console.error("Fetch History Error:", error);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

module.exports = router;
