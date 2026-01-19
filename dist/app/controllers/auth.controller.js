"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.telegramResetPasswordRequest = exports.completeTelegramRegistration = exports.telegramLogin = exports.login = exports.register = exports.resetPassword = exports.forgotPassword = void 0;
const user_model_1 = __importStar(require("../models/user.model"));
const creator_model_1 = __importDefault(require("../models/creator.model"));
const agency_model_1 = __importDefault(require("../models/agency.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = __importDefault(require("crypto"));
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Generate token
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        const resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = new Date(resetPasswordExpires); // Use Date object
        yield user.save();
        // In a real app, send email here.
        // For this demo/dev, return the token so frontend can use it.
        // Construct the reset URL (frontend route)
        const resetUrl = `http://localhost:3000/auth?mode=reset&token=${resetToken}`;
        res.status(200).json({
            success: true,
            data: "Email sent (simulated)",
            browsingUrl: resetUrl // Frontend needs the RAW token, not the hashed one
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.forgotPassword = forgotPassword;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const resetPasswordToken = crypto_1.default.createHash('sha256').update(req.params.resetToken).digest('hex');
        const user = yield user_model_1.default.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select("+resetPasswordToken +resetPasswordExpires +password"); // Select hidden fields
        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }
        // Set new password
        user.password = yield bcrypt_1.default.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(200).json({
            success: true,
            token,
            user
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.resetPassword = resetPassword;
const register = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, role, username, creatorType } = req.body;
        const existingUser = yield user_model_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        let finalRole = role || user_model_1.Role.USER;
        // If user selected "CREATOR" (Provider) + "AGENCY" sub-type
        if (role === user_model_1.Role.CREATOR && creatorType === 'AGENCY') {
            finalRole = user_model_1.Role.AGENCY;
        }
        const newUser = new user_model_1.default({
            email,
            password: hashedPassword,
            username: username || email.split('@')[0],
            role: finalRole,
            isCreator: finalRole === user_model_1.Role.CREATOR // Only true models are 'isCreator'
        });
        yield newUser.save();
        if (finalRole === user_model_1.Role.CREATOR) {
            const newCreator = new creator_model_1.default({
                user: newUser._id,
                displayName: newUser.username
            });
            yield newCreator.save();
        }
        else if (finalRole === user_model_1.Role.AGENCY) {
            // Create default agency profile for the owner
            const newAgency = new agency_model_1.default({
                name: (newUser.username || "My") + " Agency",
                owner: newUser._id,
                description: "Agency description...",
                location: "Bangkok"
            });
            yield newAgency.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser._id, username: newUser.username, role: newUser.role }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.register = register;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { email, username, password } = req.body;
        const identifier = email || username;
        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide email/username and password' });
        }
        const user = yield user_model_1.default.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });
        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const isMatch = yield bcrypt_1.default.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch)
            return res.status(401).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                avatarUrl: user.avatarUrl,
                displayName: user.displayName,
                email: user.email,
                province: user.province
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.login = login;
const telegramLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, first_name, username, photo_url, auth_date, hash } = req.body;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return res.status(500).json({ message: 'Server configuration error: TELEGRAM_BOT_TOKEN missing' });
        }
        // 1. Verify Hash
        // Create data check string by sorting all keys alphabetically (except hash)
        const dataCheckArr = Object.keys(req.body)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => `${key}=${req.body[key]}`);
        const dataCheckString = dataCheckArr.join('\n');
        const secretKey = crypto_1.default.createHash('sha256').update(botToken).digest();
        const hmac = crypto_1.default.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        // Debugging logs (careful not to expose sensitive info in prod logs if possible, or temporary)
        console.log("Received Hash:", hash);
        console.log("Calculated HMAC:", hmac);
        console.log("Data String:", dataCheckString);
        if (process.env.NODE_ENV === 'development' && hash === 'mock_hash_for_dev') {
            // Bypass for testing
        }
        else if (hmac !== hash) {
            return res.status(401).json({ message: 'Invalid Telegram authentication' });
        }
        // 2. Check stale data (optional but recommended) - prohibit login if auth_date is older than 24h
        const now = Math.floor(Date.now() / 1000);
        if (now - auth_date > 86400) {
            return res.status(401).json({ message: 'Authentication data is outdated' });
        }
        // 3. Find User
        let user = yield user_model_1.default.findOne({ telegramId: id.toString() });
        if (!user) {
            // New Flow: Return "User not found" so frontend can show Role Selection
            // We return the payload back so frontend can use it to register
            return res.status(202).json({
                isNewUser: true,
                telegramData: req.body
            });
        }
        // Update info for existing user
        if (user.telegramUsername !== username || user.telegramPhotoUrl !== photo_url) {
            user.telegramUsername = username;
            user.telegramPhotoUrl = photo_url;
            yield user.save();
        }
        // 4. Generate Token
        const token = jsonwebtoken_1.default.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                avatarUrl: user.avatarUrl || user.telegramPhotoUrl,
                displayName: user.displayName,
                email: user.email
            }
        });
    }
    catch (error) {
        console.error("Telegram Login Error:", error);
        res.status(500).json({ message: error.message });
    }
});
exports.telegramLogin = telegramLogin;
const completeTelegramRegistration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { telegramData, role, creatorType } = req.body;
        const { id, first_name, username, photo_url, hash } = telegramData;
        // Re-Verify Hash (Security best practice: verify again before creating account)
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken)
            return res.status(500).json({ message: 'Server configuration error' });
        // Create data check string by sorting all keys alphabetically (except hash)
        const dataCheckArr = Object.keys(telegramData)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => `${key}=${telegramData[key]}`);
        const dataCheckString = dataCheckArr.join('\n');
        const secretKey = crypto_1.default.createHash('sha256').update(botToken).digest();
        const hmac = crypto_1.default.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        if (process.env.NODE_ENV === 'development' && hash === 'mock_hash_for_dev') {
            // Bypass
        }
        else if (hmac !== hash) {
            return res.status(401).json({ message: 'Invalid Telegram authentication' });
        }
        // Check if user exists again
        let existingUser = yield user_model_1.default.findOne({ telegramId: id.toString() });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        let finalRole = role || user_model_1.Role.USER;
        if (role === user_model_1.Role.CREATOR && creatorType === 'AGENCY') {
            finalRole = user_model_1.Role.AGENCY;
        }
        const newUser = new user_model_1.default({
            telegramId: id.toString(),
            telegramUsername: username,
            telegramPhotoUrl: photo_url,
            displayName: first_name,
            username: username || `user_${id}`,
            role: finalRole,
            email: `${id}@telegram.user`, // Temporary email
            isCreator: finalRole === user_model_1.Role.CREATOR || finalRole === user_model_1.Role.AGENCY
        });
        yield newUser.save();
        if (finalRole === user_model_1.Role.CREATOR) {
            const newCreator = new creator_model_1.default({
                user: newUser._id,
                displayName: newUser.username
            });
            yield newCreator.save();
        }
        else if (finalRole === user_model_1.Role.AGENCY) {
            const newAgency = new agency_model_1.default({
                name: (newUser.username || "My") + " Agency",
                owner: newUser._id,
                description: "Agency description...",
                location: "Bangkok"
            });
            yield newAgency.save();
        }
        const token = jsonwebtoken_1.default.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });
        res.status(201).json({
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                role: newUser.role,
                avatarUrl: newUser.telegramPhotoUrl,
                displayName: newUser.displayName,
                email: newUser.email
            }
        });
    }
    catch (error) {
        console.error("Telegram Register Error:", error);
        res.status(500).json({ message: error.message });
    }
});
exports.completeTelegramRegistration = completeTelegramRegistration;
const telegramResetPasswordRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, first_name, username, photo_url, auth_date, hash } = req.body;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            return res.status(500).json({ message: 'Server configuration error: TELEGRAM_BOT_TOKEN missing' });
        }
        // 1. Verify Hash
        const dataCheckArr = Object.keys(req.body)
            .filter(key => key !== 'hash')
            .sort()
            .map(key => `${key}=${req.body[key]}`);
        const dataCheckString = dataCheckArr.join('\n');
        const secretKey = crypto_1.default.createHash('sha256').update(botToken).digest();
        const hmac = crypto_1.default.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
        if (process.env.NODE_ENV === 'development' && hash === 'mock_hash_for_dev') {
            // Bypass
        }
        else if (hmac !== hash) {
            return res.status(401).json({ message: 'Invalid Telegram authentication' });
        }
        // 2. Check stale data
        const now = Math.floor(Date.now() / 1000);
        if (now - auth_date > 86400) {
            return res.status(401).json({ message: 'Authentication data is outdated' });
        }
        // 3. Find User by Telegram ID
        const user = yield user_model_1.default.findOne({ telegramId: id.toString() });
        if (!user) {
            return res.status(404).json({ message: 'ไม่พบบัญชีที่เชื่อมต่อกับ Telegram นี้' });
        }
        // 4. Generate Reset Token (Reuse existing logic)
        const resetToken = crypto_1.default.randomBytes(20).toString('hex');
        const resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = new Date(resetPasswordExpires);
        yield user.save();
        // Return the RAW reset token so frontend can use it immediately
        res.status(200).json({
            success: true,
            resetToken: resetToken
        });
    }
    catch (error) {
        console.error("Telegram Reset Request Error:", error);
        res.status(500).json({ message: error.message });
    }
});
exports.telegramResetPasswordRequest = telegramResetPasswordRequest;
