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
exports.updateUserStatus = exports.getUsers = exports.updatePreferences = exports.getMyFavorites = exports.getHistory = exports.recordView = exports.toggleFavorite = exports.updateProfile = exports.getProfile = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const creator_model_1 = __importDefault(require("../models/creator.model"));
const getProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield user_model_1.default.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getProfile = getProfile;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const updates = req.body;
        // Prevent updating sensitive fields
        delete updates.password;
        delete updates.role;
        delete updates.email; // Usually email changes require verification
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { $set: updates }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateProfile = updateProfile;
const toggleFavorite = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        const userId = req.user.id;
        const { creatorId } = req.body;
        const user = yield user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const isFavorited = (_a = user.favorites) === null || _a === void 0 ? void 0 : _a.includes(creatorId);
        if (isFavorited) {
            user.favorites = (_b = user.favorites) === null || _b === void 0 ? void 0 : _b.filter((id) => id.toString() !== creatorId);
        }
        else {
            (_c = user.favorites) === null || _c === void 0 ? void 0 : _c.push(creatorId);
        }
        yield user.save();
        res.json({ success: true, isFavorited: !isFavorited });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.toggleFavorite = toggleFavorite;
const recordView = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = req.user.id;
        const { creatorId } = req.body;
        const user = yield user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Check if already viewed
        const hasViewed = (_a = user.viewHistory) === null || _a === void 0 ? void 0 : _a.some((view) => view.creator.toString() === creatorId);
        if (hasViewed) {
            return res.json({ success: true, message: 'Already viewed' });
        }
        (_b = user.viewHistory) === null || _b === void 0 ? void 0 : _b.push({ creator: creatorId, viewedAt: new Date() });
        yield user.save();
        // Increment creator view count
        yield creator_model_1.default.findByIdAndUpdate(creatorId, { $inc: { views: 1 } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.recordView = recordView;
const getHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user.id;
        const user = yield user_model_1.default.findById(userId).populate({
            path: 'viewHistory.creator',
            select: 'displayName images user',
            populate: { path: 'user', select: 'avatarUrl' }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // Sort by most recent
        const history = (_a = user.viewHistory) === null || _a === void 0 ? void 0 : _a.sort((a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime());
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getHistory = getHistory;
const getMyFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const user = yield user_model_1.default.findById(userId).populate({
            path: 'favorites',
            select: 'displayName images user',
            populate: { path: 'user', select: 'avatarUrl' }
        });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user.favorites);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyFavorites = getMyFavorites;
const updatePreferences = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;
        const user = yield user_model_1.default.findByIdAndUpdate(userId, { $set: { preferences } }, { new: true }).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updatePreferences = updatePreferences;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { search, role, page = 1, limit = 20 } = req.query;
        let query = {};
        if (search) {
            query.$or = [
                { username: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { displayName: { $regex: search, $options: 'i' } },
                { lineId: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            query.role = role;
        }
        const users = yield user_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));
        const total = yield user_model_1.default.countDocuments(query);
        // Populate Creator info for users with role 'CREATOR'
        const usersWithCreatorInfo = yield Promise.all(users.map((u) => __awaiter(void 0, void 0, void 0, function* () {
            const userObj = u.toObject();
            if (u.role === 'CREATOR') {
                const Creator = (yield Promise.resolve().then(() => __importStar(require('../models/creator.model')))).default;
                const creator = yield Creator.findOne({ user: u._id }).select('isVerified _id');
                if (creator) {
                    userObj.creatorProfile = creator;
                }
            }
            return userObj;
        })));
        res.json({
            users: usersWithCreatorInfo,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUsers = getUsers;
const updateUserStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const { isActive } = req.body;
        const user = yield user_model_1.default.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateUserStatus = updateUserStatus;
