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
exports.deleteS3File = exports.getSignedImageUrl = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const s3 = new aws_sdk_1.default.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    signatureVersion: "v4",
});
const getSignedImageUrl = (bucket_1, fileName_1, fileType_1, ...args_1) => __awaiter(void 0, [bucket_1, fileName_1, fileType_1, ...args_1], void 0, function* (bucket, fileName, fileType, folder = "images") {
    try {
        const key = `${folder}/${fileName}`;
        const uploadUrl = s3.getSignedUrl("putObject", {
            Bucket: bucket,
            Key: key,
            ContentType: fileType,
            Expires: 1000,
        });
        // Construct Public URL
        // Format: https://{bucket}.s3.{region}.amazonaws.com/{key}
        const publicUrl = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
        return { uploadUrl, publicUrl, key };
    }
    catch (error) {
        console.log(error);
        return null;
    }
});
exports.getSignedImageUrl = getSignedImageUrl;
const deleteS3File = (bucket, key) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield s3.deleteObject({
            Bucket: bucket,
            Key: key,
        }).promise();
    }
    catch (error) {
        console.error("Error deleting file from S3:", error);
        // We might not want to throw here to allow DB deletion to proceed, 
        // or arguably we should log it and maybe alert. 
        // For now, logging error is sufficient.
    }
});
exports.deleteS3File = deleteS3File;
