import { Request, Response } from 'express';
import Creator from '../models/creator.model';
import User from '../models/user.model';
import Subscription, { SubscriptionStatus } from '../models/subscription.model';

export const getCreators = async (req: any, res: Response) => {
    try {
        const { location, usePreferences, name, lineId, gender, province, country, ageMin, ageMax, heightMin, heightMax, weightMin, weightMax, chestMin, chestMax, waistMin, waistMax, hipsMin, hipsMax } = req.query;
        let query: any = { isVerified: true };

        // Get users with ACTIVE subscription
        const activeSubs = await Subscription.find({
            status: SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).distinct('user');

        // Filter creators by active subscription
        query.user = { $in: activeSubs };

        // Apply Preferences if user is logged in and requested it
        if (usePreferences === 'true' && req.user) {
            const user = await User.findById(req.user.id);
            if (user && user.preferences) {
                const p = user.preferences;

                if (p.genders && p.genders.length > 0) query.gender = { $in: p.genders };
                if (p.provinces && p.provinces.length > 0) query.province = { $in: p.provinces };

                if (p.ageRange) query.age = { $gte: p.ageRange.min, $lte: p.ageRange.max };
                if (p.heightRange) query.height = { $gte: p.heightRange.min, $lte: p.heightRange.max };
                if (p.weightRange) query.weight = { $gte: p.weightRange.min, $lte: p.weightRange.max };

                if (p.serviceTypes && p.serviceTypes.length > 0) query.services = { $in: p.serviceTypes };
                if (p.serviceTags && p.serviceTags.length > 0) query.interests = { $in: p.serviceTags };
            }
        }

        // Specific Filters (Overwrite preferences if specific search is done? Or refine? Using AND refinement)
        // Let's allow specific filters to be added to the query query object directly.
        // If preferences set gender, and we search for gender, strict match should likely take precedence or intersect.
        // For simplicity, direct query params will overwrite/set the field.

        if (gender) query.gender = gender;
        if (country) {
            if (country === 'Thailand') {
                query.$or = [
                    { country: 'Thailand' },
                    { country: { $exists: false } },
                    { country: null }
                ];
            } else {
                query.country = country;
            }
        }
        if (province) query.province = province;
        if (name) query.displayName = { $regex: name as string, $options: 'i' };
        if (lineId) query.lineId = { $regex: lineId as string, $options: 'i' };

        if (ageMin || ageMax) {
            query.age = { ...query.age };
            if (ageMin) query.age.$gte = Number(ageMin);
            if (ageMax) query.age.$lte = Number(ageMax);
        }

        if (heightMin || heightMax) {
            query.height = { ...query.height };
            if (heightMin) query.height.$gte = Number(heightMin);
            if (heightMax) query.height.$lte = Number(heightMax);
        }

        if (weightMin || weightMax) {
            query.weight = { ...query.weight };
            if (weightMin) query.weight.$gte = Number(weightMin);
            if (weightMax) query.weight.$lte = Number(weightMax);
        }

        if (chestMin || chestMax) {
            query.chest = { ...query.chest };
            if (chestMin) query.chest.$gte = Number(chestMin);
            if (chestMax) query.chest.$lte = Number(chestMax);
        }

        if (waistMin || waistMax) {
            query.waist = { ...query.waist };
            if (waistMin) query.waist.$gte = Number(waistMin);
            if (waistMax) query.waist.$lte = Number(waistMax);
        }

        if (hipsMin || hipsMax) {
            query.hips = { ...query.hips };
            if (hipsMin) query.hips.$gte = Number(hipsMin);
            if (hipsMax) query.hips.$lte = Number(hipsMax);
        }

        if (location) {
            // Refine by location/zone
            const searchFilter = {
                $or: [
                    { location: { $regex: location as string, $options: 'i' } },
                    { province: { $regex: location as string, $options: 'i' } },
                    { zones: { $regex: location as string, $options: 'i' } }
                ]
            };

            if (Object.keys(query).length > 0) {
                // But wait, if query has other fields, we can merge logic.
                // safe way is $and if we are combining complex logic
                // However, query is a simple object so far except for preferences.
                // Let's use $and to be safe
                if (query.$and) {
                    query.$and.push(searchFilter);
                } else {
                    query = { $and: [query, searchFilter] };
                }
            } else {
                query = searchFilter;
            }
        }

        const creators = await Creator.find(query)
            .populate('user', 'username email avatarUrl')
            .sort({ rankingPriority: -1, isVerified: -1, updatedAt: -1 });
        res.json(creators);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getZoneStats = async (req: Request, res: Response) => {
    try {
        // 1. Get User IDs with ACTIVE subscriptions that haven't expired
        const activeSubs = await Subscription.find({
            status: SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).distinct('user');

        // 2. Aggregate Creators who match those User IDs
        const stats = await Creator.aggregate([
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};


export const getCreatorById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // 1. Try finding by valid ObjectId (Creator ID)
        let creator = null;
        const mongoose = await import('mongoose');

        if (mongoose.Types.ObjectId.isValid(id as string)) {
            creator = await Creator.findById(id).populate('user', 'username email avatarUrl').populate('posts');
            if (!creator) {
                // 2. Try User ID if valid ObjectId
                creator = await Creator.findOne({ user: id }).populate('user', 'username email avatarUrl').populate('posts');
            }
        }

        // 3. Fallback: Search by username (if ID is not ObjectId, or not found yet)
        if (!creator) {
            // Find user by username first
            const User = (await import('../models/user.model')).default;
            const user = await User.findOne({ username: id });
            if (user) {
                creator = await Creator.findOne({ user: user._id }).populate('user', 'username email avatarUrl').populate('posts');
            }
        }

        // 4. Fallback: Search by exact displayName matches (if still not found)
        if (!creator) {
            creator = await Creator.findOne({ displayName: id }).populate('user', 'username email avatarUrl').populate('posts');
        }

        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        // Fetch active subscription for this creator's user
        let activeSubscription = null;
        if (creator.user) {
            activeSubscription = await Subscription.findOne({
                user: creator.user._id || creator.user, // Handle both populated doc and ID
                status: SubscriptionStatus.ACTIVE,
                endDate: { $gt: new Date() }
            }).select('planType status endDate');
        }

        // Fetch reviews for this creator
        // Dynamic import to avoid circular dependency if any, though imports up top are fine
        const Review = (await import('../models/review.model')).default;
        const reviews = await Review.find({ creator: creator._id })
            .populate('user', 'username displayName avatarUrl') // Populate info needed for display
            .sort({ createdAt: -1 });

        // Convert to plain object and add subscription & review data
        const creatorData = creator.toObject();
        (creatorData as any).activeSubscription = activeSubscription;
        (creatorData as any).reviews = reviews;

        res.json(creatorData);
    } catch (error: any) {
        console.error("Error in getCreatorById:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateCreatorProfile = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Check Subscription if updating images (Gallery)
        if (updates.images && updates.images.length > 0) {
            const activeSubscription = await Subscription.findOne({
                user: userId,
                status: SubscriptionStatus.ACTIVE,
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
            const currentCreator = await Creator.findOne({ user: userId });
            if (currentCreator && currentCreator.agency?.toString() !== updates.agency) {
                updates.agencyJoinStatus = 'PENDING';
            }
        } else if (updates.agency === "") {
            // Leaving agency
            updates.agency = null;
            updates.agencyJoinStatus = 'NONE';
        }

        const creator = await Creator.findOneAndUpdate(
            { user: userId },
            { $set: updates },
            { new: true }
        );

        if (!creator) {
            return res.status(404).json({ message: 'Creator profile not found' });
        }

        res.json(creator);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getRecommendedCreators = async (req: Request, res: Response) => {
    try {
        const { excludeId } = req.query;

        // 1. Get users with ACTIVE subscription
        const activeSubs = await Subscription.find({
            status: SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).distinct('user'); // Get distinct user IDs

        // 2. Build Aggregation
        const pipeline: any[] = [
            {
                $match: {
                    user: { $in: activeSubs }, // Only creators with active sub
                    ...(excludeId ? { _id: { $ne: new (await import('mongoose')).Types.ObjectId(excludeId as string) } } : {})
                }
            },
            { $sample: { size: 4 } }
        ];

        const recommended = await Creator.aggregate(pipeline);

        // 3. Populate User Data
        const populatedRecommended = await Creator.populate(recommended, { path: 'user', select: 'avatarUrl' });

        // 4. Attach Active Subscription Object (needed for frontend logic)
        // Since we filtered by activeSubs, we know they have one, but we need the details (planType etc)
        const result = await Promise.all(populatedRecommended.map(async (creator: any) => {
            const sub = await Subscription.findOne({
                user: creator.user._id || creator.user, // Handle populated or not
                status: SubscriptionStatus.ACTIVE,
                endDate: { $gt: new Date() }
            }).select('planType status endDate');

            return {
                ...creator,
                activeSubscription: sub
            };
        }));

        res.json(result);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const updateCreatorVerification = async (req: Request | any, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { isVerified } = req.body;

        const creator = await Creator.findByIdAndUpdate(id, { isVerified }, { new: true });
        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        res.json(creator);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
