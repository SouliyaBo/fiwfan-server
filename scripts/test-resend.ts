import { Resend } from 'resend';
import dotenv from 'dotenv';
import path from 'path';

// Load .env - try default location first
const result = dotenv.config();

if (result.error) {
    // If not found, try explicit path
    dotenv.config({ path: path.join(__dirname, '../.env') });
}

const resend = new Resend(process.env.RESEND_API_KEY);

const testEmail = async () => {
    console.log("Testing Resend API Key:", process.env.RESEND_API_KEY ? "Found" : "Missing");

    // Now trying to send to the user's email with the verified domain
    const recipient = 'loveii.paksan@gmail.com';
    const sender = 'noreply@phusao.com'; // Verified root domain

    console.log(`Sending from ${sender} to ${recipient}`);

    try {
        const { data, error } = await resend.emails.send({
            from: `Phusao Test <${sender}>`,
            to: [recipient],
            subject: 'Test Email from Phusao (Verified Domain)',
            html: '<p>If you see this, your Domain Verification is working!</p>'
        });

        if (error) {
            console.error("❌ Send Failed:", error);
            return;
        }

        console.log("✅ Email Sent Successfully!");
        console.log("ID:", data?.id);
    } catch (err) {
        console.error("❌ Unexpected Error:", err);
    }
};

testEmail();
