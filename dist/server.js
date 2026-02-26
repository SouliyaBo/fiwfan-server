"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = __importDefault(require("./configs/database"));
const auth_routes_1 = __importDefault(require("./app/routes/auth.routes"));
const creator_routes_1 = __importDefault(require("./app/routes/creator.routes"));
const user_routes_1 = __importDefault(require("./app/routes/user.routes"));
const file_1 = __importDefault(require("./app/routes/file"));
const agency_routes_1 = __importDefault(require("./app/routes/agency.routes"));
const auth_middleware_1 = require("./app/middleware/auth.middleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect to Database
(0, database_1.default)();
app.set('trust proxy', 1);
// ============================================================
// Security Middleware
// ============================================================
// Helmet — adds security HTTP headers
app.use((0, helmet_1.default)());
// CORS — whitelist allowed origins
const allowedOrigins = [
    'https://phusao.com',
    'https://www.phusao.com',
    'https://admin.phusao.com',
    process.env.FRONTEND_URL,
    process.env.ADMIN_URL,
].filter(Boolean);
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push('http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001');
}
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
// Body parser with size limit
app.use(express_1.default.json({ limit: '1mb' }));
// ============================================================
// Rate Limiting
// ============================================================
// Static files (exempt from rate limits)
app.use('/uploads', express_1.default.static('public/uploads'));
// Rate Limiting — Auth endpoints
const authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // 15 attempts per window
    message: { error: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});
// Rate Limiting — General API
const generalLimiter = (0, express_rate_limit_1.default)({
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
app.use('/auth', auth_routes_1.default);
app.use('/creators', creator_routes_1.default);
app.use('/users', user_routes_1.default);
app.use('/files', file_1.default);
app.use('/agencies', agency_routes_1.default);
const payment_routes_1 = __importDefault(require("./app/routes/payment.routes"));
app.use('/payments', payment_routes_1.default);
const setting_routes_1 = __importDefault(require("./app/routes/setting.routes"));
app.use('/settings', setting_routes_1.default);
const review_routes_1 = __importDefault(require("./app/routes/review.routes"));
app.use('/reviews', review_routes_1.default);
const story_routes_1 = __importDefault(require("./app/routes/story.routes"));
app.use('/stories', story_routes_1.default);
const report_routes_1 = __importDefault(require("./app/routes/report.routes"));
app.use('/reports', report_routes_1.default);
const plan_routes_1 = __importDefault(require("./app/routes/plan.routes"));
app.use('/plans', plan_routes_1.default);
const job_routes_1 = __importDefault(require("./app/routes/job.routes"));
app.use('/jobs', job_routes_1.default);
const admin_routes_1 = __importDefault(require("./app/routes/admin.routes"));
app.use('/admin', admin_routes_1.default);
// Post Routes
const post_controller_1 = require("./app/controllers/post.controller");
app.post('/posts', auth_middleware_1.authenticate, post_controller_1.createPost);
// Upload Routes — PROTECTED with authentication
const upload_controller_1 = require("./app/controllers/upload.controller");
app.post('/upload', auth_middleware_1.authenticate, upload_controller_1.upload.single('file'), upload_controller_1.handleUpload);
app.post('/upload/multiple', auth_middleware_1.authenticate, upload_controller_1.upload.array('images', 10), upload_controller_1.handleMultipleUpload);
app.get('/', (req, res) => {
    res.send('Fiwfan API (Mongoose Edition) is running!');
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
