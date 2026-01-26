import Creator from '../models/creator.model';
import Post from '../models/post.model';

import Subscription, { SubscriptionStatus } from '../models/subscription.model';

export const createPost = async (req: any, res: any) => {
    try {
        const { media, caption } = req.body;
        console.log("Request body:", req.body);
        const userId = req.user.id;

        // Check for active subscription
        const activeSubscription = await Subscription.findOne({
            user: userId,
            status: SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        });

        if (!activeSubscription) {
            // Check Free Mode and KYC
            const Setting = (await import('../models/setting.model')).default;
            const freeModeSetting = await Setting.findOne({ key: 'isFreeMode' });
            const isFreeMode = freeModeSetting?.value === 'true';

            if (!isFreeMode) {
                return res.status(403).json({
                    error: 'Subscription required',
                    code: 'SUBSCRIPTION_REQUIRED'
                });
            }

            // Free Mode is ON, check KYC
            const creatorCheck = await Creator.findOne({ user: userId });
            if (!creatorCheck || creatorCheck.verificationStatus !== 'APPROVED') {
                return res.status(403).json({
                    error: 'KYC Verification required for Free Mode',
                    code: 'KYC_REQUIRED'
                });
            }
            // If KYC approved, allow proceed
        }

        const creator = await Creator.findOne({ user: userId });
        console.log("Creator found:", creator);

        if (!creator) {
            return res.status(404).json({ error: 'Creator profile not found' });
        }

        const newPost = await Post.create({
            creator: creator._id,
            media: media || [],
            caption: caption
        });

        res.status(201).json(newPost);
    } catch (error: any) {
        console.error('Create post error:', error);
        res.status(500).json({ error: 'Failed to create post' });
    }
};
