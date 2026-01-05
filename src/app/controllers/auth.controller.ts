import { Request, Response } from 'express';
import User, { Role } from '../models/user.model';
import Creator from '../models/creator.model';
import Agency from '../models/agency.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export const forgotPassword = async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate token
        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetPasswordExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpires = new Date(resetPasswordExpires); // Use Date object

        await user.save();

        // In a real app, send email here.
        // For this demo/dev, return the token so frontend can use it.
        // Construct the reset URL (frontend route)
        const resetUrl = `http://localhost:3000/auth?mode=reset&token=${resetToken}`;

        res.status(200).json({
            success: true,
            data: "Email sent (simulated)",
            browsingUrl: resetUrl // Frontend needs the RAW token, not the hashed one
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const resetPassword = async (req: Request, res: Response) => {
    try {
        const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpires: { $gt: Date.now() }
        }).select("+resetPasswordToken +resetPasswordExpires +password"); // Select hidden fields

        if (!user) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        // Set new password
        user.password = await bcrypt.hash(req.body.password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        res.status(200).json({
            success: true,
            token,
            user
        });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, role, username, creatorType } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        let finalRole = role || Role.USER;
        // If user selected "CREATOR" (Provider) + "AGENCY" sub-type
        if (role === Role.CREATOR && creatorType === 'AGENCY') {
            finalRole = Role.AGENCY;
        }

        const newUser = new User({
            email,
            password: hashedPassword,
            username: username || email.split('@')[0],
            role: finalRole,
            isCreator: finalRole === Role.CREATOR // Only true models are 'isCreator'
        });

        await newUser.save();

        if (finalRole === Role.CREATOR) {
            const newCreator = new Creator({
                user: newUser._id,
                displayName: newUser.username
            });
            await newCreator.save();
        } else if (finalRole === Role.AGENCY) {
            // Create default agency profile for the owner
            const newAgency = new Agency({
                name: (newUser.username || "My") + " Agency",
                owner: newUser._id,
                description: "Agency description...",
                location: "Bangkok"
            });
            await newAgency.save();
        }

        const token = jwt.sign({ id: newUser._id, role: newUser.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: { id: newUser._id, username: newUser.username, role: newUser.role }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        console.log(req.body);
        const { email, username, password } = req.body;
        const identifier = email || username;

        if (!identifier || !password) {
            return res.status(400).json({ message: 'Please provide email/username and password' });
        }

        const user = await User.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });

        if (!user || !user.password) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        console.log(isMatch);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                avatarUrl: user.avatarUrl,
                displayName: user.displayName,
                email: user.email,
                province: user.province
            }
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const telegramLogin = async (req: Request, res: Response) => {
    try {
        const { id, first_name, username, photo_url, auth_date, hash } = req.body;
        const botToken = process.env.TELEGRAM_BOT_TOKEN;

        if (!botToken) {
            return res.status(500).json({ message: 'Server configuration error: TELEGRAM_BOT_TOKEN missing' });
        }

        // 1. Verify Hash
        const dataCheckArr = [];
        if (auth_date) dataCheckArr.push(`auth_date=${auth_date}`);
        if (first_name) dataCheckArr.push(`first_name=${first_name}`);
        if (id) dataCheckArr.push(`id=${id}`);
        if (photo_url) dataCheckArr.push(`photo_url=${photo_url}`);
        if (username) dataCheckArr.push(`username=${username}`);

        // Telegram requires alphabetical sort
        dataCheckArr.sort();
        const dataCheckString = dataCheckArr.join('\n');

        const secretKey = crypto.createHash('sha256').update(botToken).digest();
        const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

        // Allow bypass in development
        if (process.env.NODE_ENV === 'development' && hash === 'mock_hash_for_dev') {
            // Bypass for testing
        } else if (hmac !== hash) {
            return res.status(401).json({ message: 'Invalid Telegram authentication' });
        }

        // 2. Check stale data (optional but recommended) - prohibit login if auth_date is older than 24h
        const now = Math.floor(Date.now() / 1000);
        if (now - auth_date > 86400) {
            return res.status(401).json({ message: 'Authentication data is outdated' });
        }

        // 3. Find or Create User
        let user = await User.findOne({ telegramId: id.toString() });

        if (!user) {
            // Check if user already exists with this generic email? (unlikely for Telegram login unless linked)
            // Create new user
            user = new User({
                telegramId: id.toString(),
                telegramUsername: username,
                telegramPhotoUrl: photo_url,
                displayName: first_name,
                username: username || `user_${id}`,
                role: Role.USER, // Default to USER
                email: `${id}@telegram.user`, // Placeholder email or handle differently
                isCreator: false
            });
            await user.save();
        } else {
            // Update info
            user.telegramUsername = username;
            user.telegramPhotoUrl = photo_url;
            await user.save();
        }

        // 4. Generate Token
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        res.json({
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
                avatarUrl: user.avatarUrl || user.telegramPhotoUrl,
                displayName: user.displayName,
                email: user.email
            }
        });

    } catch (error: any) {
        console.error("Telegram Login Error:", error);
        res.status(500).json({ message: error.message });
    }
};
