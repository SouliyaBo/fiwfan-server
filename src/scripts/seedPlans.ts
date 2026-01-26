
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
        rankingPriority: 100
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
        rankingPriority: 50
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
        rankingPriority: 10
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
