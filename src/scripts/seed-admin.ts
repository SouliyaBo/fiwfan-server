
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../configs/database'; // Use the shared config
import User from '../app/models/user.model';
import bcrypt from 'bcrypt';

dotenv.config();

const seedAdmin = async () => {
    try {
        await connectDB();
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ username: 'admin' });
        if (existingAdmin) {
            console.log('Admin already exists');
        } else {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await User.create({
                username: 'admin',
                email: 'admin@fiwfan.app',
                password: hashedPassword,
                displayName: 'Super Admin',
                role: 'ADMIN',
                isCreator: false
            });
            console.log('Admin user created: admin / password123');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error seeding admin:', error);
        process.exit(1);
    }
};

seedAdmin();
