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
exports.preSignedUrl = exports.BUCKET_NAME = void 0;
const configs_1 = __importDefault(require("../../configs"));
const helper_1 = require("./helper");
exports.BUCKET_NAME = "fiwfan-bucket";
const preSignedUrl = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fileName, fileType, folder } = req.body;
        if (!fileName || !fileType) {
            return res.status(configs_1.default.BAD_REQUEST_NUMBER).json({
                error: true,
                errorCode: configs_1.default.INVALID_FILE_NAME,
                url: null
            });
        }
        const result = yield (0, helper_1.getSignedImageUrl)(exports.BUCKET_NAME, fileName, fileType, folder);
        if (!result) {
            throw new Error("Failed to get signed URL");
        }
        return res.status(configs_1.default.SUCCESS_NUMBER).json({
            error: false,
            errorCode: "",
            uploadUrl: result.uploadUrl,
            publicUrl: result.publicUrl,
            key: result.key
        });
    }
    catch (error) {
        console.log(error);
        return res.status(configs_1.default.INTERNAL_SERVER_ERROR_NUMBER).json({
            error: true,
            errorCode: configs_1.default.INTERNAL_SERVER_ERROR,
            url: null
        });
    }
});
exports.preSignedUrl = preSignedUrl;
