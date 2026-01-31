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
const plan_model_1 = __importDefault(require("../app/models/plan.model"));
dotenv_1.default.config();
const PLANS = [
    {
        id: 'THE_ANGEL',
        name: 'THE ANGEL',
        description: 'Boost visibility 300%',
        features: ['แสดงรายชื่อเป็นอันดับ 1 (บนสุด)', 'ผลการค้นหา: อันดับ 1', 'มีวิดีโอ / รีลแนะนำ', 'การมองเห็นเพิ่มขึ้น 300%'],
        prices: [
            { duration: '1 Week', price: 1293, days: 7 },
            { duration: '2 Weeks', price: 2423, days: 14 },
            { duration: '4 Weeks', price: 4524, days: 28 }
        ],
        theme: 'gold',
        rankingPriority: 100,
        type: 'CREATOR'
    },
    {
        id: 'STAR',
        name: 'STAR',
        description: 'Boost visibility 100%',
        features: ['แสดงรายชื่อเป็นอันดับ 2', 'ผลการค้นหา: อันดับ 2'],
        prices: [
            { duration: '1 Week', price: 808, days: 7 },
            { duration: '2 Weeks', price: 1518, days: 14 },
            { duration: '4 Weeks', price: 2844, days: 28 }
        ],
        theme: 'blue',
        rankingPriority: 50,
        type: 'CREATOR'
    },
    {
        id: 'POPULAR',
        name: 'POPULAR',
        description: 'Normal visibility',
        features: ['แสดงรายชื่อเป็นอันดับ 3', 'ผลการค้นหา: อันดับ 3'],
        prices: [
            { duration: '1 Week', price: 486, days: 7 },
            { duration: '2 Weeks', price: 872, days: 14 },
            { duration: '4 Weeks', price: 1646, days: 28 }
        ],
        theme: 'teal',
        rankingPriority: 10,
        type: 'CREATOR'
    },
    // --- Tourist Plans ---
    {
        id: 'TOURIST_ONE_NIGHT',
        name: 'One Night Stand',
        description: 'Post for 24 Hours',
        features: ['โพสต์หาคนดูแล 24 ชม.', 'แสดงผลใน Widget', 'ผู้ดูแลทักหาได้ทันที'],
        prices: [
            { duration: '24 Hours', price: 199, days: 1 }
        ],
        theme: 'gray',
        rankingPriority: 0,
        type: 'TOURIST'
    },
    {
        id: 'TOURIST_WEEKEND',
        name: 'Weekend Vibes',
        description: 'Post for 3 Days',
        features: ['โพสต์หาคนดูแล 3 วัน', 'แสดงผลนานขึ้น', 'ไฮไลท์โพสต์'],
        prices: [
            { duration: '3 Days', price: 499, days: 3 }
        ],
        theme: 'purple',
        rankingPriority: 0,
        type: 'TOURIST'
    },
    {
        id: 'TOURIST_VVIP',
        name: 'VVIP Party',
        description: 'Post for 7 Days',
        features: ['โพสต์หาคนดูแล 7 วัน', 'ปักหมุดโพสต์แนะนำ', 'ตราสัญลักษณ์ VVIP'],
        prices: [
            { duration: '7 Days', price: 999, days: 7 }
        ],
        theme: 'gold',
        rankingPriority: 0,
        type: 'TOURIST'
    }
];
const seedPlans = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield mongoose_1.default.connect(process.env.DATABASE_URL);
        console.log('Connected to MongoDB');
        for (const plan of PLANS) {
            yield plan_model_1.default.findOneAndUpdate({ id: plan.id }, { $set: plan }, { upsert: true, new: true });
            console.log(`Seeded plan: ${plan.name}`);
        }
        console.log('Plans seeded successfully');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding plans:', error);
        process.exit(1);
    }
});
seedPlans();
