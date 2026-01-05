import { Request, Response } from 'express';
import User from '../models/user.model';
import Review from '../models/review.model';

export const getUserDashboardStats = async (req: Request | any, res: Response) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // 1. Profiles Seen (Count unique creators in viewHistory)
        // Using Set to filter unique creator IDs
        const uniqueViews = new Set(user.viewHistory?.map((v: any) => v.creator.toString()));
        const profilesSeen = uniqueViews.size;

        // 2. My Favorites (Count favorites array)
        const myFavorites = user.favorites?.length || 0;

        // 3. My Reviews (Count reviews created by this user)
        const myReviews = await Review.countDocuments({ user: userId });

        res.json({
            profilesSeen,
            myReviews,
            myFavorites
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
