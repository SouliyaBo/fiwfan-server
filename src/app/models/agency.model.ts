import mongoose, { Document, Schema } from 'mongoose';

export interface IAgency extends Document {
    name: string;
    logoUrl?: string;
    description?: string;
    location?: string;
    province?: string;
    zones?: string[];
    createdAt: Date;
    updatedAt: Date;
    // Extended fields
    bannerUrl?: string;
    lineId?: string;
    phone?: string;
    website?: string;
    isVerified: boolean;
    kycStatus: 'NONE' | 'PENDING' | 'APPROVED' | 'REJECTED';
    rejectionReason?: string;
}

const AgencySchema: Schema = new Schema({
    name: { type: String, required: true },
    logoUrl: { type: String },
    description: { type: String },
    location: { type: String },
    province: { type: String },
    zones: [{ type: String }],
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // New Fields
    bannerUrl: { type: String },
    lineId: { type: String },
    phone: { type: String },
    website: { type: String },
    isVerified: { type: Boolean, default: false },
    kycStatus: {
        type: String,
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NONE'
    },
    rejectionReason: { type: String }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for creators belonging to this agency
AgencySchema.virtual('creators', {
    ref: 'Creator',
    localField: '_id',
    foreignField: 'agency'
});

export default mongoose.model<IAgency>('Agency', AgencySchema);
