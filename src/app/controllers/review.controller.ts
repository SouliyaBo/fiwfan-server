import { Request, Response } from 'express';
import Review from '../models/review.model';
import Creator from '../models/creator.model';
import User from '../models/user.model';

export const createReview = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const { creatorId, rating, accuracyRating, serviceRating, valueRating, title, comment, images } = req.body;

        if (!creatorId) {
            return res.status(400).json({ message: 'Creator ID is required' });
        }

        // Verify creator exists
        const creator = await Creator.findById(creatorId);
        if (!creator) {
            return res.status(404).json({ message: 'Creator not found' });
        }

        // Create Review
        const review = await Review.create({
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getReviewsByCreator = async (req: Request, res: Response) => {
    try {
        const { creatorId } = req.params;
        const reviews = await Review.find({ creator: creatorId })
            .populate('user', 'displayName avatarUrl')
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyReviews = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const reviews = await Review.find({ user: userId })
            .populate('creator', 'displayName') // Populate creator name
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllReviews = async (req: Request, res: Response) => {
    try {
        const reviews = await Review.find()
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
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
