import { Request, Response } from 'express';
import Job, { JobStatus } from '../models/job.model';
import Subscription, { SubscriptionStatus } from '../models/subscription.model';
import Plan from '../models/plan.model';

export const createJob = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { content, budget, location, lineId, images, planId } = req.body;

        // 1. Check if user has active subscription for this plan (Or create a pending one flow?)
        // The implementation plan says: "User creates a post -> selects Plan -> Pays -> Post goes live."
        // We can either:
        // A) Create Job in PENDING status, then Pay.
        // B) Pay first (get Subscription), then Create Job (using Credits).

        // Let's go with B (Conceptually simpler for existing Subscription model):
        // User buys "Tourist Plan". Once Active, they can post.
        // BUT wait, a Tourist Plan is "One Night Post". It allows ONE post for 24 hours.
        // So we need to link the Job to the Subscription.

        const activeSub = await Subscription.findOne({
            user: userId,
            planType: planId, // Verify they have THIS plan
            status: SubscriptionStatus.ACTIVE,
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
        const existingJob = await Job.findOne({
            user: userId,
            createdAt: { $gte: activeSub.startDate },
            status: { $ne: JobStatus.EXPIRED } // If expired, maybe allow new one? But subscription ends too.
        });

        if (existingJob) {
            return res.status(400).json({
                message: 'You already have an active post for this plan.',
                code: 'JOB_LIMIT_REACHED'
            });
        }

        // 2. Setup Job Properties based on Plan
        const plan = await Plan.findOne({ id: planId });
        let isHighlighted = false;
        let isPinned = false;
        let durationDays = 1;

        if (plan) {
            if (planId === 'TOURIST_WEEKEND') {
                isHighlighted = true;
                durationDays = 3;
            } else if (planId === 'TOURIST_VVIP') {
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

        const job = await Job.create({
            user: userId,
            content,
            budget,
            location,
            lineId,
            images,
            planType: planId,
            status: JobStatus.ACTIVE,
            expiresAt,
            isHighlighted,
            isPinned
        });

        res.status(201).json(job);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getJobs = async (req: Request, res: Response) => {
    try {
        // Fetch User's location/preferences from query?
        const { limit = 20 } = req.query;

        // Auto-expire jobs? (Can be done via Cron, but for now filter on fetch)
        // Or Lazy Expiration
        const now = new Date();

        // Query: Active Jobs
        const jobs = await Job.find({
            status: JobStatus.ACTIVE,
            expiresAt: { $gt: now }
        })
            .populate('user', 'displayName avatarUrl username')
            .sort({ isPinned: -1, isHighlighted: -1, createdAt: -1 }) // Pinned first, then Highlighted, then Newest
            .limit(Number(limit));

        res.json(jobs);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


export const getMyJobs = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const jobs = await Job.find({ user: userId }).sort({ createdAt: -1 });
        res.json(jobs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateJob = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const { content, budget, location, lineId, images } = req.body;

        const job = await Job.findOne({ _id: id, user: userId });

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

        if (images) {
            job.images = images;
        }

        await job.save();

        res.json(job);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
