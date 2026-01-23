const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const newsRoutes = require('./routes/news');
const mentorRoutes = require('./routes/mentor');
const contentRoutes = require('./routes/content');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://t9wvxspl-5173.inc1.devtunnels.ms"
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Serve uploads if needed
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/tat', require('./routes/tat'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/wat', require('./routes/wat'));
app.use('/api/usage', require('./routes/usage'));

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
