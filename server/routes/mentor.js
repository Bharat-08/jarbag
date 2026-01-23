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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

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
                profileImage: true,
                mentorshipSlots: {
                    where: {
                        isBooked: false,
                        date: {
                            gte: today
                        }
                    },
                    select: {
                        id: true
                    }
                }
            }
        });

        // Transform to add hasSlots flag and remove the raw slots array to keep response light
        const mentorsWithAvailability = mentors.map(mentor => ({
            ...mentor,
            hasSlots: mentor.mentorshipSlots.length > 0,
            mentorshipSlots: undefined // Remove the array from the final response
        }));

        res.json({ mentors: mentorsWithAvailability });
    } catch (error) {
        console.error("Fetch Mentors Error:", error);
        res.status(500).json({ message: "Failed to fetch mentors" });
    }
});

// --- MENTORSHIP SLOTS ---

// Create Slot (Mentor Only)
router.post('/slots', async (req, res) => {
    try {
        const { mentorId, date, startTime, endTime, duration, price } = req.body;
        // In a real app, verify req.mentorId matches authenticated user or use middleware

        const slot = await prisma.mentorshipSlot.create({
            data: {
                mentorId: parseInt(mentorId),
                date: new Date(date),
                startTime,
                endTime,
                duration: parseInt(duration),
                price: parseInt(price)
            }
        });
        res.status(201).json({ success: true, slot });
    } catch (error) {
        console.error("Create Slot Error:", error);
        res.status(500).json({ message: "Failed to create slot" });
    }
});

// Get Slots for a Mentor
router.get('/slots/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const slots = await prisma.mentorshipSlot.findMany({
            where: { mentorId: parseInt(mentorId) },
            orderBy: { date: 'asc' }
        });
        res.json({ slots });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch slots" });
    }
});

// Delete Slot
router.delete('/slots/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.mentorshipSlot.delete({
            where: { id: parseInt(id) }
        });
        res.json({ success: true, message: "Slot deleted" });
    } catch (error) {
        console.error("Delete Slot Error:", error);
        res.status(500).json({ message: "Failed to delete slot" });
    }
});

// --- COURSES ---

// Create Course (Mentor Only)
router.post('/courses', async (req, res) => {
    try {
        const { mentorId, title, description, videoUrl, price } = req.body;

        const course = await prisma.course.create({
            data: {
                mentorId: parseInt(mentorId),
                title,
                description,
                videoUrl,
                price: parseInt(price)
            }
        });
        res.status(201).json({ success: true, course });
    } catch (error) {
        console.error("Create Course Error:", error);
        res.status(500).json({ message: "Failed to upload course" });
    }
});

// Get Courses for a Mentor
router.get('/courses/:mentorId', async (req, res) => {
    try {
        const { mentorId } = req.params;
        const courses = await prisma.course.findMany({
            where: { mentorId: parseInt(mentorId) },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ courses });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch courses" });
    }
});

// Get Single Mentor Profile
router.get('/profile/:id', async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`[DEBUG] Fetching profile for ID: ${id} (Type: ${typeof id})`);

        const mentor = await prisma.user.findUnique({
            where: { id: parseInt(id) },
            select: {
                id: true,
                name: true,
                // email: false, // Hide Email for privacy
                expertise: true,
                rank: true,
                yearsOfExperience: true,
                rating: true,
                reviewCount: true,
                price: true,
                bio: true,
                profileImage: true,
                role: true // Make sure we select role to check it!
            }
        });
        console.log(`[DEBUG] Found mentor:`, mentor);

        if (!mentor || mentor.role !== 'MENTOR') {
            console.log(`[DEBUG] Mentor check failed. Role: ${mentor?.role}`);
            return res.status(404).json({ message: "Mentor not found" });
        }

        res.json({ mentor });
    } catch (error) {
        console.error("Fetch Mentor Profile Error:", error);
        res.status(500).json({ message: "Failed to fetch mentor profile" });
    }
});

module.exports = router;
