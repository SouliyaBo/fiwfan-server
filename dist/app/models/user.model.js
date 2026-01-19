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
exports.Role = void 0;
const mongoose_1 = __importStar(require("mongoose"));
var Role;
(function (Role) {
    Role["USER"] = "USER";
    Role["CREATOR"] = "CREATOR";
    Role["ADMIN"] = "ADMIN";
    Role["AGENCY"] = "AGENCY";
})(Role || (exports.Role = Role = {}));
const UserSchema = new mongoose_1.Schema({
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
    favorites: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'Creator' }],
    viewHistory: [{
            creator: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Creator' },
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
exports.default = mongoose_1.default.model('User', UserSchema);
