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
exports.deleteStory = exports.getMyStories = exports.getStories = exports.createStory = void 0;
const story_model_1 = __importDefault(require("../models/story.model"));
const creator_model_1 = __importDefault(require("../models/creator.model"));
const helper_1 = require("../files/helper");
const files_1 = require("../files");
const createStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json({ message: 'Unauthorized' });
        // Find creator profile associated with this user
        const creator = yield creator_model_1.default.findOne({ user: user.id });
        if (!creator)
            return res.status(404).json({ message: 'Creator profile not found' });
        const { mediaUrl, mediaType } = req.body;
        if (!mediaUrl)
            return res.status(400).json({ message: 'Media URL is required' });
        // Check Video Permissions (Super Star Only)
        if (mediaType === 'video') {
            if (creator.rankingPriority < 100) {
                return res.status(403).json({
                    message: 'Video upload is restricted to Super Star plan only',
                    code: 'PLAN_RESTRICTED'
                });
            }
        }
        const newStory = new story_model_1.default({
            creator: creator._id,
            mediaUrl,
            mediaType: mediaType || 'image'
        });
        yield newStory.save();
        res.status(201).json(newStory);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createStory = createStory;
const getStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch active stories (expiresAt > now)
        // We can rely on TTL index for deletion, but for fetching let's be explicit
        const stories = yield story_model_1.default.find({ expiresAt: { $gt: new Date() } })
            .populate({
            path: 'creator',
            select: 'displayName user province zones location images',
            populate: {
                path: 'user',
                select: 'username avatarUrl'
            }
        })
            .sort({ createdAt: -1 });
        res.json(stories);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getStories = getStories;
const getMyStories = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const creator = yield creator_model_1.default.findOne({ user: user.id });
        if (!creator)
            return res.status(404).json({ message: 'Creator not found' });
        const stories = yield story_model_1.default.find({ creator: creator._id })
            .sort({ createdAt: -1 });
        res.json(stories);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyStories = getMyStories;
const deleteStory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const user = req.user;
        const creator = yield creator_model_1.default.findOne({ user: user.id });
        const story = yield story_model_1.default.findOne({ _id: id, creator: creator === null || creator === void 0 ? void 0 : creator._id });
        if (!story)
            return res.status(404).json({ message: 'Story not found or unauthorized' });
        if (story.mediaUrl) {
            yield (0, helper_1.deleteS3File)(files_1.BUCKET_NAME, story.mediaUrl);
        }
        yield story.deleteOne();
        res.json({ message: 'Story deleted' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteStory = deleteStory;
