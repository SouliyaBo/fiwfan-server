const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
    await mongoose.connect(process.env.DATABASE_URL);
    const Creator = require('./dist/app/models/creator.model').default;
    const User = require('./dist/app/models/user.model').default;

    // Find creators with gender "ผู้ชาย"
    const creators = await Creator.find({ gender: "ผู้ชาย" }, 'displayName gender isVerified isAcceptingWork user').populate('user', 'isActive username').lean();
    console.log("Creators with gender ผู้ชาย (total: " + creators.length + "):", JSON.stringify(creators, null, 2));

    // Find all unique genders
    const genders = await Creator.distinct('gender');
    console.log("All unique genders in DB:", genders);

    process.exit(0);
}

run().catch(console.error);
