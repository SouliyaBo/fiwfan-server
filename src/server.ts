import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import connectDB from './configs/database';
import authRoutes from './app/routes/auth.routes';
import creatorRoutes from './app/routes/creator.routes';
import userRoutes from './app/routes/user.routes';
import fileRoutes from './app/routes/file';
import agencyRoutes from './app/routes/agency.routes';
import { authenticate } from './app/middleware/auth.middleware';

dotenv.config();

const app = express();

// Connect to Database
connectDB();

app.set('trust proxy', 1);

// ============================================================
// Security Middleware
// ============================================================

// Helmet — adds security HTTP headers
app.use(helmet());

// CORS — whitelist allowed origins
const allowedOrigins = [
    'https://phusao.com',
    'https://www.phusao.com',
    'https://admin.phusao.com',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
].filter(Boolean) as string[];

if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001');
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

// Body parser with size limit
app.use(express.json({ limit: '1mb' }));



// ============================================================
// Rate Limiting
// ============================================================

// Static files (exempt from rate limits)
app.use('/uploads', express.static('public/uploads'));

// Rate Limiting — Auth endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 attempts per window
    message: { error: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate Limiting — General API
const generalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 1000, // 1000 requests per minute
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Apply general rate limiter to all routes
// app.use(generalLimiter);

// ============================================================
// Routes
// ============================================================

// Auth routes — with stricter rate limiting (Temporarily disabled)
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
import planRoutes from './app/routes/plan.routes';
app.use('/plans', planRoutes);
import jobRoutes from './app/routes/job.routes';
app.use('/jobs', jobRoutes);
import adminRoutes from './app/routes/admin.routes';
app.use('/admin', adminRoutes);

// Post Routes
import { createPost } from './app/controllers/post.controller';
app.post('/posts', authenticate, createPost);

// Upload Routes — PROTECTED with authentication
import { upload, handleUpload, handleMultipleUpload } from './app/controllers/upload.controller';
app.post('/upload', authenticate, upload.single('file'), handleUpload);
app.post('/upload/multiple', authenticate, upload.array('images', 10), handleMultipleUpload);

app.get('/', (req, res) => {
    res.send('Fiwfan API (Mongoose Edition) is running!');
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
