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
exports.getAllReviews = exports.getMyReviews = exports.getReviewsByCreator = exports.createReview = void 0;
const review_model_1 = __importDefault(require("../models/review.model"));
const creator_model_1 = __importDefault(require("../models/creator.model"));
const createReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { creatorId, rating, accuracyRating, serviceRating, valueRating, title, comment, images } = req.body;
        if (!creatorId) {
            return res.status(400).json({ message: 'Creator ID is required' });
        }
        // Verify creator exists
        const creator = yield creator_model_1.default.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ message: 'Creator not found' });
        }
        // Create Review
        const review = yield review_model_1.default.create({
            user: userId,
            creator: creatorId,
            rating,
            accuracyRating,
            serviceRating,
            valueRating,
            title,
            comment,
            images
        });
        // Optional: Update average rating for Creator (Not implemented yet to keep it simple, but good practice)
        res.status(201).json(review);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createReview = createReview;
const getReviewsByCreator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { creatorId } = req.params;
        const reviews = yield review_model_1.default.find({ creator: creatorId })
            .populate('user', 'displayName avatarUrl')
            .sort({ createdAt: -1 });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getReviewsByCreator = getReviewsByCreator;
const getMyReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const reviews = yield review_model_1.default.find({ user: userId })
            .populate('creator', 'displayName') // Populate creator name
            .sort({ createdAt: -1 });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyReviews = getMyReviews;
const getAllReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield review_model_1.default.find()
            .populate({
            path: 'creator',
            select: 'displayName user isVerified',
            populate: {
                path: 'user',
                select: 'avatarUrl'
            }
        })
            .populate('user', 'username avatarUrl')
            .sort({ createdAt: -1 });
        res.json(reviews);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllReviews = getAllReviews;
