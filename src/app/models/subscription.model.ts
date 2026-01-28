import mongoose, { Document, Schema } from 'mongoose';

export enum PlanType {
    SUPER_STAR = 'SUPER_STAR',
    STAR = 'STAR',
    POPULAR = 'POPULAR',
    TOURIST_ONE_NIGHT = 'TOURIST_ONE_NIGHT',
    TOURIST_WEEKEND = 'TOURIST_WEEKEND',
    TOURIST_VVIP = 'TOURIST_VVIP'
}

export enum SubscriptionStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    PENDING = 'PENDING',
    REJECTED = 'REJECTED'
}

export interface ISubscription extends Document {
    user: string; // User ID (Creator)
    planType: PlanType;
    status: SubscriptionStatus;
    startDate: Date;
    endDate: Date;
    price: number;
    currency: string;
    slipUrl?: string; // URL of the uploaded slip
    createdAt: Date;
    updatedAt: Date;
}

const SubscriptionSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    planType: {
        type: String,
        enum: Object.values(PlanType),
        required: true
    },
    status: {
        type: String,
        enum: Object.values(SubscriptionStatus),
        default: SubscriptionStatus.ACTIVE
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    price: { type: Number, required: true },
    currency: { type: String, default: 'THB' },
    slipUrl: { type: String }
}, {
    timestamps: true
});

// Index to quickly find active subscriptions
SubscriptionSchema.index({ user: 1, status: 1, endDate: -1 });

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema);
