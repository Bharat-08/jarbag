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
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
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
        // Helper to ensure URLs are embeddable (e.g. convert Vimeo standard to Player)
        const cleanUrl = (url) => {
            if (!url) return url;
            // Clean Vimeo URLs
            if (url.includes('vimeo.com')) {
                // If it's already a player link, leave it
                if (url.includes('player.vimeo.com')) return url;

                const match = url.match(/vimeo\.com\/(\d+)/);
                if (match && match[1]) {
                    return `https://player.vimeo.com/video/${match[1]}`;
                }
                return url.split('?')[0]; // Fallback to stripping query params
            }
            return url;
        };

        const createdVideos = await prisma.$transaction(
            links.map(link => prisma.video.create({ data: { url: cleanUrl(link) } }))
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
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });
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
        // Fetch videos ordered by creation ASC (Oldest first = Module 1, Module 2...)
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'asc' }
        });

        const isPremium = req.user.isPremium === true;
        const role = req.user.role;

        // Admins see all
        if (role === 'ADMIN') {
            return res.json({
                videos: videos.map(v => ({ ...v, locked: false })),
                accessLevel: 'ADMIN'
            });
        }

        if (isPremium) {
            // Premium users: All videos unlocked
            return res.json({
                videos: videos.map(v => ({ ...v, locked: false })),
                accessLevel: 'PREMIUM'
            });
        } else {
            // Free users: First video unlocked, others locked (URL hidden)
            const processedVideos = videos.map((video, index) => {
                if (index === 0) {
                    // First video unlocked
                    return { ...video, locked: false };
                } else {
                    // Subsequent videos locked
                    return { ...video, url: null, locked: true };
                }
            });

            return res.json({ videos: processedVideos, accessLevel: 'FREE' });
        }
    } catch (err) {
        console.error("View Error:", err);
        res.status(500).json({ error: "Failed to fetch content" });
    }
});

// List Videos (Admin only)
router.get('/list', verifyAdmin, async (req, res) => {
    try {
        const videos = await prisma.video.findMany({
            orderBy: { createdAt: 'desc' } // Admins might want to see newest uploads first
        });
        res.json({ videos });
    } catch (err) {
        console.error("List Error:", err);
        res.status(500).json({ error: "Failed to fetch videos" });
    }
});

module.exports = router;