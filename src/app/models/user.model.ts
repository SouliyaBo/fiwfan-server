import mongoose, { Document, Schema } from 'mongoose';

export enum Role {
    USER = 'USER',
    CREATOR = 'CREATOR',
    ADMIN = 'ADMIN',
    AGENCY = 'AGENCY'
}

export interface IUser extends Document {
    username: string;
    email: string;
    password?: string;
    displayName?: string;
    avatarUrl?: string;
    role: Role;
    lineId?: string;
    isCreator: boolean;
    createdAt: Date;
    updatedAt: Date;
    // Profile Fields
    age?: number;
    country?: string;
    gender?: string;
    province?: string;
    location?: string;
    zones?: string[];
    telegramId?: string;
    telegramUsername?: string;
    telegramPhotoUrl?: string;

    favorites?: any[];
    viewHistory?: { creator: any, viewedAt: Date }[];
    preferences?: {
        genders: string[];
        provinces: string[];
        ageRange: { min: number, max: number };
        heightRange: { min: number, max: number };
        weightRange: { min: number, max: number };
        chestRange: { min: number, max: number };
        waistRange: { min: number, max: number };
        buttsRange: { min: number, max: number };
        serviceTypes: string[];
        serviceTags: string[];
    };
    resetPasswordToken?: string;
    resetPasswordExpires?: Date;
}

const UserSchema: Schema = new Schema({
    username: { type: String, unique: true, sparse: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    displayName: { type: String },
    avatarUrl: { type: String },
    role: { type: String, enum: Object.values(Role), default: Role.USER },
    lineId: { type: String },
    isCreator: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpires: { type: Date, select: false },
    // Profile Fields for User/Tourist
    age: { type: Number },
    country: { type: String, default: 'Thailand' },
    gender: { type: String },
    province: { type: String },
    location: { type: String },
    zones: { type: [String] },

    // Telegram Login
    telegramId: { type: String, unique: true, sparse: true },
    telegramUsername: { type: String },
    telegramPhotoUrl: { type: String },

    // Tracking
    favorites: [{ type: Schema.Types.ObjectId, ref: 'Creator' }],
    viewHistory: [{
        creator: { type: Schema.Types.ObjectId, ref: 'Creator' },
        viewedAt: { type: Date, default: Date.now }
    }],
    preferences: {
        genders: [String],
        provinces: [String],
        ageRange: {
            min: { type: Number, default: 20 },
            max: { type: Number, default: 60 }
        },
        heightRange: {
            min: { type: Number, default: 140 },
            max: { type: Number, default: 200 }
        },
        weightRange: {
            min: { type: Number, default: 35 },
            max: { type: Number, default: 120 }
        },
        chestRange: {
            min: { type: Number, default: 30 },
            max: { type: Number, default: 50 }
        },
        waistRange: {
            min: { type: Number, default: 20 },
            max: { type: Number, default: 40 }
        },
        buttsRange: {
            min: { type: Number, default: 30 },
            max: { type: Number, default: 50 }
        },
        serviceTypes: [String],
        serviceTags: [String]
    }
}, {
    timestamps: true
});

export default mongoose.model<IUser>('User', UserSchema);
