import mongoose, { Schema, Document } from 'mongoose';

export interface IStartPrice {
    duration: string;
    price: number;
    days: number;
}

export interface IPlan extends Document {
    id: string; // 'SUPER_STAR'
    name: string;
    description: string;
    features: string[];
    prices: IStartPrice[];
    theme: string; // 'gold', 'blue', etc.
    isActive: boolean;
    rankingPriority: number; // For sorting creators 100, 50, 10
    type: 'CREATOR' | 'TOURIST';
}

const PlanSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    features: [{ type: String }],
    prices: [{
        duration: { type: String, required: true },
        price: { type: Number, required: true },
        days: { type: Number, required: true }
    }],
    theme: { type: String, default: 'blue' },
    isActive: { type: Boolean, default: true },
    rankingPriority: { type: Number, default: 0 },
    type: { type: String, enum: ['CREATOR', 'TOURIST'], default: 'CREATOR' }
}, { timestamps: true });

export default mongoose.model<IPlan>('Plan', PlanSchema);
