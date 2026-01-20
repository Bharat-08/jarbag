const express = require('express');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to verify Admin
const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } }); // decoded.id based on generateAccessToken
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: "Forbidden: Admins only" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid Token" });
    }
};

// Upload Links (Accepts array of strings)
router.post('/upload', verifyAdmin, async (req, res) => {
    const { links } = req.body;

    if (!links || !Array.isArray(links) || links.length === 0) {
        return res.status(400).json({ error: "Please provide an array of links" });
    }

    try {
        const createdVideos = await prisma.$transaction(
            links.map(link => prisma.video.create({ data: { url: link } }))
        );
        res.json({ message: "Videos uploaded successfully", count: createdVideos.length });
    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).json({ error: "Failed to upload videos" });
    }
});

// Middleware to verify any authenticated user
const verifyUser = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } }); // decoded.id based on generateAccessToken
        if (!user) {
            return res.status(403).json({ error: "User not found" });
        }
        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid Token" });
    }
};

// View Videos (Candidates)
router.get('/view', verifyUser, async (req, res) => {
    try {
        // Fetch videos ordered by creation
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'desc' } // or 'asc' depending on desired order, usually new first is good, but for "lectures" maybe old first? Let's stick to desc for now as per admin list.
        });

        const isPremium = req.user.isPremium === true; // Ensure boolean
        const role = req.user.role;

        // Admins see all
        if (role === 'ADMIN') {
            return res.json({ videos, accessLevel: 'ADMIN' });
        }

        if (isPremium) {
            return res.json({ videos, accessLevel: 'PREMIUM' });
        } else {
            // Free users get only the first video (latest? or earliest? The requirements said "first video".
            // If we order by 'desc', first is latest. If 'asc', first is oldest.
            // Usually "Lecture 1" is oldest. Let's flip `orderBy` here to 'asc' for candidates if it's a course?
            // "List of videos will appear... first video available" implies sequence.
            // Let's reload videos ordered by ID or createdAt ASC for the view.

            // Re-fetching sorted ASC for better UX if it's a sequence
            const sequenceVideos = await prisma.video.findMany({
                orderBy: { createdAt: 'asc' }
            });

            if (isPremium) {
                return res.json({ videos: sequenceVideos, accessLevel: 'PREMIUM' });
            } else {
                return res.json({ videos: sequenceVideos.slice(0, 1), accessLevel: 'FREE' });
            }
        }
    } catch (err) {
        console.error("View Error:", err);
        res.status(500).json({ error: "Failed to fetch content" });
    }
});

// List Videos (Admin only for now to manage uploads)
router.get('/list', verifyAdmin, async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ videos });
    } catch (err) {
        console.error("List Error:", err);
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

module.exports = router;
