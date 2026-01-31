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
exports.sendVerificationEmail = exports.sendEmail = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Initialize SES
const ses = new aws_sdk_1.default.SES({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-southeast-1'
});
const sendEmail = (to, subject, body) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Source: process.env.AWS_SENDER_EMAIL || 'noreply@phusao.com', // Replace with your verified sender email
        Destination: {
            ToAddresses: [to]
        },
        Message: {
            Subject: {
                Data: subject
            },
            Body: {
                Html: {
                    Data: body
                }
            }
        }
    };
    try {
        const result = yield ses.sendEmail(params).promise();
        console.log(`Email sent to ${to}: ${result.MessageId}`);
        return result;
    }
    catch (error) {
        console.error(`Error sending email to ${to}:`, error);
        // For development/sandbox safety, we might fail silently or just log
        // But throwing helps debug
        throw error;
    }
});
exports.sendEmail = sendEmail;
const sendVerificationEmail = (to, token) => __awaiter(void 0, void 0, void 0, function* () {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyLink = `${frontendUrl}/auth/verify?token=${token}`;
    const emailBody = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
            <div style="text-align: center; padding: 20px 0; border-bottom: 1px solid #eee;">
                <h2 style="color: #F84E6E; margin: 0;">ยินดีต้อนรับสู่ Phusao!</h2>
            </div>
            
            <div style="padding: 30px 20px;">
                <p style="font-size: 16px;">สวัสดีครับ,</p>
                <p style="font-size: 16px;">ขอบคุณที่สมัครสมาชิกกับ Phusao เพื่อความปลอดภัยและการใช้งานที่เต็มรูปแบบ กรุณายืนยันอีเมลของคุณโดยคลิกที่ปุ่มด้านล่างนี้:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verifyLink}" style="background-color: #F84E6E; color: white; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(248, 78, 110, 0.2);">ยืนยันอีเมล</a>
                </div>
                
                <p style="font-size: 14px; color: #666; margin-top: 30px;">
                    หากคุณไม่สามารถคลิกปุ่มได้ สามารถคัดลอกลิงก์ด้านล่างไปวางในเบราว์เซอร์ของคุณ:<br>
                    <a href="${verifyLink}" style="color: #F84E6E; word-break: break-all;">${verifyLink}</a>
                </p>
            </div>

            <div style="padding: 20px; background-color: #f9f9f9; border-radius: 8px; margin-top: 20px; font-size: 14px; color: #555;">
                <p style="margin: 0; font-weight: bold;">มีคำถามหรือข้อสงสัย?</p>
                <p style="margin: 5px 0 0 0;">
                    สามารถติดต่อแอดมินได้ตลอด 24 ชั่วโมงที่อีเมล: 
                    <a href="mailto:admin@phusao.com" style="color: #F84E6E; text-decoration: none;">admin@phusao.com</a>
                </p>
            </div>

            <div style="text-align: center; padding-top: 30px; font-size: 14px; color: #888;">
                <p style="margin-bottom: 5px;">ขอแสดงความนับถือ,</p>
                <p style="margin-top: 0; font-weight: bold; color: #F84E6E;">ทีมงาน Phusao.com</p>
                <p style="font-size: 12px; margin-top: 20px; color: #aaa;">
                    หากคุณไม่ได้เป็นผู้ทำการสมัครสมาชิกนี้ กรุณาเพิกเฉยต่ออีเมลฉบับนี้
                </p>
            </div>
        </div>
    `;
    return (0, exports.sendEmail)(to, 'ยืนยันอีเมลของคุณ - Phusao', emailBody);
});
exports.sendVerificationEmail = sendVerificationEmail;
