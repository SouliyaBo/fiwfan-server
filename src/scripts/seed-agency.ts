
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../configs/database';
import Agency from '../app/models/agency.model';
import Creator from '../app/models/creator.model';

dotenv.config();

const seedAgencies = async () => {
    try {
        await connectDB();
        console.log("Connected to DB");

        // 1. Create Sample Agency
        const agencyName = "SuperModel Agency";
        let agency = await Agency.findOne({ name: agencyName });

        if (!agency) {
            agency = await Agency.create({
                name: agencyName,
                description: "Top tier models in Bangkok",
                location: "Bangkok",
                logoUrl: "" // Optional
            });
            console.log("Created Agency:", agency.name);
        } else {
            console.log("Agency exists:", agency.name);
        }

        // 2. Assign some creators to this agency
        // Find creators who don't have an agency yet
        const creators = await Creator.find({ agency: { $exists: false } }).limit(5);

        if (creators.length === 0) {
            console.log("No available creators to assign.");
        } else {
            const creatorIds = creators.map((c: any) => c._id);
            await Creator.updateMany(
                { _id: { $in: creatorIds } },
                { $set: { agency: agency?._id } }
            );
            console.log(`Assigned ${creators.length} creators to ${agency?.name}`);
        }

        process.exit(0);
    } catch (error) {
        console.error("Error seeding agencies:", error);
        process.exit(1);
    }
};

seedAgencies();
