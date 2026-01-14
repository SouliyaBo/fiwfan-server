import { Request, Response } from 'express';
import Story from '../models/story.model';
import Creator from '../models/creator.model';
import User from '../models/user.model';
import { deleteS3File } from '../files/helper';
import { BUCKET_NAME } from '../files';

export const createStory = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // Find creator profile associated with this user
        const creator = await Creator.findOne({ user: user.id });
        if (!creator) return res.status(404).json({ message: 'Creator profile not found' });

        const { mediaUrl, mediaType } = req.body;

        if (!mediaUrl) return res.status(400).json({ message: 'Media URL is required' });

        // Check Video Permissions (Super Star Only)
        if (mediaType === 'video') {
            if (creator.rankingPriority < 100) {
                return res.status(403).json({
                    message: 'Video upload is restricted to Super Star plan only',
                    code: 'PLAN_RESTRICTED'
                });
            }
        }

        const newStory = new Story({
            creator: creator._id,
            mediaUrl,
            mediaType: mediaType || 'image'
        });

        await newStory.save();

        res.status(201).json(newStory);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getStories = async (req: Request, res: Response) => {
    try {
        // Fetch active stories (expiresAt > now)
        // We can rely on TTL index for deletion, but for fetching let's be explicit
        const stories = await Story.find({ expiresAt: { $gt: new Date() } })
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyStories = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const creator = await Creator.findOne({ user: user.id });
        if (!creator) return res.status(404).json({ message: 'Creator not found' });

        const stories = await Story.find({ creator: creator._id })
            .sort({ createdAt: -1 });

        res.json(stories);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteStory = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = (req as any).user;
        const creator = await Creator.findOne({ user: user.id });

        const story = await Story.findOne({ _id: id, creator: creator?._id });
        if (!story) return res.status(404).json({ message: 'Story not found or unauthorized' });

        if (story.mediaUrl) {
            await deleteS3File(BUCKET_NAME, story.mediaUrl);
        }

        await story.deleteOne();
        res.json({ message: 'Story deleted' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
