"use strict";
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
exports.rejectAgency = exports.getPendingAgencies = exports.verifyAgency = exports.submitKYC = exports.rejectCreator = exports.approveCreator = exports.updateAgencyProfile = exports.getMyAgency = exports.createAgency = exports.getAgencyById = exports.getAgencies = void 0;
const agency_model_1 = __importDefault(require("../models/agency.model"));
const creator_model_1 = __importDefault(require("../models/creator.model"));
const getAgencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch agencies and populate a few creators for preview
        const agencies = yield agency_model_1.default.find()
            .populate({
            path: 'creators',
            match: { agencyJoinStatus: 'APPROVED' }, // Only show approved creators in public list
            select: 'displayName images user',
            perDocumentLimit: 5
        })
            .lean();
        res.json(agencies);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAgencies = getAgencies;
const getAgencyById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const agency = yield agency_model_1.default.findById(req.params.id).populate({
            path: 'creators',
            match: { agencyJoinStatus: 'APPROVED' } // Only show approved creators
        });
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAgencyById = getAgencyById;
const createAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, location, description, logoUrl, owner } = req.body;
        // In real app, check permissions or get owner from auth
        const newAgency = yield agency_model_1.default.create({
            name,
            location,
            description,
            logoUrl,
            owner // Optional: Assign to a user
        });
        res.status(201).json(newAgency);
    }
    catch (error) {
        res.status(400).json({ message: error.message });
    }
});
exports.createAgency = createAgency;
const getMyAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        // Find agency owned by this user
        // For owner view, we want ALL creators (PENDING and APPROVED)
        const agency = yield agency_model_1.default.findOne({ owner: userId }).populate('creators');
        if (!agency) {
            return res.status(404).json({ message: 'Agency profile not found' });
        }
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getMyAgency = getMyAgency;
const updateAgencyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const agency = yield agency_model_1.default.findOneAndUpdate({ owner: userId }, { $set: updates }, { new: true });
        if (!agency) {
            return res.status(404).json({ message: 'Agency profile not found' });
        }
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updateAgencyProfile = updateAgencyProfile;
// --- APPROVAL FLOW ---
const approveCreator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { creatorId } = req.params;
        // Verify agency ownership AND KYC STATUS
        const agency = yield agency_model_1.default.findOne({ owner: userId });
        if (!agency)
            return res.status(403).json({ message: 'Not authorized' });
        if (!agency.isVerified) {
            return res.status(403).json({ message: 'Agency is not verified. Please submit KYC first.' });
        }
        const creator = yield creator_model_1.default.findOneAndUpdate({ _id: creatorId, agency: agency._id }, { $set: { agencyJoinStatus: 'APPROVED' } }, { new: true });
        if (!creator)
            return res.status(404).json({ message: 'Creator request not found' });
        res.json(creator);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.approveCreator = approveCreator;
const rejectCreator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const { creatorId } = req.params;
        // Verify agency ownership
        const agency = yield agency_model_1.default.findOne({ owner: userId });
        if (!agency)
            return res.status(403).json({ message: 'Not authorized' });
        const creator = yield creator_model_1.default.findOneAndUpdate({ _id: creatorId, agency: agency._id }, {
            $set: { agencyJoinStatus: 'NONE' },
            $unset: { agency: "" } // Remove agency link
        }, { new: true });
        if (!creator)
            return res.status(404).json({ message: 'Creator request not found' });
        res.json(creator);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.rejectCreator = rejectCreator;
// --- KYC / ADMIN FLOW ---
const submitKYC = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user.id;
        const agency = yield agency_model_1.default.findOneAndUpdate({ owner: userId }, { $set: { kycStatus: 'PENDING' } }, { new: true });
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.submitKYC = submitKYC;
const verifyAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Assume Middleware checks for ADMIN role
        const { id } = req.params;
        const agency = yield agency_model_1.default.findByIdAndUpdate(id, {
            $set: {
                isVerified: true,
                kycStatus: 'APPROVED'
            }
        }, { new: true });
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.verifyAgency = verifyAgency;
const getPendingAgencies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Admin only - list all pending KYC
        const agencies = yield agency_model_1.default.find({ kycStatus: 'PENDING' });
        res.json(agencies);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getPendingAgencies = getPendingAgencies;
const rejectAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        if (!reason) {
            return res.status(400).json({ message: 'Rejection reason is required' });
        }
        const agency = yield agency_model_1.default.findByIdAndUpdate(id, {
            $set: {
                isVerified: false,
                kycStatus: 'REJECTED',
                rejectionReason: reason
            }
        }, { new: true });
        if (!agency)
            return res.status(404).json({ message: 'Agency not found' });
        res.json(agency);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.rejectAgency = rejectAgency;
