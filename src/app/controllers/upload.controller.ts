import multer from 'multer';
import path from 'path';
import { s3 } from '../files/helper';
import { BUCKET_NAME } from '../files';

// Configure storage (Memory Storage)
const storage = multer.memoryStorage();

// Create upload middleware
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const uploadToS3 = async (file: Express.Multer.File): Promise<string> => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    const key = `uploads/${filename}`;

    const params = {
        Bucket: BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    };

    // AWS SDK v2
    await s3.upload(params).promise();

    // Construct S3 URL
    return `https://${BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${key}`;
};

export const handleUpload = async (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const url = await uploadToS3(req.file);
        res.json({ url });
    } catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({
            error: 'Failed to upload to S3',
            details: (error as any).message,
            code: (error as any).code
        });
    }
};

export const handleMultipleUpload = async (req: any, res: any) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }

    try {
        const uploadPromises = req.files.map((file: any) => uploadToS3(file));
        const urls = await Promise.all(uploadPromises);
        res.json({ urls });
    } catch (error) {
        console.error('Multiple upload failed:', error);
        res.status(500).json({
            error: 'Failed to upload files to S3',
            details: (error as any).message,
            code: (error as any).code
        });
    }
};
