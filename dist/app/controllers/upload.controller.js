"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleMultipleUpload = exports.handleUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const helper_1 = require("../files/helper");
const files_1 = require("../files");
// Configure storage (Memory Storage)
const storage = multer_1.default.memoryStorage();
// Create upload middleware
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const uploadToS3 = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path_1.default.extname(file.originalname);
    const filename = uniqueSuffix + ext;
    const key = `uploads/${filename}`;
    const params = {
        Bucket: files_1.BUCKET_NAME,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype
    };
    // AWS SDK v2
    yield helper_1.s3.upload(params).promise();
    // Construct S3 URL
    return `https://${files_1.BUCKET_NAME}.s3.ap-southeast-1.amazonaws.com/${key}`;
});
const handleUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const url = yield uploadToS3(req.file);
        res.json({ url });
    }
    catch (error) {
        console.error('Upload failed:', error);
        res.status(500).json({
            error: 'Failed to upload to S3',
            details: error.message,
            code: error.code
        });
    }
});
exports.handleUpload = handleUpload;
const handleMultipleUpload = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
    }
    try {
        const uploadPromises = req.files.map((file) => uploadToS3(file));
        const urls = yield Promise.all(uploadPromises);
        res.json({ urls });
    }
    catch (error) {
        console.error('Multiple upload failed:', error);
        res.status(500).json({
            error: 'Failed to upload files to S3',
            details: error.message,
            code: error.code
        });
    }
});
exports.handleMultipleUpload = handleMultipleUpload;
