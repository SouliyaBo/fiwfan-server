import { Request, Response } from 'express';
import Setting from '../models/setting.model';

import { LOCATIONS } from '../data/locations';

// Get available locations
export const getLocations = async (req: Request, res: Response) => {
    res.json(LOCATIONS);
};

// Get all settings (or specific one by query)
export const getSettings = async (req: Request, res: Response) => {
    try {
        const { key } = req.query;
        if (key) {
            const setting = await Setting.findOne({ key: key as string });
            return res.json(setting || { key, value: null });
        }
        const settings = await Setting.find({});
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Update or Create a setting
export const updateSetting = async (req: Request, res: Response) => {
    try {
        const { key, value, description } = req.body;

        if (!key) {
            return res.status(400).json({ message: 'Key is required' });
        }

        const setting = await Setting.findOneAndUpdate(
            { key },
            { value, description },
            { new: true, upsert: true } // Create if not exists
        );

        res.json(setting);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
