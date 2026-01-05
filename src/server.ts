import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './configs/database';
import authRoutes from './app/routes/auth.routes';
import creatorRoutes from './app/routes/creator.routes';
import userRoutes from './app/routes/user.routes';
import fileRoutes from './app/routes/file';
import agencyRoutes from './app/routes/agency.routes';

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
// Middleware
app.use(cors({
    origin: true, // Allow any origin
    credentials: true // Allow cookies/headers
}));
app.use(express.json());

// Routes
app.use('/auth', authRoutes);
app.use('/creators', creatorRoutes);
app.use('/users', userRoutes);
app.use('/files', fileRoutes);
app.use('/agencies', agencyRoutes);
import paymentRoutes from './app/routes/payment.routes';
app.use('/payments', paymentRoutes);
import settingRoutes from './app/routes/setting.routes';
app.use('/settings', settingRoutes);
import reviewRoutes from './app/routes/review.routes';
app.use('/reviews', reviewRoutes);
import storyRoutes from './app/routes/story.routes';
app.use('/stories', storyRoutes);
import reportRoutes from './app/routes/report.routes';
app.use('/reports', reportRoutes);

// Post Routes
import { createPost } from './app/controllers/post.controller';
import { authenticate } from './app/middleware/auth.middleware';
app.post('/posts', authenticate, createPost);

// Upload Routes
import { upload, handleUpload } from './app/controllers/upload.controller';
app.post('/upload', upload.single('file'), handleUpload);
app.use('/uploads', express.static('public/uploads'));

app.get('/', (req, res) => {
    res.send('Fiwfan API (Mongoose Edition) is running!');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
