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
exports.rejectAgency = exports.getPendingAgencies = exports.verifyAgency = exports.submitKYC = exports.rejectCreator = exports.approveCreator = exports.updateAgencyProfile = exports.getMyAgency = exports.createAgency = exports.getAgencyById = exports.getAgencies = void 0;
const agency_model_1 = __importDefault(require("../models/agency.model"));
const creator_model_1 = __importDefault(require("../models/creator.model"));
const getAgencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch agencies and populate a few creators for preview
        const agencies = yield agency_model_1.default.find()
            .populate({
            path: 'creators',
            match: { agencyJoinStatus: 'APPROVED' }, // Only show approved creators in public list
            select: 'displayName images user country zones isVerified isHot isAcceptingWork age',
            perDocumentLimit: 5,
            populate: {
                path: 'user',
                select: 'displayName avatarUrl'
            }
        })
            .lean();
        // Enrich creators with Plan Name and Review Count
        const Subscription = (yield Promise.resolve().then(() => __importStar(require('../models/subscription.model')))).default;
        const Review = (yield Promise.resolve().then(() => __importStar(require('../models/review.model')))).default;
        const Setting = (yield Promise.resolve().then(() => __importStar(require('../models/setting.model')))).default;
        // Check Free Mode
        const freeModeSetting = yield Setting.findOne({ key: 'isFreeMode' });
        const isFreeMode = (freeModeSetting === null || freeModeSetting === void 0 ? void 0 : freeModeSetting.value) === 'true';
        // Collect all creators to fetch related data in bulk
        const allCreators = agencies.flatMap(a => a.creators || []);
        const creatorUserIds = allCreators
            .map(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a._id) || c.user; })
            .filter(id => id);
        const creatorIds = allCreators.map(c => c._id);
        if (creatorUserIds.length > 0) {
            const subscriptions = yield Subscription.find({
                user: { $in: creatorUserIds },
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            });
            const reviewCounts = yield Review.aggregate([
                { $match: { creator: { $in: creatorIds } } },
                { $group: { _id: "$creator", count: { $sum: 1 } } }
            ]);
            // Map data back to agencies
            agencies.forEach(agency => {
                if (agency.creators) {
                    agency.creators = agency.creators.map((c) => {
                        var _a, _b;
                        const userId = (_b = (((_a = c.user) === null || _a === void 0 ? void 0 : _a._id) || c.user)) === null || _b === void 0 ? void 0 : _b.toString();
                        const sub = subscriptions.find(s => s.user.toString() === userId);
                        const planName = isFreeMode ? ((sub === null || sub === void 0 ? void 0 : sub.planType) || "Free Mode") : ((sub === null || sub === void 0 ? void 0 : sub.planType) || "");
                        const reviewCountObj = reviewCounts.find(r => r._id.toString() === c._id.toString());
                        const reviewCount = reviewCountObj ? reviewCountObj.count : 0;
                        return Object.assign(Object.assign({}, c), { planName, planId: planName, reviewCount });
                    });
                }
            });
        }
        res.json(agencies);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAgencies = getAgencies;
const getAgencyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agency = yield agency_model_1.default.findById(req.params.id).populate({
            path: 'creators',
            match: { agencyJoinStatus: 'APPROVED' }, // Only show approved creators
            populate: {
                path: 'user',
                select: 'displayName avatarUrl'
            }
        }).lean();
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        // Enrich creators with Plan Name (similar to getCreators)
        const Subscription = (yield Promise.resolve().then(() => __importStar(require('../models/subscription.model')))).default;
        const Setting = (yield Promise.resolve().then(() => __importStar(require('../models/setting.model')))).default; // Import Setting model
        // Check Free Mode
        const freeModeSetting = yield Setting.findOne({ key: 'isFreeMode' });
        const isFreeMode = (freeModeSetting === null || freeModeSetting === void 0 ? void 0 : freeModeSetting.value) === 'true';
        if (agency.creators && agency.creators.length > 0) {
            const creators = agency.creators;
            // Handle both populated user object and raw ID cases safe for lean
            const creatorUserIds = creators
                .map(c => { var _a; return ((_a = c.user) === null || _a === void 0 ? void 0 : _a._id) || c.user; })
                .filter(id => id); // Filter out nulls/undefined
            const subscriptions = yield Subscription.find({
                user: { $in: creatorUserIds },
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            });
            // Aggregate Review Counts
            const Review = (yield Promise.resolve().then(() => __importStar(require('../models/review.model')))).default;
            const creatorIds = creators.map(c => c._id);
            const reviewCounts = yield Review.aggregate([
                { $match: { creator: { $in: creatorIds } } },
                { $group: { _id: "$creator", count: { $sum: 1 } } }
            ]);
            // Map creators to include planName and reviewCount
            agency.creators = creators.map(c => {
                var _a, _b;
                const userId = (_b = (((_a = c.user) === null || _a === void 0 ? void 0 : _a._id) || c.user)) === null || _b === void 0 ? void 0 : _b.toString();
                const sub = subscriptions.find(s => s.user.toString() === userId);
                const planName = isFreeMode ? ((sub === null || sub === void 0 ? void 0 : sub.planType) || "Free Mode") : ((sub === null || sub === void 0 ? void 0 : sub.planType) || "");
                const reviewCountObj = reviewCounts.find(r => r._id.toString() === c._id.toString());
                const reviewCount = reviewCountObj ? reviewCountObj.count : 0;
                return Object.assign(Object.assign({}, c), { planName, planId: planName, // Add planId for compatibility
                    reviewCount });
            });
        }
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAgencyById = getAgencyById;
const createAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, description, logoUrl, owner } = req.body;
        // In real app, check permissions or get owner from auth
        const newAgency = yield agency_model_1.default.create({
            name,
            location,
            description,
            logoUrl,
            owner // Optional: Assign to a user
        });
        res.status(201).json(newAgency);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createAgency = createAgency;
const getMyAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Find agency owned by this user
        // For owner view, we want ALL creators (PENDING and APPROVED)
        const agency = yield agency_model_1.default.findOne({ owner: userId }).populate('creators');
        if (!agency) {
            return res.status(404).json({ message: 'Agency profile not found' });
        }
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyAgency = getMyAgency;
const updateAgencyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const agency = yield agency_model_1.default.findOneAndUpdate({ owner: userId }, { $set: updates }, { new: true });
        if (!agency) {
            return res.status(404).json({ message: 'Agency profile not found' });
        }
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateAgencyProfile = updateAgencyProfile;
// --- APPROVAL FLOW ---
const approveCreator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { creatorId } = req.params;
        // Verify agency ownership AND KYC STATUS
        const agency = yield agency_model_1.default.findOne({ owner: userId });
        if (!agency)
            return res.status(403).json({ message: 'Not authorized' });
        if (!agency.isVerified) {
            return res.status(403).json({ message: 'Agency is not verified. Please submit KYC first.' });
        }
        const creator = yield creator_model_1.default.findOneAndUpdate({ _id: creatorId, agency: agency._id }, { $set: { agencyJoinStatus: 'APPROVED' } }, { new: true });
        if (!creator)
            return res.status(404).json({ message: 'Creator request not found' });
        res.json(creator);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.approveCreator = approveCreator;
const rejectCreator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { creatorId } = req.params;
        // Verify agency ownership
        const agency = yield agency_model_1.default.findOne({ owner: userId });
        if (!agency)
            return res.status(403).json({ message: 'Not authorized' });
        const creator = yield creator_model_1.default.findOneAndUpdate({ _id: creatorId, agency: agency._id }, {
            $set: { agencyJoinStatus: 'NONE' },
            $unset: { agency: "" } // Remove agency link
        }, { new: true });
        if (!creator)
            return res.status(404).json({ message: 'Creator request not found' });
        res.json(creator);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.rejectCreator = rejectCreator;
// --- KYC / ADMIN FLOW ---
const submitKYC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const agency = yield agency_model_1.default.findOneAndUpdate({ owner: userId }, { $set: { kycStatus: 'PENDING' } }, { new: true });
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.submitKYC = submitKYC;
const verifyAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assume Middleware checks for ADMIN role
        const { id } = req.params;
        const agency = yield agency_model_1.default.findByIdAndUpdate(id, {
            $set: {
                isVerified: true,
                kycStatus: 'APPROVED'
            }
        }, { new: true });
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.verifyAgency = verifyAgency;
const getPendingAgencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Admin only - list all pending KYC
        const agencies = yield agency_model_1.default.find({ kycStatus: 'PENDING' });
        res.json(agencies);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPendingAgencies = getPendingAgencies;
const rejectAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }
        const agency = yield agency_model_1.default.findByIdAndUpdate(id, {
            $set: {
                isVerified: false,
                kycStatus: 'REJECTED',
                rejectionReason: reason
            }
        }, { new: true });
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.rejectAgency = rejectAgency;
