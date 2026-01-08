import { Request, Response } from 'express';
import Subscription, { PlanType, SubscriptionStatus } from '../models/subscription.model';
import User from '../models/user.model';

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

        res.json({ message: 'Subscription approved', subscription });
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

// Mock Plans Data
const PLANS = [
    {
        id: 'SUPER_STAR',
        name: 'SUPER STAR',
        description: 'Boost visibility 300%',
        features: ['แสดงรายชื่อเป็นอันดับ 1 (บนสุด)', 'ผลการค้นหา: อันดับ 1', 'มีวิดีโอ / รีลแนะนำ', 'การมองเห็นเพิ่มขึ้น 300%'],
        prices: [
            { duration: '1 Week', price: 1293, days: 7 },
            { duration: '2 Weeks', price: 2423, days: 14 },
            { duration: '4 Weeks', price: 4524, days: 28 }
        ],
        theme: 'gold'
    },
    {
        id: 'STAR',
        name: 'STAR',
        description: 'Boost visibility 100%',
        features: ['แสดงรายชื่อเป็นอันดับ 2', 'ผลการค้นหา: อันดับ 2'],
        prices: [
            { duration: '1 Week', price: 808, days: 7 },
            { duration: '2 Weeks', price: 1518, days: 14 },
            { duration: '4 Weeks', price: 2844, days: 28 }
        ],
        theme: 'blue'
    },
    {
        id: 'POPULAR',
        name: 'POPULAR',
        description: 'Normal visibility',
        features: ['แสดงรายชื่อเป็นอันดับ 3', 'ผลการค้นหา: อันดับ 3'],
        prices: [
            { duration: '1 Week', price: 486, days: 7 },
            { duration: '2 Weeks', price: 872, days: 14 },
            { duration: '4 Weeks', price: 1646, days: 28 }
        ],
        theme: 'teal'
    }
];

export const getPlans = (req: Request, res: Response) => {
    res.json(PLANS);
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
