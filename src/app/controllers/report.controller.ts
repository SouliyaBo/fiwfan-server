import { Request, Response } from 'express';
import Report from '../models/report.model';
import Review from '../models/review.model';
import { AuthRequest } from '../middleware/auth.middleware';

export const createReport = async (req: Request, res: Response) => {
    try {
        const { targetType, targetId, reason, description } = req.body;
        // @ts-ignore
        const reporterId = req.user.id;

        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const report = new Report({
            reporter: reporterId,
            targetType,
            targetId,
            reason,
            description
        });

        await report.save();

        res.status(201).json({ success: true, data: report });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getReports = async (req: AuthRequest, res: Response) => {
    try {
        // Check Admin Role
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        const reports = await Report.find()
            .populate('reporter', 'username avatarUrl')
            .sort({ createdAt: -1 });

        // Manually Populate Targets based on type
        // This is a simple loop approach; for high scale, use aggregate with $lookup
        const populatedReports = await Promise.all(reports.map(async (r: any) => {
            const reportObj = r.toObject();
            if (r.targetType === 'USER') {
                const User = (await import('../models/user.model')).default;
                reportObj.target = await User.findById(r.targetId, 'username email');
            } else if (r.targetType === 'CREATOR') {
                const Creator = (await import('../models/creator.model')).default;
                reportObj.target = await Creator.findById(r.targetId, 'displayName bio images');
            } else if (r.targetType === 'REVIEW') {
                const Review = (await import('../models/review.model')).default;
                reportObj.target = await Review.findById(r.targetId);
            }
            return reportObj;
        }));

        res.status(200).json(populatedReports);
    } catch (error: any) {
        console.error("getReports error:", error);
        res.status(500).json({ message: error.message });
    }
};

export const updateReportStatus = async (req: Request, res: Response) => {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }

        const { status, action } = req.body;
        const { id } = req.params;

        const report = await Report.findByIdAndUpdate(
            id,
            { status, adminNote: action ? `Action taken: ${action}` : undefined },
            { new: true }
        );

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        // Handle Actions
        if (action === 'HIDE_PROFILE' && report.targetType === 'CREATOR') {
            const Creator = (await import('../models/creator.model')).default;
            // Assuming we have a way to hide, e.g., set isVerified to false or a new status
            // For now let's untick isVerified or adding a 'hidden' flag if schema supports
            // Let's toggle isVerified to false as a "Soft Ban"
            await Creator.findByIdAndUpdate(report.targetId, { isVerified: false });
        }
        else if (action === 'BAN_USER') {
            const User = (await import('../models/user.model')).default;
            // Find the user associated with this target.
            // If targetType is CREATOR, we need the userId from Creator
            let userIdToBan = report.targetId;

            if (report.targetType === 'CREATOR') {
                const Creator = (await import('../models/creator.model')).default;
                const creator = await Creator.findById(report.targetId);
                if (creator) userIdToBan = creator.user;
            } else if (report.targetType === 'USER') {
                userIdToBan = report.targetId;
            }

            // Set isActive = false (Hard Ban)
            await User.findByIdAndUpdate(userIdToBan, { isActive: false });

            // Also hide/unverify the creator profile so they don't show up
            const CreatorModel = (await import('../models/creator.model')).default;
            await CreatorModel.findOneAndUpdate({ user: userIdToBan }, { isVerified: false });
        }

        res.status(200).json(report);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
