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
    origin: 'http://localhost:5173',
    credentials: true
}));

// Serve uploads if needed
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/content', contentRoutes);

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
