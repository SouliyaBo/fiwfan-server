
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User, { Role } from '../app/models/user.model';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const createSuperAdmin = async () => {
    try {
        await mongoose.connect(process.env.DATABASE_URL as string);
        console.log('Connected to MongoDB');

        const username = 'superadmin';
        const password = 'password123'; // Default password
        const email = 'superadmin@fiwfan.local';

        const existingAdmin = await User.findOne({ username });
        if (existingAdmin) {
            console.log('Super Admin already exists');
            existingAdmin.role = Role.SUPER_ADMIN;
            await existingAdmin.save();
            console.log('Updated existing user to SUPER_ADMIN');
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newAdmin = new User({
                username,
                password: hashedPassword,
                email,
                role: Role.SUPER_ADMIN,
                displayName: 'Super Admin',
                permissions: [], // Super Admin has implicit all permissions
                isVerified: true
            });
            await newAdmin.save();
            console.log(`Super Admin created with username: ${username} and password: ${password}`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Error creating super admin:', error);
        process.exit(1);
    }
};

createSuperAdmin();
