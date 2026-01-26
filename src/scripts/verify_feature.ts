
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Setting from '../app/models/setting.model';
import Plan from '../app/models/plan.model';

dotenv.config();

const verify = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected to MongoDB');

        // 1. Test Free Mode Toggle
        console.log('--- Testing Free Mode ---');
        await Setting.findOneAndUpdate({ key: 'isFreeMode' }, { value: 'true' }, { upsert: true });
        let setting = await Setting.findOne({ key: 'isFreeMode' });
        console.log('Free Mode Enabled:', setting?.value === 'true');

        await Setting.findOneAndUpdate({ key: 'isFreeMode' }, { value: 'false' }, { upsert: true });
        setting = await Setting.findOne({ key: 'isFreeMode' });
        console.log('Free Mode Disabled:', setting?.value === 'false');


        // 2. Test Plan Creation
        console.log('--- Testing Plan Creation ---');
        const testId = 'TEST_PLAN_' + Date.now();
        await Plan.create({
            id: testId,
            name: 'Test Plan',
            description: 'Test Description',
            features: ['Feature 1'],
            prices: [{ duration: '1 Day', price: 100, days: 1 }],
            theme: 'blue',
            isActive: true
        });
        const plan = await Plan.findOne({ id: testId });
        console.log('Plan Created:', !!plan);
        console.log('Plan content:', plan?.id);

        // Cleanup
        await Plan.deleteOne({ id: testId });
        console.log('Plan Cleaned up');

        process.exit(0);
    } catch (error) {
        console.error('Verification Error:', error);
        process.exit(1);
    }
};

verify();
