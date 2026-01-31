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
exports.deletePlan = exports.updatePlan = exports.createPlan = exports.getAllPlans = void 0;
const plan_model_1 = __importDefault(require("../models/plan.model"));
const getAllPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const plans = yield plan_model_1.default.find().sort({ rankingPriority: -1, createdAt: -1 });
        res.json(plans);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.getAllPlans = getAllPlans;
const createPlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const checkPlan = yield plan_model_1.default.findOne({ id: req.body.id });
        if (checkPlan) {
            return res.status(400).json({ message: 'Plan ID already exists' });
        }
        const plan = new plan_model_1.default(req.body);
        yield plan.save();
        res.status(201).json(plan);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.createPlan = createPlan;
const updatePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const plan = yield plan_model_1.default.findByIdAndUpdate(id, req.body, { new: true });
        if (!plan) {
            return res.status(404).json({ message: 'Plan not found' });
        }
        res.json(plan);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.updatePlan = updatePlan;
const deletePlan = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const plan = yield plan_model_1.default.findByIdAndDelete(id);
        if (!plan) {
            // Try deleting by custom ID if not found by _id?
            // Usually not necessary if frontend sends _id, but to be safe:
            const planByCustomId = yield plan_model_1.default.findOneAndDelete({ id: id });
            if (!planByCustomId) {
                return res.status(404).json({ message: 'Plan not found' });
            }
            return res.json({ message: 'Plan deleted successfully' });
        }
        res.json({ message: 'Plan deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
});
exports.deletePlan = deletePlan;
