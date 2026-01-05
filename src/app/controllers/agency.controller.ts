
import { Request, Response } from 'express';
import Agency from '../models/agency.model';
import Creator from '../models/creator.model';

export const getAgencies = async (req: Request, res: Response) => {
    try {
        // Fetch agencies and populate a few creators for preview
        const agencies = await Agency.find()
            .populate({
                path: 'creators',
                match: { agencyJoinStatus: 'APPROVED' }, // Only show approved creators in public list
                select: 'displayName images user',
                perDocumentLimit: 5
            })
            .lean();

        res.json(agencies);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getAgencyById = async (req: Request, res: Response) => {
    try {
        const agency = await Agency.findById(req.params.id).populate({
            path: 'creators',
            match: { agencyJoinStatus: 'APPROVED' } // Only show approved creators
        });
        if (!agency) return res.status(404).json({ message: 'Agency not found' });
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
