import mongoose, { Schema, Document } from 'mongoose';

export enum JobStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    HIDDEN = 'HIDDEN'
}

export interface IJob extends Document {
    user: mongoose.Schema.Types.ObjectId;
    content: string;
    budget: number;
    location: string;
    lineId: string;
    images: string[];
    expiresAt: Date;
    status: JobStatus;
    planType: string; // 'TOURIST_ONE_NIGHT', etc.
    isHighlighted: boolean; // For Weekend Vibes
    isPinned: boolean; // For VVIP
    createdAt: Date;
    updatedAt: Date;
}

const JobSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    budget: { type: Number, required: true },
    location: { type: String, required: true },
    lineId: { type: String, required: true },
    images: [{ type: String }],
    expiresAt: { type: Date, required: true },
    status: { type: String, enum: Object.values(JobStatus), default: JobStatus.ACTIVE },
    planType: { type: String, required: true },
    isHighlighted: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false }
}, { timestamps: true });

// Index for expiration check
JobSchema.index({ expiresAt: 1 });
JobSchema.index({ status: 1 });

export default mongoose.model<IJob>('Job', JobSchema);
