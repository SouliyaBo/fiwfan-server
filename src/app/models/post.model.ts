import mongoose, { Document, Schema } from 'mongoose';

export interface IPost extends Document {
    creator: mongoose.Types.ObjectId;
    media: { url: string; type: 'IMAGE' | 'VIDEO' }[];
    caption?: string;
    likes: number;
    createdAt: Date;
    updatedAt: Date;
}

const PostSchema: Schema = new Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    media: [{
        url: { type: String, required: true },
        type: { type: String, enum: ['IMAGE', 'VIDEO'], default: 'IMAGE' }
    }],
    caption: { type: String },
    likes: { type: Number, default: 0 }
}, {
    timestamps: true
});

export default mongoose.model<IPost>('Post', PostSchema);
