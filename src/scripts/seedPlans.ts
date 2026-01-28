
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Plan from '../app/models/plan.model';

dotenv.config();

const PLANS = [
    {
        id: 'SUPER_STAR',
        name: 'SUPER STAR',
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

const seedPlans = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected to MongoDB');

        for (const plan of PLANS) {
            await Plan.findOneAndUpdate(
                { id: plan.id },
                { $set: plan },
                { upsert: true, new: true }
            );
            console.log(`Seeded plan: ${plan.name}`);
        }

        console.log('Plans seeded successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding plans:', error);
        process.exit(1);
    }
};

seedPlans();
