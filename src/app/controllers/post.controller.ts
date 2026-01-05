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
            return res.status(403).json({
                error: 'Subscription required',
                code: 'SUBSCRIPTION_REQUIRED'
            });
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
