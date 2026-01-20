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
