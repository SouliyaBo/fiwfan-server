
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(process.cwd(), '.env') });

const checkKyc = async () => {
    try {
        console.log("Connecting to DB...");
        if (!process.env.DATABASE_URL) {
            throw new Error("DATABASE_URL is missing from env");
        }
        await mongoose.connect(process.env.DATABASE_URL);
        console.log("Connected.");

        // We need to import the model or define a temporary schema
        // Defining temp schema to avoid import issues with relative paths if run from root
        const CreatorSchema = new mongoose.Schema({
            displayName: String,
            verificationStatus: String,
            user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
        });

        // Use existing model if possible, or create a temp one attached to 'creators' collection
        const Creator = mongoose.models.Creator || mongoose.model('Creator', CreatorSchema, 'creators');
        const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({ username: String, email: String }), 'users');

        const pendingCreators = await Creator.find({ verificationStatus: 'PENDING' }).populate('user');

        console.log(`Found ${pendingCreators.length} creators with PENDING status.`);

        pendingCreators.forEach(c => {
            // @ts-ignore
            const username = c.user?.username || c.user?.email || "Unknown User";
            console.log(`- Creator: ${c.displayName} (User: ${username}) | Status: ${c.verificationStatus}`);
        });

        await mongoose.disconnect();
        console.log("Done.");
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkKyc();
