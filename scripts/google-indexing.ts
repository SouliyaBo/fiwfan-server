/**
 * Google Indexing API — Bulk URL Submission Script
 * 
 * Usage:
 *   1. Create a Service Account in Google Cloud Console
 *   2. Enable "Indexing API" in Google Cloud Console
 *   3. Add the service account email to Google Search Console as an owner
 *   4. Download the JSON key file and save as `google-service-account.json` in the server root
 *   5. Run: npx ts-node scripts/google-indexing.ts
 * 
 * This script will:
 *   - Fetch all creator profiles from the database
 *   - Submit each URL to Google's Indexing API for immediate crawling
 *   - Google typically indexes within 24-48 hours after submission
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import path from 'path';

dotenv.config();

const DOMAIN = 'https://phusao.com';
const KEY_FILE = path.join(__dirname, '..', 'google-service-account.json');

async function main() {
    // 1. Connect to Database
    console.log('🔗 Connecting to database...');
    await mongoose.connect(process.env.DATABASE_URL as string);
    console.log('✅ Connected to database');

    // 2. Fetch all creators
    const Creator = (await import('../src/app/models/creator.model')).default;
    const creators = await Creator.find({}).select('_id displayName').lean();
    console.log(`📋 Found ${creators.length} creators to submit`);

    // 3. Authenticate with Google
    let auth;
    try {
        auth = new google.auth.GoogleAuth({
            keyFile: KEY_FILE,
            scopes: ['https://www.googleapis.com/auth/indexing'],
        });
    } catch (error) {
        console.error('❌ Failed to load service account key file');
        console.error(`   Expected at: ${KEY_FILE}`);
        console.error('   Download from: Google Cloud Console > IAM > Service Accounts > Keys');
        process.exit(1);
    }

    const client = await auth.getClient();

    // 4. Submit URLs in batches
    const BATCH_SIZE = 10; // Google recommends max 200/day for new sites
    const DELAY_MS = 1000; // 1 second between requests

    let submitted = 0;
    let errors = 0;

    // Static pages first
    const staticUrls = [
        '/',
        '/profiles',
        '/agency',
        '/plans',
        '/jobs',
        '/leaderboard',
    ];

    console.log('\n📤 Submitting static pages...');
    for (const url of staticUrls) {
        try {
            const response = await client.request({
                url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
                method: 'POST',
                data: {
                    url: `${DOMAIN}${url}`,
                    type: 'URL_UPDATED',
                },
            });
            console.log(`  ✅ ${DOMAIN}${url} → ${(response as any).status}`);
            submitted++;
        } catch (error: any) {
            console.error(`  ❌ ${DOMAIN}${url} → ${error.message}`);
            errors++;
        }
        await sleep(DELAY_MS);
    }

    // Creator profile pages
    console.log('\n📤 Submitting creator profiles...');
    for (let i = 0; i < creators.length; i++) {
        const creator = creators[i];
        const url = `${DOMAIN}/sideline/${creator._id}`;

        try {
            const response = await client.request({
                url: 'https://indexing.googleapis.com/v3/urlNotifications:publish',
                method: 'POST',
                data: {
                    url: url,
                    type: 'URL_UPDATED',
                },
            });
            console.log(`  ✅ [${i + 1}/${creators.length}] ${creator.displayName} → ${(response as any).status}`);
            submitted++;
        } catch (error: any) {
            console.error(`  ❌ [${i + 1}/${creators.length}] ${creator.displayName} → ${error.message}`);
            errors++;
        }

        // Rate limiting
        if ((i + 1) % BATCH_SIZE === 0) {
            console.log(`  ⏳ Rate limit pause... (${i + 1}/${creators.length})`);
            await sleep(DELAY_MS * 3);
        } else {
            await sleep(DELAY_MS);
        }
    }

    // 5. Summary
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Results:`);
    console.log(`   ✅ Submitted: ${submitted}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📋 Total URLs: ${staticUrls.length + creators.length}`);
    console.log('='.repeat(50));
    console.log('\n💡 Google typically indexes within 24-48 hours.');
    console.log('   Check status at: https://search.google.com/search-console');

    await mongoose.disconnect();
}

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

main().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
});
