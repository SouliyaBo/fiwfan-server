import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
    key: string;
    value: string;
    description?: string;
    updatedAt: Date;
}

const SettingSchema: Schema = new Schema({
    key: { type: String, required: true, unique: true },
    value: { type: String, required: true },
    description: { type: String },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model<ISetting>('Setting', SettingSchema);
