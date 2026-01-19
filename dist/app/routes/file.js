"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const files_1 = require("../files");
const router = express_1.default.Router();
router.post('/presign-url', files_1.preSignedUrl);
exports.default = router;
