const express = require('express');
const router = express.Router();
const multer = require('multer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const fs = require('fs');

const prisma = new PrismaClient();

// Multer Config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage }).single('document'); // Initialize wrapper

// Nodemailer Config
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: "imohdammar621@gmail.com", // Keeping user provided credential
        pass: "epoyurgbiyqilnvt"
    }
});

// Register Mentor Encpoint
router.post('/register', upload, async (req, res) => {
    try {
        const { name, email, expertise } = req.body;
        const file = req.file;

        if (!name || !email || !expertise || !file) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const tempPassword = "Temp@1234";
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create User
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: 'MENTOR',
                expertise,
                documentUrl: file.path
            }
        });

        // Send Email
        await transporter.sendMail({
            from: "imohdammar621@gmail.com",
            to: email,
            subject: "Welcome to Team Platform - Mentor Verification",
            text:
                `Hello ${name},\n\n` +
                `Thank you for joining us as a Mentor in the field of ${expertise}.\n` +
                `Your documents have been received and verified.\n\n` +
                `Here are your login details:\n` +
                `Email: ${email}\n` +
                `Temporary Password: ${tempPassword}\n\n` +
                `Please change your password after your first login.\n\n` +
                `Regards,\nTeam Platform`
        });

        res.status(201).json({ success: true, message: "Mentor registered successfully. Credentials sent to email." });

    } catch (error) {
        console.error("Mentor Registration Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
});

// List Mentors (Public or Candidate)
router.get('/list', async (req, res) => {
    try {
        const mentors = await prisma.user.findMany({
            where: { role: 'MENTOR' },
            select: {
                id: true,
                name: true,
                email: true,
                expertise: true,
                rank: true,
                yearsOfExperience: true,
                rating: true,
                reviewCount: true,
                price: true,
                bio: true,
                profileImage: true
            }
        });
        res.json({ mentors });
    } catch (error) {
        console.error("Fetch Mentors Error:", error);
        res.status(500).json({ message: "Failed to fetch mentors" });
    }
});

module.exports = router;
