import mongoose, { Document, Schema } from 'mongoose';

export interface IStory extends Document {
    creator: mongoose.Types.ObjectId;
    mediaUrl: string;
    mediaType: 'image' | 'video';
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}

const StorySchema: Schema = new Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    mediaUrl: { type: String, required: true },
    mediaType: { type: String, enum: ['image', 'video'], default: 'image' },
    expiresAt: { type: Date, default: () => Date.now() + 24 * 60 * 60 * 1000 } // Depends on server time, ideally use explicit setting
}, {
    timestamps: true
});

// Index for automatic deletion after expiration
StorySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IStory>('Story', StorySchema);
