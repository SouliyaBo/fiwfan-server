import mongoose, { Document, Schema } from 'mongoose';

export interface ICreator extends Document {
    user: mongoose.Types.ObjectId;
    displayName?: string;
    bio?: string;
    bannerUrl?: string;
    location?: string;
    country?: string;
    province?: string;
    zones?: string[];
    age?: number;
    height?: number;
    weight?: number;
    chest?: number;
    waist?: number;
    hips?: number;
    proportions?: string;
    price: number;
    priceTime?: string;
    views: number;
    isVerified: boolean;
    isHot: boolean;
    rankingPriority: number;
    whatsapp?: string;
    agency?: mongoose.Types.ObjectId;
    agencyJoinStatus: 'NONE' | 'PENDING' | 'APPROVED';
    images: string[];
    createdAt: Date;
    updatedAt: Date;
    packages?: {
        price: number;
        time: string;
        details: string;
    }[];
}

const CreatorSchema: Schema = new Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    displayName: { type: String },
    bio: { type: String },
    bannerUrl: { type: String },
    location: { type: String },
    country: { type: String, default: 'Thailand' }, // Default for migration
    province: { type: String },
    zones: { type: [String] },
    age: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    chest: { type: Number },
    waist: { type: Number },
    hips: { type: Number },
    proportions: { type: String },

    // Contact & Location Details
    lineId: { type: String },
    instagram: { type: String },
    whatsapp: { type: String },
    phone: { type: String },
    transport: { type: String }, // MRT/BTS
    parking: { type: Boolean, default: false },

    // Extended Details
    gender: { type: String },
    languages: { type: [String] },
    services: { type: [String] },
    interests: { type: [String] },
    availability: { type: String },

    price: { type: Number, default: 0 },
    priceTime: { type: String, default: '1 ชม.' }, // Start price duration
    views: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    isHot: { type: Boolean, default: false },
    rankingPriority: { type: Number, default: 0 },
    images: [{ type: String }],
    agency: { type: mongoose.Schema.Types.ObjectId, ref: 'Agency' },
    agencyJoinStatus: {
        type: String,
        enum: ['NONE', 'PENDING', 'APPROVED'],
        default: 'NONE'
    },
    packages: [{
        price: Number,
        time: String,
        details: String
    }]
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for posts
CreatorSchema.virtual('posts', {
    ref: 'Post',
    localField: '_id',
    foreignField: 'creator'
});

export default mongoose.model<ICreator>('Creator', CreatorSchema);
