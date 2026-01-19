"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function () { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function (o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function (o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function (o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function (o) {
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
exports.getKycStatus = exports.submitKyc = exports.updateCreatorVerification = exports.getRecommendedCreators = exports.updateCreatorProfile = exports.getCreatorById = exports.getZoneStats = exports.getCreators = void 0;
const creator_model_1 = __importDefault(require("../models/creator.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const subscription_model_1 = __importStar(require("../models/subscription.model"));
const getCreators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { location, usePreferences, name, lineId, gender, province, country, ageMin, ageMax, heightMin, heightMax, weightMin, weightMax, chestMin, chestMax, waistMin, waistMax, hipsMin, hipsMax } = req.query;
        let query = { isVerified: true };
        // Get users with ACTIVE subscription
        const activeSubs = yield subscription_model_1.default.find({
            status: subscription_model_1.SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).distinct('user');
        // Filter creators by active subscription
        query.user = { $in: activeSubs };
        // Apply Preferences if user is logged in and requested it
        if (usePreferences === 'true' && req.user) {
            const user = yield user_model_1.default.findById(req.user.id);
            if (user && user.preferences) {
                const p = user.preferences;
                if (p.genders && p.genders.length > 0)
                    query.gender = { $in: p.genders };
                if (p.provinces && p.provinces.length > 0)
                    query.province = { $in: p.provinces };
                if (p.ageRange)
                    query.age = { $gte: p.ageRange.min, $lte: p.ageRange.max };
                if (p.heightRange)
                    query.height = { $gte: p.heightRange.min, $lte: p.heightRange.max };
                if (p.weightRange)
                    query.weight = { $gte: p.weightRange.min, $lte: p.weightRange.max };
                if (p.serviceTypes && p.serviceTypes.length > 0)
                    query.services = { $in: p.serviceTypes };
                if (p.serviceTags && p.serviceTags.length > 0)
                    query.interests = { $in: p.serviceTags };
            }
        }
        // Specific Filters (Overwrite preferences if specific search is done? Or refine? Using AND refinement)
        // Let's allow specific filters to be added to the query query object directly.
        // If preferences set gender, and we search for gender, strict match should likely take precedence or intersect.
        // For simplicity, direct query params will overwrite/set the field.
        if (gender)
            query.gender = gender;
        if (country) {
            if (country === 'Thailand') {
                query.$or = [
                    { country: 'Thailand' },
                    { country: { $exists: false } },
                    { country: null }
                ];
            }
            else {
                query.country = country;
            }
        }
        if (province)
            query.province = province;
        if (name)
            query.displayName = { $regex: name, $options: 'i' };
        if (lineId)
            query.lineId = { $regex: lineId, $options: 'i' };
        if (ageMin || ageMax) {
            query.age = Object.assign({}, query.age);
            if (ageMin)
                query.age.$gte = Number(ageMin);
            if (ageMax)
                query.age.$lte = Number(ageMax);
        }
        if (heightMin || heightMax) {
            query.height = Object.assign({}, query.height);
            if (heightMin)
                query.height.$gte = Number(heightMin);
            if (heightMax)
                query.height.$lte = Number(heightMax);
        }
        if (weightMin || weightMax) {
            query.weight = Object.assign({}, query.weight);
            if (weightMin)
                query.weight.$gte = Number(weightMin);
            if (weightMax)
                query.weight.$lte = Number(weightMax);
        }
        if (chestMin || chestMax) {
            query.chest = Object.assign({}, query.chest);
            if (chestMin)
                query.chest.$gte = Number(chestMin);
            if (chestMax)
                query.chest.$lte = Number(chestMax);
        }
        if (waistMin || waistMax) {
            query.waist = Object.assign({}, query.waist);
            if (waistMin)
                query.waist.$gte = Number(waistMin);
            if (waistMax)
                query.waist.$lte = Number(waistMax);
        }
        if (hipsMin || hipsMax) {
            query.hips = Object.assign({}, query.hips);
            if (hipsMin)
                query.hips.$gte = Number(hipsMin);
            if (hipsMax)
                query.hips.$lte = Number(hipsMax);
        }
        if (location) {
            // Refine by location/zone
            const searchFilter = {
                $or: [
                    { location: { $regex: location, $options: 'i' } },
                    { province: { $regex: location, $options: 'i' } },
                    { zones: { $regex: location, $options: 'i' } }
                ]
            };
            if (Object.keys(query).length > 0) {
                // But wait, if query has other fields, we can merge logic.
                // safe way is $and if we are combining complex logic
                // However, query is a simple object so far except for preferences.
                // Let's use $and to be safe
                if (query.$and) {
                    query.$and.push(searchFilter);
                }
                else {
                    query = { $and: [query, searchFilter] };
                }
            }
            else {
                query = searchFilter;
            }
        }
        const creators = yield creator_model_1.default.find(query)
            .populate('user', 'username email avatarUrl')
            .sort({ rankingPriority: -1, isVerified: -1, updatedAt: -1 });
        res.json(creators);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getCreators = getCreators;
const getZoneStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Get User IDs with ACTIVE subscriptions that haven't expired
        const activeSubs = yield subscription_model_1.default.find({
            status: subscription_model_1.SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).distinct('user');
        // 2. Aggregate Creators who match those User IDs
        const stats = yield creator_model_1.default.aggregate([
            {
                $match: {
                    user: { $in: activeSubs },
                    isVerified: true
                }
            },
            {
                $project: {
                    zones: { $ifNull: ["$zones", []] },
                    location: { $ifNull: ["$location", null] },
                    country: { $ifNull: ["$country", "Thailand"] } // Default to Thailand
                }
            },
            {
                $project: {
                    country: 1,
                    tags: {
                        $setUnion: ["$zones", [{ $ifNull: ["$location", ""] }]]
                    }
                }
            },
            { $unwind: "$tags" },
            {
                $match: {
                    tags: { $nin: ["", null] }
                }
            },
            {
                $group: {
                    _id: {
                        country: "$country",
                        name: "$tags"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.country": 1, count: -1 } },
            {
                $project: {
                    _id: 0,
                    country: "$_id.country",
                    name: "$_id.name",
                    count: 1
                }
            }
        ]);
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getZoneStats = getZoneStats;
const getCreatorById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        // 1. Try finding by valid ObjectId (Creator ID)
        let creator = null;
        const mongoose = yield Promise.resolve().then(() => __importStar(require('mongoose')));
        if (mongoose.Types.ObjectId.isValid(id)) {
            creator = yield creator_model_1.default.findById(id).populate('user', 'username email avatarUrl').populate('posts');
            if (!creator) {
                // 2. Try User ID if valid ObjectId
                creator = yield creator_model_1.default.findOne({ user: id }).populate('user', 'username email avatarUrl').populate('posts');
            }
        }
        // 3. Fallback: Search by username (if ID is not ObjectId, or not found yet)
        if (!creator) {
            // Find user by username first
            const User = (yield Promise.resolve().then(() => __importStar(require('../models/user.model')))).default;
            const user = yield User.findOne({ username: id });
            if (user) {
                creator = yield creator_model_1.default.findOne({ user: user._id }).populate('user', 'username email avatarUrl').populate('posts');
            }
        }
        // 4. Fallback: Search by exact displayName matches (if still not found)
        if (!creator) {
            creator = yield creator_model_1.default.findOne({ displayName: id }).populate('user', 'username email avatarUrl').populate('posts');
        }
        if (!creator)
            return res.status(404).json({ message: 'Creator not found' });
        // Fetch active subscription for this creator's user
        let activeSubscription = null;
        if (creator.user) {
            activeSubscription = yield subscription_model_1.default.findOne({
                user: creator.user._id || creator.user, // Handle both populated doc and ID
                status: subscription_model_1.SubscriptionStatus.ACTIVE,
                endDate: { $gt: new Date() }
            }).select('planType status endDate');
        }
        // Fetch reviews for this creator
        // Dynamic import to avoid circular dependency if any, though imports up top are fine
        const Review = (yield Promise.resolve().then(() => __importStar(require('../models/review.model')))).default;
        const reviews = yield Review.find({ creator: creator._id })
            .populate('user', 'username displayName avatarUrl') // Populate info needed for display
            .sort({ createdAt: -1 });
        // Convert to plain object and add subscription & review data
        const creatorData = creator.toObject();
        creatorData.activeSubscription = activeSubscription;
        creatorData.reviews = reviews;
        res.json(creatorData);
    }
    catch (error) {
        console.error("Error in getCreatorById:", error);
        res.status(500).json({ message: error.message });
    }
});
exports.getCreatorById = getCreatorById;
const updateCreatorProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = req.user.id;
        const updates = req.body;
        // Check Subscription if updating images (Gallery)
        if (updates.images && updates.images.length > 0) {
            const activeSubscription = yield subscription_model_1.default.findOne({
                user: userId,
                status: subscription_model_1.SubscriptionStatus.ACTIVE,
                endDate: { $gt: new Date() }
            });
            if (!activeSubscription) {
                return res.status(403).json({
                    error: 'Subscription required to upload gallery images',
                    code: 'SUBSCRIPTION_REQUIRED'
                });
            }
        }
        // Logic check: If updating agency, set status to PENDING
        if (updates.agency) {
            // Check if it's actually a change (optional optimization, but good for logic)
            const currentCreator = yield creator_model_1.default.findOne({ user: userId });
            if (currentCreator && ((_a = currentCreator.agency) === null || _a === void 0 ? void 0 : _a.toString()) !== updates.agency) {
                updates.agencyJoinStatus = 'PENDING';
            }
        }
        else if (updates.agency === "") {
            // Leaving agency
            updates.agency = null;
            updates.agencyJoinStatus = 'NONE';
        }
        const creator = yield creator_model_1.default.findOneAndUpdate({ user: userId }, { $set: updates }, { new: true });
        if (!creator) {
            return res.status(404).json({ message: 'Creator profile not found' });
        }
        res.json(creator);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateCreatorProfile = updateCreatorProfile;
const getRecommendedCreators = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { excludeId } = req.query;
        // 1. Get users with ACTIVE subscription
        const activeSubs = yield subscription_model_1.default.find({
            status: subscription_model_1.SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).distinct('user'); // Get distinct user IDs
        // 2. Build Aggregation
        const pipeline = [
            {
                $match: Object.assign({ user: { $in: activeSubs } }, (excludeId && typeof excludeId === 'string' ? { _id: { $ne: new (yield Promise.resolve().then(() => __importStar(require('mongoose')))).Types.ObjectId(excludeId) } } : {}))
            },
            { $sample: { size: 4 } }
        ];
        const recommended = yield creator_model_1.default.aggregate(pipeline);
        // 3. Populate User Data
        const populatedRecommended = yield creator_model_1.default.populate(recommended, { path: 'user', select: 'avatarUrl' });
        // 4. Attach Active Subscription Object (needed for frontend logic)
        // Since we filtered by activeSubs, we know they have one, but we need the details (planType etc)
        const result = yield Promise.all(populatedRecommended.map((creator) => __awaiter(void 0, void 0, void 0, function* () {
            const sub = yield subscription_model_1.default.findOne({
                user: creator.user._id || creator.user, // Handle populated or not
                status: subscription_model_1.SubscriptionStatus.ACTIVE,
                endDate: { $gt: new Date() }
            }).select('planType status endDate');
            return Object.assign(Object.assign({}, creator), { activeSubscription: sub });
        })));
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getRecommendedCreators = getRecommendedCreators;
const updateCreatorVerification = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const { id } = req.params;
        const { isVerified } = req.body;
        const creator = yield creator_model_1.default.findByIdAndUpdate(id, { isVerified }, { new: true });
        if (!creator)
            return res.status(404).json({ message: 'Creator not found' });
        res.json(creator);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateCreatorVerification = updateCreatorVerification;
const submitKyc = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { photoWithCodeUrl, fullBodyPhotoUrl } = req.body;
        if (!photoWithCodeUrl || !fullBodyPhotoUrl) {
            return res.status(400).json({ message: 'Both photos are required' });
        }
        const creator = yield creator_model_1.default.findOne({ user: userId });
        if (!creator) {
            return res.status(404).json({ message: 'Creator not found' });
        }
        creator.verificationStatus = 'PENDING';
        creator.verificationData = {
            photoWithCodeUrl,
            fullBodyPhotoUrl,
            submittedAt: new Date()
        };
        yield creator.save();
        res.json({ message: 'KYC submitted successfully', verificationStatus: creator.verificationStatus });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.submitKyc = submitKyc;
const getKycStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const creator = yield creator_model_1.default.findOne({ user: userId });
        if (!creator) {
            return res.status(404).json({ message: 'Creator not found' });
        }
        // Generate a stateless verification code based on user ID
        const verificationCode = `PHUSAO-${userId.toString().slice(-6).toUpperCase()}`;
        res.json({
            verificationStatus: creator.verificationStatus,
            verificationData: creator.verificationData,
            verificationCode
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getKycStatus = getKycStatus;
