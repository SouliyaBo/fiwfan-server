import { Request, Response } from 'express';
import Plan from '../models/plan.model';

export const getAllPlans = async (req: Request, res: Response) => {
    try {
        const plans = await Plan.find().sort({ rankingPriority: -1, createdAt: -1 });
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const createPlan = async (req: Request, res: Response) => {
    try {
        const checkPlan = await Plan.findOne({ id: req.body.id });
        if (checkPlan) {
            return res.status(400).json({ message: 'Plan ID already exists' });
        }

        const plan = new Plan(req.body);
        await plan.save();
        res.status(201).json(plan);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updatePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByIdAndUpdate(id, req.body, { new: true });

        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }

        res.json(plan);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePlan = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const plan = await Plan.findByIdAndDelete(id);

        if (!plan) {
            // Try deleting by custom ID if not found by _id?
            // Usually not necessary if frontend sends _id, but to be safe:
            const planByCustomId = await Plan.findOneAndDelete({ id: id });
            if (!planByCustomId) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            return res.json({ message: 'Plan deleted successfully' });
        }

        res.json({ message: 'Plan deleted successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
