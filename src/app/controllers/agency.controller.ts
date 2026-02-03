
import { Request, Response } from 'express';
import Agency from '../models/agency.model';
import Creator from '../models/creator.model';

export const getAgencies = async (req: Request, res: Response) => {
    try {
        // Fetch agencies and populate a few creators for preview
        const agencies: any[] = await Agency.find()
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
        const Subscription = (await import('../models/subscription.model')).default;
        const Review = (await import('../models/review.model')).default;
        const Setting = (await import('../models/setting.model')).default;

        // Check Free Mode
        const freeModeSetting = await Setting.findOne({ key: 'isFreeMode' });
        const isFreeMode = freeModeSetting?.value === 'true';

        // Collect all creators to fetch related data in bulk
        const allCreators = agencies.flatMap(a => a.creators || []);
        const creatorUserIds = allCreators
            .map(c => c.user?._id || c.user)
            .filter(id => id);
        const creatorIds = allCreators.map(c => c._id);

        if (creatorUserIds.length > 0) {
            const subscriptions = await Subscription.find({
                user: { $in: creatorUserIds },
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            });

            const reviewCounts = await Review.aggregate([
                { $match: { creator: { $in: creatorIds } } },
                { $group: { _id: "$creator", count: { $sum: 1 } } }
            ]);

            // Map data back to agencies
            agencies.forEach(agency => {
                if (agency.creators) {
                    agency.creators = agency.creators.map((c: any) => {
                        const userId = (c.user?._id || c.user)?.toString();
                        const sub = subscriptions.find(s => s.user.toString() === userId);
                        const planName = isFreeMode ? (sub?.planType || "Free Mode") : (sub?.planType || "");

                        const reviewCountObj = reviewCounts.find(r => r._id.toString() === c._id.toString());
                        const reviewCount = reviewCountObj ? reviewCountObj.count : 0;

                        return {
                            ...c,
                            planName,
                            planId: planName,
                            reviewCount
                        };
                    });
                }
            });
        }

        res.json(agencies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAgencyById = async (req: Request, res: Response) => {
    try {
        const agency: any = await Agency.findById(req.params.id).populate({
            path: 'creators',
            match: { agencyJoinStatus: 'APPROVED' }, // Only show approved creators
            populate: {
                path: 'user',
                select: 'displayName avatarUrl'
            }
        }).lean();

        if (!agency) return res.status(404).json({ message: 'Agency not found' });

        // Enrich creators with Plan Name (similar to getCreators)
        const Subscription = (await import('../models/subscription.model')).default;
        const Setting = (await import('../models/setting.model')).default; // Import Setting model

        // Check Free Mode
        const freeModeSetting = await Setting.findOne({ key: 'isFreeMode' });
        const isFreeMode = freeModeSetting?.value === 'true';

        if (agency.creators && agency.creators.length > 0) {
            const creators = agency.creators as any[];
            // Handle both populated user object and raw ID cases safe for lean
            const creatorUserIds = creators
                .map(c => c.user?._id || c.user)
                .filter(id => id); // Filter out nulls/undefined

            const subscriptions = await Subscription.find({
                user: { $in: creatorUserIds },
                status: 'ACTIVE',
                endDate: { $gt: new Date() }
            });

            // Aggregate Review Counts
            const Review = (await import('../models/review.model')).default;
            const creatorIds = creators.map(c => c._id);
            const reviewCounts = await Review.aggregate([
                { $match: { creator: { $in: creatorIds } } },
                { $group: { _id: "$creator", count: { $sum: 1 } } }
            ]);

            // Map creators to include planName and reviewCount
            agency.creators = creators.map(c => {
                const userId = (c.user?._id || c.user)?.toString();
                const sub = subscriptions.find(s => s.user.toString() === userId);
                const planName = isFreeMode ? (sub?.planType || "Free Mode") : (sub?.planType || "");

                const reviewCountObj = reviewCounts.find(r => r._id.toString() === c._id.toString());
                const reviewCount = reviewCountObj ? reviewCountObj.count : 0;

                return {
                    ...c,
                    planName,
                    planId: planName, // Add planId for compatibility
                    reviewCount
                };
            });
        }

        res.json(agency);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createAgency = async (req: Request, res: Response) => {
    try {
        const { name, location, description, logoUrl, owner } = req.body;
        // In real app, check permissions or get owner from auth

        const newAgency = await Agency.create({
            name,
            location,
            description,
            logoUrl,
            owner // Optional: Assign to a user
        });

        res.status(201).json(newAgency);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
};

export const getMyAgency = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        // Find agency owned by this user
        // For owner view, we want ALL creators (PENDING and APPROVED)
        const agency = await Agency.findOne({ owner: userId }).populate('creators');

        if (!agency) {
            return res.status(404).json({ message: 'Agency profile not found' });
        }

        res.json(agency);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateAgencyProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        const agency = await Agency.findOneAndUpdate(
            { owner: userId },
            { $set: updates },
            { new: true }
        );

        if (!agency) {
            return res.status(404).json({ message: 'Agency profile not found' });
        }

        res.json(agency);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- APPROVAL FLOW ---

export const approveCreator = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { creatorId } = req.params;

        // Verify agency ownership AND KYC STATUS
        const agency = await Agency.findOne({ owner: userId });
        if (!agency) return res.status(403).json({ message: 'Not authorized' });

        if (!agency.isVerified) {
            return res.status(403).json({ message: 'Agency is not verified. Please submit KYC first.' });
        }

        const creator = await Creator.findOneAndUpdate(
            { _id: creatorId, agency: agency._id },
            { $set: { agencyJoinStatus: 'APPROVED' } },
            { new: true }
        );

        if (!creator) return res.status(404).json({ message: 'Creator request not found' });

        res.json(creator);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectCreator = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { creatorId } = req.params;

        // Verify agency ownership
        const agency = await Agency.findOne({ owner: userId });
        if (!agency) return res.status(403).json({ message: 'Not authorized' });

        const creator = await Creator.findOneAndUpdate(
            { _id: creatorId, agency: agency._id },
            {
                $set: { agencyJoinStatus: 'NONE' },
                $unset: { agency: "" } // Remove agency link
            },
            { new: true }
        );

        if (!creator) return res.status(404).json({ message: 'Creator request not found' });

        res.json(creator);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// --- KYC / ADMIN FLOW ---

export const submitKYC = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const agency = await Agency.findOneAndUpdate(
            { owner: userId },
            { $set: { kycStatus: 'PENDING' } },
            { new: true }
        );
        if (!agency) return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const verifyAgency = async (req: any, res: Response) => {
    try {
        // Assume Middleware checks for ADMIN role
        const { id } = req.params;
        const agency = await Agency.findByIdAndUpdate(
            id,
            {
                $set: {
                    isVerified: true,
                    kycStatus: 'APPROVED'
                }
            },
            { new: true }
        );
        if (!agency) return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPendingAgencies = async (req: any, res: Response) => {
    try {
        // Admin only - list all pending KYC
        const agencies = await Agency.find({ kycStatus: 'PENDING' });
        res.json(agencies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectAgency = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }

        const agency = await Agency.findByIdAndUpdate(
            id,
            {
                $set: {
                    isVerified: false,
                    kycStatus: 'REJECTED',
                    rejectionReason: reason
                }
            },
            { new: true }
        );

        if (!agency) return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
