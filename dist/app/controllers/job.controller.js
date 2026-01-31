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
exports.deleteJob = exports.updateJob = exports.getMyJobs = exports.getJobs = exports.createJob = void 0;
const job_model_1 = __importStar(require("../models/job.model"));
const subscription_model_1 = __importStar(require("../models/subscription.model"));
const plan_model_1 = __importDefault(require("../models/plan.model"));
const createJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { content, budget, location, lineId, whatsapp, images, planId } = req.body;
        // 1. Check if user has active subscription for this plan (Or create a pending one flow?)
        // The implementation plan says: "User creates a post -> selects Plan -> Pays -> Post goes live."
        // We can either:
        // A) Create Job in PENDING status, then Pay.
        // B) Pay first (get Subscription), then Create Job (using Credits).
        // Let's go with B (Conceptually simpler for existing Subscription model):
        // User buys "Tourist Plan". Once Active, they can post.
        // BUT wait, a Tourist Plan is "One Night Post". It allows ONE post for 24 hours.
        // So we need to link the Job to the Subscription.
        const activeSub = yield subscription_model_1.default.findOne({
            user: userId,
            planType: planId, // Verify they have THIS plan
            status: subscription_model_1.SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).sort({ endDate: -1 });
        if (!activeSub) {
            return res.status(403).json({
                message: 'You need an active subscription to post. Please purchase a plan first.',
                code: 'SUBSCRIPTION_REQUIRED'
            });
        }
        // Check if this subscription is already used? 
        // If it's "One Night Stand", it creates 1 Job. 
        // We can check if a Job already exists overlapping with this subscription time?
        // Or store subscriptionId in Job?
        // Let's assume 1 Subscription = 1 Job.
        // We can check if a Job exists for this user created AFTER subscription start date.
        const existingJob = yield job_model_1.default.findOne({
            user: userId,
            createdAt: { $gte: activeSub.startDate },
            status: { $ne: job_model_1.JobStatus.EXPIRED } // If expired, maybe allow new one? But subscription ends too.
        });
        if (existingJob) {
            return res.status(400).json({
                message: 'You already have an active post for this plan.',
                code: 'JOB_LIMIT_REACHED'
            });
        }
        // 2. Setup Job Properties based on Plan
        const plan = yield plan_model_1.default.findOne({ id: planId });
        let isHighlighted = false;
        let isPinned = false;
        let durationDays = 1;
        if (plan) {
            if (planId === 'TOURIST_WEEKEND') {
                isHighlighted = true;
                durationDays = 3;
            }
            else if (planId === 'TOURIST_VVIP') {
                isHighlighted = true; // Also highlight
                isPinned = true;
                durationDays = 7;
            }
        }
        // Calculate Expiration
        // Should expire when subscription expires? Or from creation time?
        // Subscription dates are set when Approved.
        // If user posts 2 days after approval of "24h Plan", the sub is already expired!
        // So User MUST post while Sub is Active. 
        // And the Job expires when Sub expires (or slightly after?).
        // Let's sync Job Expiration with Subscription End Date.
        const expiresAt = activeSub.endDate;
        const job = yield job_model_1.default.create({
            user: userId,
            content,
            budget,
            location,
            lineId,
            whatsapp,
            images,
            planType: planId,
            status: job_model_1.JobStatus.ACTIVE,
            expiresAt,
            isHighlighted,
            isPinned
        });
        res.status(201).json(job);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createJob = createJob;
const getJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch User's location/preferences from query?
        const { limit = 20 } = req.query;
        // Auto-expire jobs? (Can be done via Cron, but for now filter on fetch)
        // Or Lazy Expiration
        const now = new Date();
        // Query: Active Jobs
        const jobs = yield job_model_1.default.find({
            status: job_model_1.JobStatus.ACTIVE,
            expiresAt: { $gt: now }
        })
            .populate('user', 'displayName avatarUrl username')
            .sort({ isPinned: -1, isHighlighted: -1, createdAt: -1 }) // Pinned first, then Highlighted, then Newest
            .limit(Number(limit));
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getJobs = getJobs;
const getMyJobs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const jobs = yield job_model_1.default.find({ user: userId }).sort({ createdAt: -1 });
        res.json(jobs);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyJobs = getMyJobs;
const updateJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { content, budget, location, lineId, whatsapp, images } = req.body;
        const job = yield job_model_1.default.findOne({ _id: id, user: userId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found or you are not authorized to edit this job' });
        }
        // Check if job is active/expired? 
        // Allow editing even if expired? Usually yes, or maybe not if it's archived.
        // Assuming active jobs only? Or let them edit.
        job.content = content || job.content;
        job.budget = budget || job.budget;
        job.location = location || job.location;
        job.lineId = lineId || job.lineId;
        if (whatsapp !== undefined)
            job.whatsapp = whatsapp;
        if (images) {
            job.images = images;
        }
        yield job.save();
        res.json(job);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateJob = updateJob;
const deleteJob = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const job = yield job_model_1.default.findOneAndDelete({ _id: id, user: userId });
        if (!job) {
            return res.status(404).json({ message: 'Job not found or you are not authorized to delete this job' });
        }
        res.json({ message: 'Job deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deleteJob = deleteJob;
