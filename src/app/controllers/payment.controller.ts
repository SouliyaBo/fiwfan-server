import { Request, Response } from 'express';
import Subscription, { PlanType, SubscriptionStatus } from '../models/subscription.model';
import User from '../models/user.model';
import Creator from '../models/creator.model';
import Plan from '../models/plan.model';

// --- Admin Controllers ---

export const getPendingSubscriptions = async (req: any, res: Response) => {
    try {
        // Check Admin Role (Assuming req.user.role is populated by auth middleware)
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }

        const subscriptions = await Subscription.find({ status: SubscriptionStatus.PENDING })
            .populate('user', 'displayName username email') // Populate user details
            .sort({ createdAt: -1 });

        res.json(subscriptions);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const approveSubscription = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });

        const { id } = req.params;
        const subscription = await Subscription.findById(id);

        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });
        if (subscription.status !== SubscriptionStatus.PENDING) {
            return res.status(400).json({ message: 'Subscription is not pending' });
        }

        // 1. Calculate new dates (Start NOW)
        // We find the plan to get the duration again, or derive it from the old dates.
        // Assuming 'price' and 'planType' are correct. 
        // We can infer durationDays from the original request's difference, 
        // OR just simple: Duration = Original End - Original Start
        const durationTime = subscription.endDate.getTime() - subscription.startDate.getTime();

        const newStartDate = new Date();
        const newEndDate = new Date(newStartDate.getTime() + durationTime);

        // 2. Expire old ACTIVE subscriptions for this user
        await Subscription.updateMany(
            { user: subscription.user, status: SubscriptionStatus.ACTIVE },
            { $set: { status: SubscriptionStatus.EXPIRED } }
        );

        // 3. Activate this subscription
        subscription.status = SubscriptionStatus.ACTIVE;
        subscription.startDate = newStartDate;
        subscription.endDate = newEndDate;
        await subscription.save();

        // 4. Update Creator Ranking Priority based on Plan
        // Fetch priority from Plan model
        const plan = await Plan.findOne({ id: subscription.planType });
        let priority = 0;

        if (plan) {
            priority = plan.rankingPriority;
        } else {
            // Fallback for legacy hardcoded values if plan not found in DB
            if (subscription.planType === 'SUPER_STAR') priority = 100;
            else if (subscription.planType === 'STAR') priority = 50;
            else if (subscription.planType === 'POPULAR') priority = 10;
        }

        await Creator.findOneAndUpdate(
            { user: subscription.user },
            { $set: { rankingPriority: priority } }
        );

        res.json({ message: 'Subscription approved and ranking updated', subscription });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectSubscription = async (req: any, res: Response) => {
    try {
        if (req.user.role !== 'ADMIN') return res.status(403).json({ message: 'Access denied' });

        const { id } = req.params;
        const subscription = await Subscription.findById(id);

        if (!subscription) return res.status(404).json({ message: 'Subscription not found' });

        subscription.status = SubscriptionStatus.REJECTED;
        await subscription.save();

        res.json({ message: 'Subscription rejected', subscription });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getPlans = async (req: Request, res: Response) => {
    try {
        const plans = await Plan.find({ isActive: true }).sort({ rankingPriority: -1 });
        res.json(plans);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const subscribe = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;
        const { planId, durationDays, price, slipUrl } = req.body;

        if (!planId || !durationDays || !price) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        // 1. Verify slipUrl is provided
        if (!slipUrl) {
            return res.status(400).json({ message: 'Slip URL is required' });
        }

        // Verify Plan exists (Optional but recommended)
        const plan = await Plan.findOne({ id: planId });
        if (!plan) {
            return res.status(400).json({ message: 'Invalid Plan ID' });
        }

        // Check if user already has a pending subscription
        const existingPending = await Subscription.findOne({
            user: userId,
            status: SubscriptionStatus.PENDING
        });

        if (existingPending) {
            return res.status(400).json({ message: 'You already have a pending subscription request.' });
        }

        console.log(`Processing subscription request for user ${userId}: ${price} THB for ${planId}`);

        // 2. Calculate dates
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + parseInt(durationDays));

        // 3. Create new subscription with PENDING status
        // Note: We do NOT expire old subscriptions yet. 
        // Admin will activate this one and expire old ones manually or via admin flow.
        const subscription = await Subscription.create({
            user: userId,
            planType: planId,
            status: SubscriptionStatus.PENDING,
            startDate,
            endDate,
            price,
            slipUrl
        });

        res.status(201).json(subscription);

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMySubscription = async (req: any, res: Response) => {
    try {
        const userId = req.user.id;

        // Find latest active
        const active = await Subscription.findOne({
            user: userId,
            status: SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).sort({ endDate: -1 });

        // Find latest pending
        const pending = await Subscription.findOne({
            user: userId,
            status: SubscriptionStatus.PENDING
        }).sort({ createdAt: -1 });

        res.json({ active, pending });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
