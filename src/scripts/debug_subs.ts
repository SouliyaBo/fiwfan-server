
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Subscription, { SubscriptionStatus } from '../app/models/subscription.model';
import Creator from '../app/models/creator.model';
import User from '../app/models/user.model';

dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/fiwfan');
        console.log("Connected to DB");

        console.log("Checking Active Subscriptions...");
        const now = new Date();
        const activeSubs = await Subscription.find({
            status: SubscriptionStatus.ACTIVE,
            endDate: { $gt: now }
        });

        console.log(`Found ${activeSubs.length} active subscriptions.`);

        if (activeSubs.length === 0) {
            console.log("No active subscriptions found. Check 'endDate' and 'status'.");
        } else {
            const userIds = activeSubs.map(s => s.user);
            console.log("Active User IDs:", userIds);

            console.log("Checking Creators for these users...");
            const creators = await Creator.find({ user: { $in: userIds } });
            console.log(`Found ${creators.length} creators matching active subscription users.`);

            if (creators.length === 0) {
                console.log("Mismatch! Active subscriptions exist, but no matching Creators found.");

                // Debug: Check if creators exist at all
                const allCreators = await Creator.find({}).limit(5);
                console.log("Sample Creators (User IDs):", allCreators.map(c => c.user));
            } else {
                console.log("Found Creators:", creators.map(c => ({ id: c._id, displayName: c.displayName })));
            }
        }

    } catch (error) {
        console.error("Error:", error);
    } finally {
        await mongoose.disconnect();
    }
};

checkData();
