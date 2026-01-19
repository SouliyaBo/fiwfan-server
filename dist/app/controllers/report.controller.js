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
exports.updateReportStatus = exports.getReports = exports.createReport = void 0;
const report_model_1 = __importDefault(require("../models/report.model"));
const createReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { targetType, targetId, reason, description } = req.body;
        // @ts-ignore
        const reporterId = req.user.id;
        if (!targetType || !targetId || !reason) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        const report = new report_model_1.default({
            reporter: reporterId,
            targetType,
            targetId,
            reason,
            description
        });
        yield report.save();
        res.status(201).json({ success: true, data: report });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createReport = createReport;
const getReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check Admin Role
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }
        const reports = yield report_model_1.default.find()
            .populate('reporter', 'username avatarUrl')
            .sort({ createdAt: -1 });
        // Manually Populate Targets based on type
        // This is a simple loop approach; for high scale, use aggregate with $lookup
        const populatedReports = yield Promise.all(reports.map((r) => __awaiter(void 0, void 0, void 0, function* () {
            const reportObj = r.toObject();
            if (r.targetType === 'USER') {
                const User = (yield Promise.resolve().then(() => __importStar(require('../models/user.model')))).default;
                reportObj.target = yield User.findById(r.targetId, 'username email');
            }
            else if (r.targetType === 'CREATOR') {
                const Creator = (yield Promise.resolve().then(() => __importStar(require('../models/creator.model')))).default;
                reportObj.target = yield Creator.findById(r.targetId, 'displayName bio images');
            }
            else if (r.targetType === 'REVIEW') {
                const Review = (yield Promise.resolve().then(() => __importStar(require('../models/review.model')))).default;
                reportObj.target = yield Review.findById(r.targetId);
            }
            return reportObj;
        })));
        res.status(200).json(populatedReports);
    }
    catch (error) {
        console.error("getReports error:", error);
        res.status(500).json({ message: error.message });
    }
});
exports.getReports = getReports;
const updateReportStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // @ts-ignore
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ message: 'Access denied: Admins only' });
        }
        const { status, action } = req.body;
        const { id } = req.params;
        const report = yield report_model_1.default.findByIdAndUpdate(id, { status, adminNote: action ? `Action taken: ${action}` : undefined }, { new: true });
        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }
        // Handle Actions
        if (action === 'HIDE_PROFILE' && report.targetType === 'CREATOR') {
            const Creator = (yield Promise.resolve().then(() => __importStar(require('../models/creator.model')))).default;
            // Assuming we have a way to hide, e.g., set isVerified to false or a new status
            // For now let's untick isVerified or adding a 'hidden' flag if schema supports
            // Let's toggle isVerified to false as a "Soft Ban"
            yield Creator.findByIdAndUpdate(report.targetId, { isVerified: false });
        }
        else if (action === 'BAN_USER') {
            const User = (yield Promise.resolve().then(() => __importStar(require('../models/user.model')))).default;
            // Find the user associated with this target.
            // If targetType is CREATOR, we need the userId from Creator
            let userIdToBan = report.targetId;
            if (report.targetType === 'CREATOR') {
                const Creator = (yield Promise.resolve().then(() => __importStar(require('../models/creator.model')))).default;
                const creator = yield Creator.findById(report.targetId);
                if (creator)
                    userIdToBan = creator.user;
            }
            else if (report.targetType === 'USER') {
                userIdToBan = report.targetId;
            }
            // Set isActive = false (Hard Ban)
            yield User.findByIdAndUpdate(userIdToBan, { isActive: false });
            // Also hide/unverify the creator profile so they don't show up
            const CreatorModel = (yield Promise.resolve().then(() => __importStar(require('../models/creator.model')))).default;
            yield CreatorModel.findOneAndUpdate({ user: userIdToBan }, { isVerified: false });
        }
        res.status(200).json(report);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateReportStatus = updateReportStatus;
