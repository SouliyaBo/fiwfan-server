import { Request, Response } from 'express';
import configs from '../../configs';
import { getSignedImageUrl } from './helper';

export const BUCKET_NAME = "fiwfan-bucket";

export const preSignedUrl = async (req: Request, res: Response) => {
    try {
        const { fileName, fileType, folder } = req.body;

        if (!fileName || !fileType) {
            return res.status(configs.BAD_REQUEST_NUMBER).json({
                error: true,
                errorCode: configs.INVALID_FILE_NAME,
                url: null
            });
        }

        const result = await getSignedImageUrl(BUCKET_NAME, fileName, fileType, folder);

        if (!result) {
            throw new Error("Failed to get signed URL");
        }

        return res.status(configs.SUCCESS_NUMBER).json({
            error: false,
            errorCode: "",
            uploadUrl: result.uploadUrl,
            publicUrl: result.publicUrl,
            key: result.key
        });
    } catch (error) {
        console.log(error);
        return res.status(configs.INTERNAL_SERVER_ERROR_NUMBER).json({
            error: true,
            errorCode: configs.INTERNAL_SERVER_ERROR,
            url: null
        });
    }
};