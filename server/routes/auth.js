const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const router = express.Router();
const prisma = new PrismaClient();

// Token config
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

const generateAccessToken = (user) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name, role: user.role }, process.env.JWT_SECRET, {
        expiresIn: ACCESS_TOKEN_EXPIRY,
    });
};

const generateRefreshToken = () => {
    return crypto.randomBytes(40).toString('hex');
};

// Middleware to verify token for protected routes (like upgrade)
const verifyToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Store user ID for the route to use
        next();
    } catch (error) {
        return res.status(403).json({ message: 'Invalid or expired token' });
    }
};

// --- ROUTES ---

// Mock Upgrade Route (Sets isPremium to true)
router.post('/upgrade', verifyToken, async (req, res) => {
    try {
        // Calculate subscription dates (1 Year)
        const startDate = new Date();
        const endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);

        // Update the user's premium status
        const updatedUser = await prisma.user.update({
            where: { id: req.userId },
            data: {
                isPremium: true,
                subscriptionStartDate: startDate,
                subscriptionEndDate: endDate
            }
        });

        // Generate a new access token to reflect the premium status immediately
        const newAccessToken = generateAccessToken(updatedUser);

        res.json({
            success: true,
            message: "Upgraded to Premium successfully!",
            user: {
                id: updatedUser.id,
                email: updatedUser.email,
                name: updatedUser.name,
                role: updatedUser.role,
                isPremium: updatedUser.isPremium
            },
            accessToken: newAccessToken
        });
    } catch (err) {
        console.error("Upgrade failed:", err);
        res.status(500).json({ message: "Failed to upgrade user" });
    }
});

// Signup
router.post('/signup', async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        // Validate Name (No spaces-only, no objects/nonsense heuristics)
        const trimmedName = name.trim();
        if (!trimmedName || trimmedName.length < 2) {
            return res.status(400).json({ message: 'Name must be at least 2 characters long.' });
        }

        // Regex: authentic name validation
        // Allows: Alphabets, spaces, hyphens, apostrophes (e.g. O'Connor, Jean-Luc)
        // Disallows: Numbers, other special characters, multiple spaces in a row
        const nameRegex = /^[a-zA-Z\u00C0-\u00FF' -]+$/;

        if (!nameRegex.test(trimmedName)) {
            return res.status(400).json({ message: 'Name contains invalid characters. Please use a proper name.' });
        }

        if (trimmedName.includes("  ")) {
            return res.status(400).json({ message: 'Name contains improper spacing.' });
        }

        // Check for suspicious "object" names or generic terms (basic blacklist)
        const lowerName = trimmedName.toLowerCase();
        const forbiddenNames = ['admin', 'administrator', 'user', 'test', 'unknown', 'anonymous', 'null', 'undefined', 'object', 'chair', 'table', 'computer'];
        if (forbiddenNames.includes(lowerName)) {
            return res.status(400).json({ message: 'Please use your real name.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Normalize and validate role
        let userRole = 'CANDIDATE';
        if (role && ['CANDIDATE', 'MENTOR', 'ADMIN'].includes(role)) {
            userRole = role;
        }

        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name, role: userRole },
        });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();

        // Store refresh token
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax"
        });

        res.status(201).json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role, isPremium: user.isPremium },
            accessToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {

        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken();

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt
            }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: REFRESH_TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
            sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax"
        });

        res.status(200).json({
            user: { id: user.id, email: user.email, name: user.name, role: user.role, isPremium: user.isPremium },
            accessToken
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Logout
router.post('/logout', async (req, res) => {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
        try {
            await prisma.refreshToken.delete({ where: { token: refreshToken } }).catch(() => { });
        } catch (e) { }
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? "none" : "lax"
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

// Refresh Token
router.post('/refresh', async (req, res) => {
    const { refreshToken } = req.cookies;

    if (!refreshToken) return res.status(401).json({ message: 'No refresh token' });

    try {
        const storedToken = await prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true }
        });

        if (!storedToken) {
            res.clearCookie('refreshToken');
            return res.status(403).json({ message: 'Invalid refresh token' });
        }

        if (storedToken.expiresAt < new Date()) {
            await prisma.refreshToken.delete({ where: { id: storedToken.id } });
            res.clearCookie('refreshToken');
            return res.status(403).json({ message: 'Refresh token expired' });
        }

        const newAccessToken = generateAccessToken(storedToken.user);

        res.json({
            accessToken: newAccessToken,
            user: {
                id: storedToken.user.id,
                email: storedToken.user.email,
                name: storedToken.user.name,
                role: storedToken.user.role,
                isPremium: storedToken.user.isPremium
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Me (Check Auth using Header)
router.get('/me', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({ where: { id: decoded.id } });

        if (!user) return res.status(401).json({ message: 'User not found' });

        res.status(200).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                isPremium: user.isPremium
            }
        });
    } catch (error) {
        return res.status(403).json({ message: 'Invalid token' });
    }
});

module.exports = router;