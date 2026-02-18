
import { Request, Response } from 'express';
import User, { IUser, Role } from '../models/user.model';
import bcrypt from 'bcrypt';

export const createAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { username, password, permissions, displayName } = req.body;

        // Check if username exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            res.status(400).json({ error: 'Username already exists' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new User({
            username,
            password: hashedPassword,
            displayName: displayName || username,
            role: Role.ADMIN,
            permissions: permissions || [],
            email: `${username}@admin.local` // Dummy email for admin
        });

        await newAdmin.save();

        res.status(201).json({ message: 'Admin created successfully', admin: newAdmin });
    } catch (error) {
        console.error('Error creating admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAllAdmins = async (req: Request, res: Response): Promise<void> => {
    try {
        const admins = await User.find({ role: Role.ADMIN }).select('-password');
        res.status(200).json(admins);
    } catch (error) {
        console.error('Error fetching admins:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateAdminPermissions = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { permissions } = req.body;

        const admin = await User.findById(id);
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }

        if (admin.role !== Role.ADMIN) {
            res.status(400).json({ error: 'User is not an admin' });
            return;
        }

        admin.permissions = permissions;
        await admin.save();

        res.status(200).json({ message: 'Permissions updated successfully', admin });
    } catch (error) {
        console.error('Error updating permissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const deleteAdmin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const admin = await User.findByIdAndDelete(id);

        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }

        res.status(200).json({ message: 'Admin deleted successfully' });
    } catch (error) {
        console.error('Error deleting admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

export const getAdminProfile = async (req: Request | any, res: Response): Promise<void> => {
    try {
        const admin = await User.findById(req.user.id).select('-password');
        if (!admin) {
            res.status(404).json({ error: 'Admin not found' });
            return;
        }
        res.status(200).json(admin);
    } catch (error) {
        console.error('Error fetching admin profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
