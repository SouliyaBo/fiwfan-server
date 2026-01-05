import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-random.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

// Create upload middleware
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

export const handleUpload = (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct URL (assuming server runs on localhost:3001)
    const protocol = req.protocol;
    const host = req.get('host');
    const url = `${protocol}://${host}/uploads/${req.file.filename}`;

    res.json({ url });
};
