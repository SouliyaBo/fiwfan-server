import { Request, Response } from 'express';
import Plan from '../models/plan.model';

export const getAllPlans = async (req: Request, res: Response) => {
    try {
        const plans = await Plan.find().sort({ rankingPriority: -1 });
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPlan = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id, name, description, features, prices, theme, isActive, rankingPriority } = req.body;

        const existingPlan = await Plan.findOne({ id });
        if (existingPlan) {
            return res.status(400).json({ message: 'Plan ID already exists' });
        }

        const plan = await Plan.create({
            id,
            name,
            description,
            features,
            prices,
            theme,
            isActive: isActive !== undefined ? isActive : true,
            rankingPriority: rankingPriority || 0
        });

        res.status(201).json(plan);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePlan = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params; // MongoDB _id
        const updates = req.body;

        const plan = await Plan.findByIdAndUpdate(id, updates, { new: true });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        res.json(plan);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePlan = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const { id } = req.params; // MongoDB _id
        const plan = await Plan.findByIdAndDelete(id);

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        res.json({ message: 'Plan deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
