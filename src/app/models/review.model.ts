import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
    creator: mongoose.Types.ObjectId;
    user: mongoose.Types.ObjectId;
    rating: number;
    accuracyRating?: number;
    serviceRating?: number;
    valueRating?: number;
    title?: string;
    comment?: string;
    images?: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema: Schema = new Schema({
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'Creator', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, default: 5 }, // Overall Rating
    // Detailed Ratings
    accuracyRating: { type: Number, default: 5 },
    serviceRating: { type: Number, default: 5 },
    valueRating: { type: Number, default: 5 },
    title: { type: String },
    comment: { type: String },
    images: [{ type: String }] // Array of image URLs
}, {
    timestamps: true
});

export default mongoose.model<IReview>('Review', ReviewSchema);
