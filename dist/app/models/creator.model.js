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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const CreatorSchema = new mongoose_1.Schema({
    user: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
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
    agency: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'Agency' },
    agencyJoinStatus: {
        type: String,
        enum: ['NONE', 'PENDING', 'APPROVED'],
        default: 'NONE'
    },
    packages: [{
            price: Number,
            time: String,
            details: String
        }],
    verificationStatus: {
        type: String,
        enum: ['NONE', 'PENDING', 'APPROVED', 'REJECTED'],
        default: 'NONE'
    },
    verificationData: {
        photoWithCodeUrl: String,
        fullBodyPhotoUrl: String,
        submittedAt: Date,
        rejectionReason: String
    }
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
exports.default = mongoose_1.default.model('Creator', CreatorSchema);
