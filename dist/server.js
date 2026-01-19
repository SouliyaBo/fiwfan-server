"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("./configs/database"));
const auth_routes_1 = __importDefault(require("./app/routes/auth.routes"));
const creator_routes_1 = __importDefault(require("./app/routes/creator.routes"));
const user_routes_1 = __importDefault(require("./app/routes/user.routes"));
const file_1 = __importDefault(require("./app/routes/file"));
const agency_routes_1 = __importDefault(require("./app/routes/agency.routes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Connect to Database
(0, database_1.default)();
// Middleware
// Middleware
app.use((0, cors_1.default)({
    origin: true, // Allow any origin
    credentials: true // Allow cookies/headers
}));
app.use(express_1.default.json());
// Routes
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
// Post Routes
const post_controller_1 = require("./app/controllers/post.controller");
const auth_middleware_1 = require("./app/middleware/auth.middleware");
app.post('/posts', auth_middleware_1.authenticate, post_controller_1.createPost);
// Upload Routes
const upload_controller_1 = require("./app/controllers/upload.controller");
app.post('/upload', upload_controller_1.upload.single('file'), upload_controller_1.handleUpload);
app.use('/uploads', express_1.default.static('public/uploads'));
app.get('/', (req, res) => {
    res.send('Fiwfan API (Mongoose Edition) is running!');
});
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
