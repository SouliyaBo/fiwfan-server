import { Request, Response } from 'express';
import User from '../models/user.model';
import Creator from '../models/creator.model';
import Subscription, { SubscriptionStatus } from '../models/subscription.model';

export const getProfile = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find Active Subscription
        const activeSub = await Subscription.findOne({
            user: userId,
            status: SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).sort({ endDate: -1 });

        const userObj = user.toObject() as any;
        if (activeSub) {
            userObj.planId = activeSub.planType;
        }

        res.json(userObj);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProfile = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Prevent updating sensitive fields
        delete updates.password;
        delete updates.role;
        delete updates.email; // Usually email changes require verification

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const toggleFavorite = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const { creatorId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isFavorited = user.favorites?.includes(creatorId);

        if (isFavorited) {
            user.favorites = user.favorites?.filter((id: any) => id.toString() !== creatorId);
        } else {
            user.favorites?.push(creatorId);
        }

        await user.save();
        res.json({ success: true, isFavorited: !isFavorited });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const recordView = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const { creatorId } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check if already viewed
        const hasViewed = user.viewHistory?.some((view: any) => view.creator.toString() === creatorId);

        if (hasViewed) {
            return res.json({ success: true, message: 'Already viewed' });
        }

        user.viewHistory?.push({ creator: creatorId, viewedAt: new Date() });

        await user.save();

        // Increment creator view count
        await Creator.findByIdAndUpdate(creatorId, { $inc: { views: 1 } });

        res.json({ success: true });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getHistory = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate({
            path: 'viewHistory.creator',
            select: 'displayName images user',
            populate: { path: 'user', select: 'avatarUrl' }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        // Sort by most recent
        const history = user.viewHistory?.sort((a: any, b: any) =>
            new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
        );

        res.json(history);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyFavorites = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).populate({
            path: 'favorites',
            select: 'displayName images user',
            populate: { path: 'user', select: 'avatarUrl' }
        });

        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user.favorites);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePreferences = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: { preferences } },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getUsers = async (req: Request | any, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { search, role, page = 1, limit = 20 } = req.query;
        let query: any = {};

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

        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((Number(page) - 1) * Number(limit));

        const total = await User.countDocuments(query);

        // Populate Creator info for users with role 'CREATOR'
        const usersWithCreatorInfo = await Promise.all(users.map(async (u: any) => {
            const userObj = u.toObject();
            if (u.role === 'CREATOR') {
                const Creator = (await import('../models/creator.model')).default;
                const creator = await Creator.findOne({ user: u._id }).select('isVerified _id verificationStatus verificationData');
                if (creator) {
                    userObj.creatorProfile = creator;
                }
            }
            return userObj;
        }));

        res.json({
            users: usersWithCreatorInfo,
            totalPages: Math.ceil(total / Number(limit)),
            currentPage: Number(page)
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateUserStatus = async (req: Request | any, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findByIdAndUpdate(id, { isActive }, { new: true });
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
