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
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const setting_model_1 = __importDefault(require("../app/models/setting.model"));
const plan_model_1 = __importDefault(require("../app/models/plan.model"));
dotenv_1.default.config();
const verify = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');
        // 1. Test Free Mode Toggle
        console.log('--- Testing Free Mode ---');
        yield setting_model_1.default.findOneAndUpdate({ key: 'isFreeMode' }, { value: 'true' }, { upsert: true });
        let setting = yield setting_model_1.default.findOne({ key: 'isFreeMode' });
        console.log('Free Mode Enabled:', (setting === null || setting === void 0 ? void 0 : setting.value) === 'true');
        yield setting_model_1.default.findOneAndUpdate({ key: 'isFreeMode' }, { value: 'false' }, { upsert: true });
        setting = yield setting_model_1.default.findOne({ key: 'isFreeMode' });
        console.log('Free Mode Disabled:', (setting === null || setting === void 0 ? void 0 : setting.value) === 'false');
        // 2. Test Plan Creation
        console.log('--- Testing Plan Creation ---');
        const testId = 'TEST_PLAN_' + Date.now();
        yield plan_model_1.default.create({
            id: testId,
            name: 'Test Plan',
            description: 'Test Description',
            features: ['Feature 1'],
            prices: [{ duration: '1 Day', price: 100, days: 1 }],
            theme: 'blue',
            isActive: true
        });
        const plan = yield plan_model_1.default.findOne({ id: testId });
        console.log('Plan Created:', !!plan);
        console.log('Plan content:', plan === null || plan === void 0 ? void 0 : plan.id);
        // Cleanup
        yield plan_model_1.default.deleteOne({ id: testId });
        console.log('Plan Cleaned up');
        process.exit(0);
    }
    catch (error) {
        console.error('Verification Error:', error);
        process.exit(1);
    }
});
verify();
