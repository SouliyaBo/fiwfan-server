"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMySubscription = exports.subscribe = exports.getPlans = exports.rejectSubscription = exports.approveSubscription = exports.getPaymentHistory = exports.getPendingSubscriptions = void 0;
const subscription_model_1 = __importStar(require("../models/subscription.model"));
const creator_model_1 = __importDefault(require("../models/creator.model"));
const plan_model_1 = __importDefault(require("../models/plan.model"));
// --- Admin Controllers ---
const getPendingSubscriptions = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check Admin Role (Assuming req.user.role is populated by auth middleware)
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied' });
        }
        const subscriptions = yield subscription_model_1.default.find({ status: subscription_model_1.SubscriptionStatus.PENDING })
            .populate('user', 'displayName username email') // Populate user details
            .sort({ createdAt: -1 });
        res.json(subscriptions);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPendingSubscriptions = getPendingSubscriptions;
const getPaymentHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== 'ADMIN')
            return res.status(403).json({ message: 'Access denied' });
        const subscriptions = yield subscription_model_1.default.find({ status: { $ne: subscription_model_1.SubscriptionStatus.PENDING } })
            .populate('user', 'displayName username email')
            .sort({ updatedAt: -1 }) // Sort by last updated
            .limit(100); // Limit to last 100 for now
        res.json(subscriptions);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPaymentHistory = getPaymentHistory;
const approveSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== 'ADMIN')
            return res.status(403).json({ message: 'Access denied' });
        const { id } = req.params;
        const subscription = yield subscription_model_1.default.findById(id);
        if (!subscription)
            return res.status(404).json({ message: 'Subscription not found' });
        if (subscription.status !== subscription_model_1.SubscriptionStatus.PENDING) {
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
        yield subscription_model_1.default.updateMany({ user: subscription.user, status: subscription_model_1.SubscriptionStatus.ACTIVE }, { $set: { status: subscription_model_1.SubscriptionStatus.EXPIRED } });
        // 3. Activate this subscription
        subscription.status = subscription_model_1.SubscriptionStatus.ACTIVE;
        subscription.startDate = newStartDate;
        subscription.endDate = newEndDate;
        yield subscription.save();
        // 4. Update Creator Ranking Priority based on Plan
        // Fetch priority from Plan model
        const plan = yield plan_model_1.default.findOne({ id: subscription.planType });
        let priority = 0;
        if (plan) {
            priority = plan.rankingPriority;
        }
        else {
            // Fallback for legacy hardcoded values if plan not found in DB
            if (subscription.planType === 'THE_ANGEL' || subscription.planType === 'SUPER_STAR')
                priority = 100;
            else if (subscription.planType === 'POPULAR')
                priority = 50;
            else if (subscription.planType === 'RISING_STAR' || subscription.planType === 'STAR')
                priority = 10;
        }
        yield creator_model_1.default.findOneAndUpdate({ user: subscription.user }, { $set: { rankingPriority: priority } });
        res.json({ message: 'Subscription approved and ranking updated', subscription });
    }
    catch (error) {
        console.error('Subscription approval failed:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.approveSubscription = approveSubscription;
const rejectSubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (req.user.role !== 'ADMIN')
            return res.status(403).json({ message: 'Access denied' });
        const { id } = req.params;
        const subscription = yield subscription_model_1.default.findById(id);
        if (!subscription)
            return res.status(404).json({ message: 'Subscription not found' });
        subscription.status = subscription_model_1.SubscriptionStatus.REJECTED;
        yield subscription.save();
        res.json({ message: 'Subscription rejected', subscription });
    }
    catch (error) {
        console.error('Subscription rejection failed:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.rejectSubscription = rejectSubscription;
const getPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plans = yield plan_model_1.default.find({ isActive: true }).sort({ rankingPriority: -1 });
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPlans = getPlans;
const subscribe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const plan = yield plan_model_1.default.findOne({ id: planId });
        if (!plan) {
            return res.status(400).json({ message: 'Invalid Plan ID' });
        }
        // Check if user already has a pending subscription
        const existingPending = yield subscription_model_1.default.findOne({
            user: userId,
            status: subscription_model_1.SubscriptionStatus.PENDING
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
        const subscription = yield subscription_model_1.default.create({
            user: userId,
            planType: planId,
            status: subscription_model_1.SubscriptionStatus.PENDING,
            startDate,
            endDate,
            price,
            slipUrl
        });
        res.status(201).json(subscription);
    }
    catch (error) {
        console.error('Subscription creation failed:', error);
        res.status(500).json({ message: error.message });
    }
});
exports.subscribe = subscribe;
const getMySubscription = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Find latest active
        const active = yield subscription_model_1.default.findOne({
            user: userId,
            status: subscription_model_1.SubscriptionStatus.ACTIVE,
            endDate: { $gt: new Date() }
        }).sort({ endDate: -1 });
        // Find latest pending
        const pending = yield subscription_model_1.default.findOne({
            user: userId,
            status: subscription_model_1.SubscriptionStatus.PENDING
        }).sort({ createdAt: -1 });
        res.json({ active, pending });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMySubscription = getMySubscription;
