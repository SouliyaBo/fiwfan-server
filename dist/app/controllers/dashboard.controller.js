"use strict";
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
exports.getUserDashboardStats = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const review_model_1 = __importDefault(require("../models/review.model"));
const getUserDashboardStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const userId = req.user.id;
        const user = yield user_model_1.default.findById(userId);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        // 1. Profiles Seen (Count unique creators in viewHistory)
        // Using Set to filter unique creator IDs
        const uniqueViews = new Set((_a = user.viewHistory) === null || _a === void 0 ? void 0 : _a.map((v) => v.creator.toString()));
        const profilesSeen = uniqueViews.size;
        // 2. My Favorites (Count favorites array)
        const myFavorites = ((_b = user.favorites) === null || _b === void 0 ? void 0 : _b.length) || 0;
        // 3. My Reviews (Count reviews created by this user)
        const myReviews = yield review_model_1.default.countDocuments({ user: userId });
        res.json({
            profilesSeen,
            myReviews,
            myFavorites
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getUserDashboardStats = getUserDashboardStats;
