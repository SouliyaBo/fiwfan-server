import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    targetType: 'REVIEW' | 'POST' | 'USER' | 'CREATOR';
    targetId: mongoose.Types.ObjectId;
    reason: string;
    description?: string;
    status: 'PENDING' | 'RESOLVED' | 'REJECTED';
    adminNote?: string;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema: Schema = new Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetType: { type: String, enum: ['REVIEW', 'POST', 'USER', 'CREATOR'], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true },
    description: { type: String },
    status: { type: String, enum: ['PENDING', 'RESOLVED', 'REJECTED'], default: 'PENDING' },
    adminNote: { type: String }
}, {
    timestamps: true
});

export default mongoose.model<IReport>('Report', ReportSchema);
